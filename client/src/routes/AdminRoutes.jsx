import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const AdminRoutes = () => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to={"/login"} replace />
  }

  if (!["admin", "superadmin"].includes(user.role)) {
    return <Navigate to={"/"} replace />
  }

  return <Outlet />
}

export default AdminRoutes
