import { useAuth } from "../contexts/AuthContext"
import TicketList from "../components/tickets/TicketList"

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-zinc-500">
              Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Welcome back, {user?.name}
            </h1>

            <p className="mt-3 text-zinc-400">
              Manage and monitor support tickets efficiently.
            </p>
          </div>
        </div>

        <TicketList />
      </div>
    </main>
  )
}

export default Dashboard
