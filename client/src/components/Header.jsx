import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useState } from "react"

const Header = () => {
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogout = async () => {
    setLoading(true)

    try {
      await logout({ callServer: true })

      navigate("/")
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">
            Vyr
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Home
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-white">{user.name}</p>

                <p className="text-xs capitalize text-zinc-500">{user.role}</p>
              </div>

              <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-sm font-semibold text-white md:flex">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="
                  rounded-xl
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-zinc-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                className="
                  rounded-xl
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-black
                  transition
                  hover:bg-zinc-200
                "
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
