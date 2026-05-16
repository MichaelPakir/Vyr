import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { API_BASE_URL } from "../../services/apiConfig"
import TicketForm from "./TicketForm"
import { Link } from "react-router-dom"

const TicketList = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { token, user } = useAuth()

  const fetchTickets = useCallback(async () => {
    const endpoint =
      user && ["admin", "superadmin"].includes(user.role)
        ? `${API_BASE_URL}/api/tickets`
        : `${API_BASE_URL}/api/tickets/my`

    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    const isJson = (res.headers.get("content-type") || "").includes(
      "application/json",
    )

    if (!res.ok) {
      const errorBody = isJson ? await res.json() : await res.text()

      throw new Error(errorBody.message || errorBody || `HTTP ${res.status}`)
    }

    const data = isJson ? await res.json() : {}

    setTickets(data.tickets || [])
  }, [token, user])

  useEffect(() => {
    if (!token) return

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        await fetchTickets()
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, fetchTickets])

  const handleCreateTicket = async (ticketData) => {
    try {
      setError(null)
      const opts = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      if (ticketData instanceof FormData) {
        opts.body = ticketData
        // let browser set Content-Type with boundary
      } else {
        opts.headers["Content-Type"] = "application/json"
        opts.body = JSON.stringify({
          title: ticketData.title,
          description: ticketData.description,
        })
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets`, opts)

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || "Failed to create ticket")
      }

      setIsFormOpen(false)
      await fetchTickets()
    } catch (error) {
      console.error("Create ticket error:", error)
      setError(error.message)
    }
  }

  const statusColors = {
    Open: "border-blue-500/20 bg-blue-500/10 text-blue-300",

    Pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",

    "In Progress": "border-purple-500/20 bg-purple-500/10 text-purple-300",

    Resolved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Tickets
          </h2>

          <p className="mt-2 text-zinc-400">
            Track, organize, and manage support requests.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
        >
          + Create Ticket
        </button>
      </div>

      <TicketForm
        isFormOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTicket}
      />

      {loading ? (
        <div className="flex h-60 items-center justify-center rounded-3xl border border-white/10 bg-zinc-900">
          <p className="text-zinc-400">Loading tickets...</p>
        </div>
      ) : error ? (
        /* ERROR */
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/50 text-center">
          <div className="text-5xl">🎫</div>

          <h3 className="mt-5 text-xl font-semibold text-white">
            No tickets yet
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
            Create your first support ticket to start tracking issues and
            requests.
          </p>

          <button
            onClick={() => setIsFormOpen(true)}
            className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Create First Ticket
          </button>
        </div>
      ) : (
        /* TICKET GRID */
        <div className="grid gap-6 lg:grid-cols-2">
          {tickets.map((ticket) => {
            const id = ticket._id || ticket.id

            return (
              <article
                key={id}
                className="group rounded-3xl border border-white/10 bg-zinc-900 p-6 transition hover:border-white/20 hover:bg-zinc-900/80"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[ticket.status] || "border-white/10 bg-white/5 text-zinc-300"}`}
                  >
                    {ticket.status}
                  </span>

                  <span className="text-xs text-zinc-500">#{id}</span>
                </div>

                <h3 className="text-xl font-semibold tracking-tight text-white">
                  {ticket.title}
                </h3>

                <p className="mt-4 line-clamp-3 leading-relaxed text-zinc-400">
                  {ticket.description}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <Link
                    to={`/ticket-details/${id}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    View Details
                  </Link>

                  <div className="opacity-0 transition group-hover:opacity-100">
                    <span className="text-sm text-zinc-500">
                      Updated recently
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default TicketList
