import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/useAuth"

const AdminRoutes = () => {
  const { loading, user } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to={"/login"} replace />
  }

  if (!["admin", "superadmin"].includes(user.role)) {
    return <Navigate to={"/"} replace />
  }

  return <Outlet />
}

export default AdminRoutes
