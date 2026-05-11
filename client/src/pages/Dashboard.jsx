import { useAuth } from "../contexts/AuthContext"
import TicketList from "../components/tickets/TicketList"

const Dashboard = () => {
  const { user } = useAuth()
  const userName = user?.name
  const userRole = user?.role

  return (
    <section>
      <p>
        Welcome, {userRole}: {userName}!
      </p>

      <div>
        <h1 className="text-2xl">Ticket Lists</h1>
        <TicketList />
      </div>
    </section>
  )
}

export default Dashboard
