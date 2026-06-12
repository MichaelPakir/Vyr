import { useNavigate } from "react-router-dom"
import CreateAccountForm from "../components/CreateAccountForm"
import { useAuth } from "../contexts/useAuth"

const Login = () => {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (formData) => {
    try {
      await login(formData)

      navigate("/dashboard")
    } catch (error) {
      console.error(error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()

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
      showGoogleSignIn
      onGoogleSignIn={handleGoogleLogin}
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
          placeholder: "Password",
        },
      ]}
    />
  )
}

export default Login
