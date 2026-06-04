import { useEffect, useState, useCallback } from "react"

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
    if (!token) return

    let isMounted = true

    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await getUsersRequest(token)

        if (isMounted) setUsers(data)
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to fetch users")
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchUsers()

    return () => {
      isMounted = false
    }
  }, [token])

  const updateUserRole = useCallback(
    async (userId, mutation) => {
      setActionInProgress(userId)
      setError(null)

      try {
        const res = await mutation(userId, token)

        setUsers((prev) => prev.map((u) => (u._id === userId ? res.user : u)))
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to update user")
      } finally {
        setActionInProgress(null)
      }
    },
    [token],
  )

  const getRoleStyles = (role) =>
    role === "superadmin"
      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
      : role === "admin"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
        : "border-white/10 bg-white/5 text-zinc-300"

  const renderActions = (user) => {
    const canManage =
      currentUser?.role === "superadmin" && currentUser?._id !== user._id

    if (!canManage) {
      return <span className="text-sm text-zinc-500">No actions</span>
    }

    return (
      <div className="flex flex-wrap gap-2">
        {user.role === "user" && (
          <button
            onClick={() => updateUserRole(user._id, promoteUserRequest)}
            disabled={actionInProgress === user._id}
            className="rounded-full bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {actionInProgress === user._id ? "Promoting..." : "Promote"}
          </button>
        )}

        {user.role === "admin" && (
          <button
            onClick={() => updateUserRole(user._id, demoteUserRequest)}
            disabled={actionInProgress === user._id}
            className="rounded-full bg-rose-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-400 disabled:opacity-50"
          >
            {actionInProgress === user._id ? "Demoting..." : "Demote"}
          </button>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-bold">Users</h1>

        {loading && <p className="text-zinc-400">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-zinc-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getRoleStyles(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">{renderActions(user)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

export default Users
