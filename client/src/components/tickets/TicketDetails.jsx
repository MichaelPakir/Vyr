import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { useNavigate, useParams } from "react-router-dom"
import { io } from "socket.io-client"
import { useAuth } from "../../contexts/useAuth"
import { API_BASE_URL } from "../../services/apiConfig"

const TicketDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, logout, user } = useAuth()

  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [draftMessage, setDraftMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showNewRepliesIndicator, setShowNewRepliesIndicator] = useState(false)

  const [admins, setAdmins] = useState([])
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo?._id || "")
  const [assigning, setAssigning] = useState(false)
  const [assignMessage, setAssignMessage] = useState("")

  const replyTextareaRef = useRef(null)
  const commentsEndRef = useRef(null)
  const isNearBottomRef = useRef(true)
  const hasInitialScrollRef = useRef(false)

  const normalizeRole = (role) => role?.toLowerCase().trim()

  const isAdminRole = (role) => {
    const normalizedRole = normalizeRole(role)
    return normalizedRole === "admin" || normalizedRole === "superadmin"
  }

  const isSuperAdmin = normalizeRole(user?.role) === "superadmin"

  const statusColors = {
    Open: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    Pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
    Resolved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  }

  const getAttachmentUrl = (url) =>
    url?.startsWith("http") ? url : `${API_BASE_URL}${url}`

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (res.status === 401) {
        await logout({ callServer: false })
        navigate("/login")
        return
      }

      if (!res.ok) {
        const contentType = res.headers.get("content-type")

        const errorData = contentType?.includes("application/json")
          ? await res.json()
          : { message: "Failed to fetch ticket" }

        throw new Error(errorData.message || "Failed to fetch ticket")
      }

      const data = await res.json()
      setTicket(data.ticket)
      setAssignedTo(data.ticket?.assignedTo?._id || "")
    } catch (err) {
      setError(err.message || "Unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [id, token, logout, navigate])

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${id}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await res.json()
      setComments((prev) => {
        const prevIds = prev.map((comment) => comment._id).join("|")
        const nextIds = data.map((comment) => comment._id).join("|")

        if (prevIds === nextIds) {
          return prev
        }

        return data
      })
    } catch (error) {
      console.error(error)
    }
  }, [id, token])

  useEffect(() => {
    if (!token || !isSuperAdmin) return

    const fetchAdmins = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users?role=admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch admins")

        const data = await res.json()
        const adminUsers = (data.users || data).filter(
          (account) => normalizeRole(account.role) === "admin",
        )
        setAdmins(adminUsers)
      } catch (error) {
        console.error(error)
      }
    }

    fetchAdmins()
  }, [token, isSuperAdmin])

  useEffect(() => {
    if (!token) return

    const loadTicketData = async () => {
      await Promise.all([fetchTicket(), fetchComments()])
    }

    void loadTicketData()
  }, [fetchTicket, fetchComments, token])

  useEffect(() => {
    if (!token) return

    const intervalId = setInterval(() => {
      void fetchComments()
    }, 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [fetchComments, token])

  useEffect(() => {
    const updateNearBottomState = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const viewportHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const distanceFromBottom = documentHeight - (scrollTop + viewportHeight)

      const nearBottom = distanceFromBottom < 160
      isNearBottomRef.current = nearBottom

      if (nearBottom) {
        setShowNewRepliesIndicator(false)
      }
    }

    updateNearBottomState()
    window.addEventListener("scroll", updateNearBottomState, { passive: true })
    window.addEventListener("resize", updateNearBottomState)

    return () => {
      window.removeEventListener("scroll", updateNearBottomState)
      window.removeEventListener("resize", updateNearBottomState)
    }
  }, [])

  useEffect(() => {
    if (!token) return

    const socket = io(API_BASE_URL, {
      auth: { token },
    })

    socket.on("newComment", (incomingComment) => {
      const incomingTicketId =
        incomingComment.ticket?._id || incomingComment.ticket

      if (incomingTicketId?.toString() !== id) return

      setComments((prev) => {
        if (prev.some((comment) => comment._id === incomingComment._id)) {
          return prev
        }

        return [...prev, incomingComment].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        )
      })
    })

    socket.on("ticketUpdated", (updatedTicket) => {
      if (updatedTicket.id?.toString() !== id) return

      setTicket((prev) =>
        prev
          ? {
              ...prev,
              status: updatedTicket.status,
              updatedAt: updatedTicket.updatedAt,
            }
          : prev,
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [id, token])

  useLayoutEffect(() => {
    const textarea = replyTextareaRef.current
    if (!textarea) return

    textarea.style.height = "0px"
    const nextHeight = Math.min(textarea.scrollHeight, 240)
    textarea.style.height = `${nextHeight}px`
  }, [draftMessage])

  useEffect(() => {
    if (!comments.length) return

    const scrollToLatest = () => {
      commentsEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }

    if (!hasInitialScrollRef.current) {
      hasInitialScrollRef.current = true
      scrollToLatest()
      return
    }

    if (isNearBottomRef.current) {
      scrollToLatest()
      setShowNewRepliesIndicator(false)
      return
    }

    setShowNewRepliesIndicator(true)
  }, [comments])

  const isAdminView = user?.role === "admin" || user?.role === "superadmin"

  const isOwnMessage = (role) => {
    const normalizedRole = normalizeRole(role)

    return isAdminView
      ? normalizedRole === "user"
      : normalizedRole === "admin" || normalizedRole === "superadmin"
  }

  const handleSendComment = async (e) => {
    e.preventDefault()

    const message = draftMessage.trim()
    if (!message) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) {
        throw new Error("Failed to send comment")
      }

      const data = await res.json()
      const savedComment = data.comment

      if (data.ticket) {
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                status: data.ticket.status,
                updatedAt: data.ticket.updatedAt,
              }
            : prev,
        )
      }

      setComments((prev) => {
        if (prev.some((comment) => comment._id === savedComment._id)) {
          return prev
        }

        return [...prev, savedComment].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        )
      })

      setDraftMessage("")
      if (replyTextareaRef.current) {
        replyTextareaRef.current.style.height = "96px"
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleResolveTicket = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Resolved" }),
      })

      if (!res.ok) {
        throw new Error("Failed to resolve ticket")
      }

      const data = await res.json()
      setTicket(data.ticket)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAssignTicket = async (nextAssignedTo) => {
    if (
      !isSuperAdmin ||
      (nextAssignedTo && !admins.some((admin) => admin._id === nextAssignedTo))
    ) {
      return
    }

    const previousAssignedTo = assignedTo
    setAssignedTo(nextAssignedTo)
    setAssignMessage("")

    try {
      setAssigning(true)

      const res = await fetch(`${API_BASE_URL}/api/tickets/${id}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assigneeId: nextAssignedTo || null }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to assign ticket")
      }

      setTicket(data.ticket)
      setAssignedTo(data.ticket?.assignedTo?._id || "")
      setAssignMessage("Saved")
    } catch (err) {
      setAssignedTo(previousAssignedTo)
      setAssignMessage(err.message || "Failed to save")
      console.error(err)
    } finally {
      setAssigning(false)
    }
  }

  const handleJumpToLatest = () => {
    commentsEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
    setShowNewRepliesIndicator(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex h-96 items-center justify-center rounded-3xl border border-white/10 bg-zinc-900">
            <p className="text-zinc-400">Loading ticket details...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-red-300">
            <p className="mb-4 font-semibold">Error Loading Ticket</p>
            <p className="mb-6 text-sm">{error}</p>

            <button
              onClick={fetchTicket}
              className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/30"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!ticket) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/50 text-center">
            <div className="text-5xl">🎫</div>
            <p className="mt-4 text-zinc-400">Ticket not found</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {showNewRepliesIndicator && (
          <button
            type="button"
            onClick={handleJumpToLatest}
            className="group fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/15 bg-zinc-950/90 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/40 backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:bg-zinc-900 hover:shadow-black/60"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg leading-none transition-transform duration-200 group-hover:translate-y-0.5">
                ↓
              </span>
              <span>New replies</span>
            </span>
          </button>
        )}

        <div className="mb-10 border-b border-white/10 pb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-zinc-500">
                Ticket Details
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {ticket.title}
              </h1>
              <p className="mt-3 text-zinc-400">
                Full information about this support request.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  statusColors[ticket.status] ||
                  "border-white/10 bg-white/5 text-zinc-300"
                }`}
              >
                {ticket.status}
              </span>

              {isAdminView && ticket.status !== "Resolved" && (
                <button
                  type="button"
                  onClick={handleResolveTicket}
                  className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-400">
            {ticket.createdBy && (
              <div className="flex min-h-10 items-center gap-2">
                <span className="font-medium text-zinc-300">Created by:</span>{" "}
                {ticket.createdBy.name}
              </div>
            )}

            {ticket.createdAt && (
              <div className="flex min-h-10 items-center gap-2">
                <span className="font-medium text-zinc-300">Created:</span>{" "}
                {new Date(ticket.createdAt).toLocaleString()}
              </div>
            )}

            {isSuperAdmin && (
              <div className="flex min-h-10 flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-300">Assigned to:</span>

                <select
                  value={assignedTo}
                  onChange={(e) => handleAssignTicket(e.target.value)}
                  disabled={assigning || admins.length === 0}
                  className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Unassigned</option>
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name}
                    </option>
                  ))}
                </select>

                {assigning && (
                  <span className="text-xs text-zinc-500">Saving...</span>
                )}

                {!assigning && assignMessage && (
                  <span
                    className={`text-xs ${
                      assignMessage === "Saved"
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {assignMessage}
                  </span>
                )}

                {!assigning && admins.length === 0 && (
                  <span className="text-xs text-zinc-500">
                    No admins available
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Description
          </p>
          <p className="mt-4 whitespace-pre-wrap text-zinc-300">
            {ticket.description}
          </p>
        </div>

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-widest text-zinc-500">
              Attachments
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {ticket.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-800"
                >
                  {att.mimetype?.startsWith("image/") ? (
                    <>
                      <img
                        src={getAttachmentUrl(att.url)}
                        alt={att.filename}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImage(getAttachmentUrl(att.url))
                        }
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                      >
                        <span className="text-sm font-medium text-white">
                          View
                        </span>
                      </button>
                    </>
                  ) : (
                    <a
                      href={getAttachmentUrl(att.url)}
                      download={att.filename}
                      className="flex h-32 w-full items-center justify-center bg-zinc-800 px-3 py-2 text-center text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                    >
                      {att.filename}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-lg font-semibold">Discussion</h2>

          <div className="mt-4 space-y-4">
            {comments.map((comment) => {
              const isRight = isOwnMessage(comment.author?.role)
              const isAdmin = isAdminRole(comment.author?.role)

              return (
                <div
                  key={comment._id}
                  className={`flex ${isRight ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`w-fit max-w-[70%] rounded-2xl border p-4 ${
                      isAdmin
                        ? "border-blue-500/20 bg-blue-500/10"
                        : "border-emerald-500/20 bg-emerald-500/10"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isRight
                          ? "flex-row-reverse justify-between"
                          : "justify-between"
                      }`}
                    >
                      <p className="font-semibold">{comment.author?.name}</p>
                      <span className="text-xs text-zinc-400">
                        {comment.createdAt}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">
                      {comment.message}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={commentsEndRef} />
          </div>
        </div>

        <form
          onSubmit={handleSendComment}
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <textarea
            ref={replyTextareaRef}
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            placeholder="Write a reply..."
            rows={4}
            className="w-full resize-none overflow-y-auto bg-transparent text-sm text-white outline-none"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-4xl"
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-[90vh] max-w-4xl rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default TicketDetails
