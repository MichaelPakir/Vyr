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
      user && isAdminView
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
  }, [token, user, isAdminView])

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
    if (!token) return

    const timeoutId = window.setTimeout(() => {
      void loadTickets()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [token, loadTickets])

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
      setError(error.message)
    }
  }

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
    })
  }

  const renderStatusBadge = (status) => (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusColors[status] || "border-white/10 bg-white/5 text-zinc-300"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  )

  const renderPriorityBadge = (priority = "Normal") => (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        priorityColors[priority] || priorityColors.Normal
      }`}
    >
      {priority}
    </span>
  )

  const ticketCounts = {
    Open: tickets.filter((t) => t.status === "Open").length,
    "In Progress": tickets.filter((t) =>
      ["Pending", "In Progress"].includes(t.status),
    ).length,
    Resolved: tickets.filter((t) => t.status === "Resolved").length,
  }

  const metricCards = [
    ["Open", ticketCounts.Open],
    ["In Progress", ticketCounts["In Progress"]],
    ["Resolved", ticketCounts.Resolved],
  ]

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Tickets</h1>

          <p className="mt-2 text-zinc-400">
            {isAdminView
              ? "Live queue of customer requests across the support desk."
              : "Track and manage your support requests."}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsFormOpen(true)}
            className="rounded-md bg-white px-4 py-2 text-sm text-black"
          >
            + Create ticket
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
              className="rounded-lg border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs uppercase text-slate-400">{label}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      ) : loading && tickets.length === 0 ? (
        <p className="text-zinc-400">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="text-zinc-400">No tickets yet</p>
      ) : isAdminView ? (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-4">Ticket</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Priority</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Updated</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => {
                const id = ticket._id || ticket.id

                return (
                  <tr
                    key={id}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="px-4 py-4">
                      <Link
                        to={`/ticket-details/${id}`}
                        className="font-semibold text-white hover:text-zinc-300"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      {renderStatusBadge(ticket.status)}
                    </td>
                    <td className="px-4 py-4">
                      {renderPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-4 py-4">{getCustomerName(ticket)}</td>
                    <td className="px-4 py-4">
                      {formatDate(ticket.updatedAt || ticket.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {tickets.map((ticket) => {
            const id = ticket._id || ticket.id

            return (
              <article
                key={id}
                className="rounded-3xl border border-white/10 bg-zinc-900 p-6"
              >
                <h3 className="text-xl font-semibold text-white">
                  {ticket.title}
                </h3>

                <p className="mt-3 text-zinc-400">{ticket.description}</p>

                <Link
                  to={`/ticket-details/${id}`}
                  className="mt-6 inline-block text-sm text-white underline"
                >
                  View Details
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default TicketList
