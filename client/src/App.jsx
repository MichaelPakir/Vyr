import { Routes, Route } from "react-router-dom"
import "./styles/index.css"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./components/Dashboard"
import ProtectedRoutes from "./routes/ProtectedRoutes"
import TicketDetails from "./components/tickets/TicketDetails"
import Users from "./pages/Users"
import AdminRoutes from "./routes/AdminRoutes"

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ticket-details/:id" element={<TicketDetails />} />
        </Route>

        <Route element={<AdminRoutes />}>
          <Route path="/users" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
