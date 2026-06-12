import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/useAuth"

const ProtectedRoutes = () => {
  const { loading, user } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoutes
