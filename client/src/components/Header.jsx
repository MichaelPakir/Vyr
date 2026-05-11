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
      navigate("/login")
      console.log("Logged out")
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-1xl text-red-400 font-bold">
      <Link to={"/"}>Go back</Link>

      {user ? (
        <button onClick={handleLogout}>
          {loading ? "Logging out..." : "Logout"}
        </button>
      ) : (
        <>
          <Link to={"/login"}>Login</Link>
          <Link to={"/register"}>Register</Link>
        </>
      )}
    </div>
  )
}

export default Header
