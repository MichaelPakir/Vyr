import TicketList from "../components/tickets/TicketList"

const Dashboard = () => {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <TicketList />
      </div>
    </main>
  )
}

export default Dashboard
