import { useAuth } from "../contexts/useAuth"
import { useNavigate } from "react-router-dom"
import CreateAccountForm from "../components/CreateAccountForm"

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (formData) => {
    try {
      await register(formData)

      navigate("/login")
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
          placeholder: "••••••••",
        },
      ]}
    />
  )
}

export default Register
