import { useAuth } from "../contexts/AuthContext"

const Dashboard = () => {
  const { user } = useAuth()
  const userName = user?.name

  return (
    <div>
      <p>Welcome, {userName}!</p>
    </div>
  )
}

export default Dashboard
