import { createContext, useContext, useEffect, useState } from "react"
import { loginRequest, registerRequest } from "../services/authService"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const register = async (formData) => {
    const newUser = await registerRequest(formData)

    setUser(newUser)

    localStorage.setItem("user", JSON.stringify(newUser))

    return newUser
  }

  const login = async (credentials) => {
    const userData = await loginRequest(credentials)
    setUser(userData)

    localStorage.setItem("user", JSON.stringify(userData))
    console.log("LOCAL STORAGE:", localStorage.getItem("user"))
  }

  const logout = () => {
    setUser(null)

    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
