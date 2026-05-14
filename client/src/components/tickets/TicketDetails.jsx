import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
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

  const normalizeRole = (role) => role?.toLowerCase().trim()

  const isAdminRole = (role) => {
    const r = normalizeRole(role)
    return r === "admin" || r === "superadmin"
  }

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
      setComments(data)
    } catch (error) {
      console.error(error)
    }
  }, [id, token])

  useEffect(() => {
    if (!token) return
    fetchTicket()
    fetchComments()
  }, [fetchTicket, fetchComments, token])

  const isAdminView = user?.role === "admin" || user?.role === "superadmin"

  const isOwnMessage = (role) => {
    const r = normalizeRole(role)

    return isAdminView ? r === "user" : r === "admin" || r === "superadmin"
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

      setComments((prev) => [...prev, savedComment])
      setDraftMessage("")
    } catch (err) {
      console.error(err)
    }
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
        <div className="mb-10 border-b border-white/10 pb-8">
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

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Description
          </p>
          <p className="mt-4 whitespace-pre-wrap text-zinc-300">
            {ticket.description}
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold">Discussion</h2>

          <div className="mt-4 space-y-4">
            {comments.map((comment) => {
              const isRight = isOwnMessage(comment.author?.role)
              const isAdmin = isAdminRole(comment.author?.role)

              return (
                <div
                  key={comment._id}
                  className={`flex ${
                    isRight ? "justify-end" : "justify-start"
                  }`}
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
          </div>
        </div>

        <form
          onSubmit={handleSendComment}
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <textarea
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            placeholder="Write a reply..."
            className="h-24 w-full resize-none bg-transparent text-sm text-white outline-none"
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
    </main>
  )
}

export default TicketDetails
