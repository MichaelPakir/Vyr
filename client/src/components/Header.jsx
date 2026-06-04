import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/useAuth"
import { useState } from "react"

const Header = () => {
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigate = useNavigate()

  const navigationLinks = [
    { to: "/", label: "Home", visible: true },
    { to: "/dashboard", label: "Dashboard", visible: Boolean(user) },
    {
      to: "/users",
      label: "Users",
      visible: ["admin", "superadmin"].includes(user?.role),
    },
  ].filter((link) => link.visible)

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    setLoading(true)

    try {
      await logout({ callServer: true })

      closeMobileMenu()
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
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="text-xl font-bold tracking-tight text-white"
          >
            Vyr
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
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
                className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="
                  hidden
                  rounded-xl
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-zinc-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                  md:inline-flex
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="
                  hidden
                  rounded-xl
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-black
                  transition
                  hover:bg-zinc-200
                  md:inline-flex
                "
              >
                Register
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
          >
            {mobileMenuOpen ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-white/10 bg-zinc-950 px-6 py-4 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="rounded-xl px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header
