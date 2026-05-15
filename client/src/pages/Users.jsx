import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getUsersRequest } from "../services/usersService"

const Users = () => {
  const { token } = useAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsersRequest(token)
        setUsers(data)
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [token])

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header (matched to Dashboard) */}
        <div className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-zinc-500">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">Users</h1>

            <p className="mt-3 text-zinc-400">
              Manage registered users and their roles.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading && <p className="text-zinc-400">Loading users...</p>}

        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="rounded-lg border border-white/10 bg-white/5 p-5"
              >
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-zinc-400">{user.email}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                  {user.role}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Users
