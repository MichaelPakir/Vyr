import { useAuth } from "../contexts/AuthContext"

const Dashboard = () => {
  const { user } = useAuth()
  const userName = user?.name
  const userRole = user?.role

  return (
    <div>
      <p>
        Welcome, {userRole}: {userName}!
      </p>
    </div>
  )
}

export default Dashboard
