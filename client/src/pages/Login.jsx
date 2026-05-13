import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import CreateAccountForm from "../components/CreateAccountForm"

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (formData) => {
    try {
      await login(formData)

      navigate("/dashboard")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <CreateAccountForm
      title="Welcome Back"
      subtitle="Login to continue managing tickets."
      buttonText="Login"
      onSubmit={handleLogin}
      fields={[
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "••••••••",
        },
      ]}
    />
  )
}

export default Login
