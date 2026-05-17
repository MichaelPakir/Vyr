import { useEffect, useState } from "react"
import { useAuth } from "../contexts/useAuth"
import {
  getUsersRequest,
  promoteUserRequest,
  demoteUserRequest,
} from "../services/usersService"

const Users = () => {
  const { token, user: currentUser } = useAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionInProgress, setActionInProgress] = useState(null)

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

        {loading && <p className="text-zinc-400">Loading users...</p>}

        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="rounded-lg border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{user.name}</p>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                      {user.role}
                    </p>
                  </div>

                  {currentUser?.role === "superadmin" &&
                    currentUser._id !== user._id && (
                      <div className="flex gap-2">
                        {user.role === "user" && (
                          <button
                            onClick={async () => {
                              setActionInProgress(user._id)
                              setError(null)
                              try {
                                const res = await promoteUserRequest(
                                  user._id,
                                  token,
                                )
                                setUsers((prev) =>
                                  prev.map((u) =>
                                    u._id === user._id ? res.user : u,
                                  ),
                                )
                              } catch (error) {
                                setError(
                                  error.response?.data?.message ||
                                    "Failed to promote user",
                                )
                              } finally {
                                setActionInProgress(null)
                              }
                            }}
                            disabled={actionInProgress === user._id}
                            className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium"
                          >
                            {actionInProgress === user._id
                              ? "Promoting..."
                              : "Promote to admin"}
                          </button>
                        )}

                        {user.role === "admin" && (
                          <button
                            onClick={async () => {
                              setActionInProgress(user._id)
                              setError(null)
                              try {
                                const res = await demoteUserRequest(
                                  user._id,
                                  token,
                                )
                                setUsers((prev) =>
                                  prev.map((u) =>
                                    u._id === user._id ? res.user : u,
                                  ),
                                )
                              } catch (error) {
                                setError(
                                  error.response?.data?.message ||
                                    "Failed to demote user",
                                )
                              } finally {
                                setActionInProgress(null)
                              }
                            }}
                            disabled={actionInProgress === user._id}
                            className="rounded bg-red-600 px-3 py-1 text-sm font-medium"
                          >
                            {actionInProgress === user._id
                              ? "Demoting..."
                              : "Demote to user"}
                          </button>
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Users
