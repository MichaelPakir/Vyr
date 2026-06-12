import { useNavigate } from "react-router-dom"
import CreateAccountForm from "../components/CreateAccountForm"
import { useAuth } from "../contexts/useAuth"

const Register = () => {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (formData) => {
    try {
      await register(formData)

      navigate("/dashboard")
    } catch (error) {
      console.error(error)
    }
  }

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle()

      navigate("/dashboard")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <CreateAccountForm
      title="Create Account"
      subtitle="Register to access your support dashboard."
      buttonText="Create Account"
      onSubmit={handleRegister}
      showGoogleSignIn
      onGoogleSignIn={handleGoogleRegister}
      fields={[
        {
          name: "name",
          label: "Name",
          type: "text",
          placeholder: "Juan Dela Cruz",
        },
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

export default Register
