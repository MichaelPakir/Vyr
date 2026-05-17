import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/useAuth"
import { API_BASE_URL } from "../../services/apiConfig"
import TicketForm from "./TicketForm"

const statusLabels = {
  Open: "Open",
  Pending: "In progress",
  "In Progress": "In progress",
  Resolved: "Resolved",
}

const statusColors = {
  Open: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  Pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  "In Progress": "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  Resolved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
}

const priorityColors = {
  Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Normal: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  High: "border-orange-500/20 bg-orange-500/10 text-orange-300",
  Urgent: "border-red-500/25 bg-red-500/10 text-red-300",
}

const TicketList = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { token, user } = useAuth()
  const isAdminView = ["admin", "superadmin"].includes(user?.role)

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

    return data.tickets || []
  }, [token, user])

  const loadTickets = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)

      const nextTickets = await fetchTickets()
      setTickets(nextTickets)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [fetchTickets, token])

  useEffect(() => {
    if (!token) return undefined

    let ignore = false

    Promise.resolve()
      .then(async () => {
        setLoading(true)
        setError(null)

        const nextTickets = await fetchTickets()

        if (!ignore) {
          setTickets(nextTickets)
        }
      })
      .catch((error) => {
        if (!ignore) {
          setError(error.message)
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [fetchTickets, token])

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
      const nextTickets = await fetchTickets()
      setTickets(nextTickets)
    } catch (error) {
      console.error("Create ticket error:", error)
      setError(error.message)
    }
  }

  const ticketCounts = {
    Open: tickets.filter((ticket) => ticket.status === "Open").length,
    "In Progress": tickets.filter((ticket) =>
      ["Pending", "In Progress"].includes(ticket.status),
    ).length,
    Resolved: tickets.filter((ticket) => ticket.status === "Resolved").length,
  }

  const metricCards = [
    ["Open", ticketCounts.Open],
    ["In Progress", ticketCounts["In Progress"]],
    ["Resolved", ticketCounts.Resolved],
  ]

  const getCustomerName = (ticket) => {
    if (ticket.createdBy?.name) return ticket.createdBy.name
    if (ticket.createdByName) return ticket.createdByName
    return user?.name || "Customer"
  }

  const formatDate = (value) => {
    if (!value) return "Not updated"

    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Tickets
          </h1>

          <p className="mt-2 text-zinc-400">
            {isAdminView
              ? "Live queue of customer requests across the support desk."
              : "Track, organize, and manage your support requests."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadTickets()}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={loading ? "animate-spin" : ""}>R</span>
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
          >
            <span className="text-lg leading-none">+</span>
            Create ticket
          </button>
        </div>
      </div>

      <TicketForm
        isFormOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTicket}
      />

      {isAdminView && (
        <div className="grid gap-3 md:grid-cols-3">
          {metricCards.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10"
            >
              <p className="text-xs font-medium uppercase text-slate-400">
                {label}
              </p>
              <p className="mt-4 text-3xl font-bold tracking-tight text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      ) : loading && tickets.length === 0 ? (
        <div className="flex h-28 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
          <p className="text-sm text-zinc-400">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.03] text-center">
          <h3 className="text-xl font-semibold text-white">No tickets yet</h3>

          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
            Create your first support ticket to start tracking issues and
            requests.
          </p>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="mt-6 rounded-md border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Create First Ticket
          </button>
        </div>
      ) : isAdminView ? (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  {["Ticket", "Status", "Priority", "Customer", "Updated"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-4 py-4 text-xs font-semibold uppercase text-slate-500"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {tickets.map((ticket) => {
                  const id = ticket._id || ticket.id
                  const statusLabel = statusLabels[ticket.status] || ticket.status
                  const priority = ticket.priority || "Urgent"

                  return (
                    <tr
                      key={id}
                      className="transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4">
                        <Link
                          to={`/ticket-details/${id}`}
                          className="font-semibold text-white transition hover:text-zinc-300"
                        >
                          {ticket.title}
                        </Link>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusColors[ticket.status] ||
                            "border-white/10 bg-white/5 text-zinc-300"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            priorityColors[priority] || priorityColors.Normal
                          }`}
                        >
                          {priority}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-white">
                        {getCustomerName(ticket)}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-400">
                        {formatDate(ticket.updatedAt || ticket.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusColors[ticket.status] ||
                      "border-white/10 bg-white/5 text-zinc-300"
                    }`}
                  >
                    {statusLabels[ticket.status] || ticket.status}
                  </span>

                  <span className="max-w-36 truncate text-xs text-zinc-500">
                    #{id}
                  </span>
                </div>

                <h3 className="text-xl font-semibold tracking-tight text-white">
                  {ticket.title}
                </h3>

                <p className="mt-4 line-clamp-3 leading-relaxed text-zinc-400">
                  {ticket.description}
                </p>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <Link
                    to={`/ticket-details/${id}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    View Details
                  </Link>

                  <span className="text-sm text-zinc-500">
                    {formatDate(ticket.updatedAt || ticket.createdAt)}
                  </span>
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
