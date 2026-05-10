import { Routes, Route } from "react-router-dom"
import "./styles/index.css"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import ProtectedRoutes from "./routes/ProtectedRoutes"

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
