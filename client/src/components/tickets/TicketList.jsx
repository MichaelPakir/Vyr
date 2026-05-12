import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { API_BASE_URL } from "../../services/apiConfig"

const TicketList = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { token, user } = useAuth()

  useEffect(() => {
    const fetchTickets = async () => {
      if (!token) return

      try {
        setLoading(true)
        setError(null)

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
        const ct = res.headers.get("content-type") || ""
        if (!res.ok) {
          const errorBody = ct.includes("application/json")
            ? await res.json()
            : await res.text()
          throw new Error(
            errorBody.message || errorBody || `HTTP ${res.status}`,
          )
        }
        const data = ct.includes("application/json")
          ? await res.json()
          : JSON.parse("{}")
        console.log(res.status, ct, data)

        setTickets(data.tickets || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [token, user])

  const statusColors = {
    Open: "bg-blue-100 text-blue-700",
    Pending: "bg-purple-100 text-purple-700",
    "In Progress": "bg-purple-100 text-purple-700",
    Resolved: "bg-green-100 text-green-700",
  }

  return (
    <section className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              🎫 Support Tickets
            </h1>
            <p className="mt-2 text-slate-500">
              Organize and track incoming issues
            </p>
          </div>

          <button className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-lg transition hover:bg-blue-700">
            + New Ticket
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Loading tickets…
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No tickets yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {tickets.map((ticket) => {
              const id = ticket._id || ticket.id
              return (
                <div
                  key={id}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[ticket.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <h2 className="mb-3 text-xl font-bold text-slate-800">
                    {ticket.title}
                  </h2>

                  <p className="mb-6 leading-relaxed text-slate-600">
                    {ticket.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                      View Details
                    </button>

                    <p className="text-sm text-slate-400">Ticket #{id}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default TicketList
