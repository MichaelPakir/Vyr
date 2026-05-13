import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../services/apiConfig"
import { useAuth } from "../../contexts/AuthContext"

const TicketDetails = () => {
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const { token, logout, user } = useAuth()
  const navigate = useNavigate()
  const [comments] = useState([
    {
      id: 1,
      user: "Admin",
      message: "We are looking into this issue.",
      createdAt: "2h ago",
      role: "admin",
    },
    {
      id: 2,
      user: "John Doe",
      message: "Thanks, this is blocking my login.",
      createdAt: "1h ago",
      role: "user",
    },
  ])

  const fetchTicket = async () => {
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
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchTicket()
    }
  }, [id, token])

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
              onClick={() => fetchTicket()}
              className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/30"
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

  const isAdminView = user?.role === "admin" || user?.role === "superadmin"

  const isOwnMessage = (role) => {
    if (isAdminView) return role === "user"

    return role !== "user"
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

          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-zinc-300">
            {ticket.description}
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Discussion</h2>

          <div className="mt-4 space-y-4">
            {comments.map((c) => {
              const isRight = isOwnMessage(c.role)

              return (
                <div
                  key={c.id}
                  className={`flex ${isRight ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`w-fit max-w-[70%] rounded-2xl border p-4 ${
                      c.role === "admin"
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
                      <p className="font-semibold">{c.user}</p>
                      <span className="text-xs text-zinc-400">
                        {c.createdAt}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">
                      {c.message}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <textarea
            placeholder="Write a reply..."
            className="h-24 w-full resize-none bg-transparent text-sm text-white outline-none"
          />

          <div className="mt-3 flex justify-end">
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200">
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default TicketDetails
