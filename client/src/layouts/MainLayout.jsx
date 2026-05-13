import Header from "../components/Header"
import { Outlet } from "react-router-dom"

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
