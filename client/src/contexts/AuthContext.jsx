import { createContext, useContext, useEffect, useState } from "react"
import { loginRequest, registerRequest } from "../services/authService"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user")

    return storedUser ? JSON.parse(storedUser) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem("token"))

  const register = async (formData) => {
    const response = await registerRequest(formData)

    return response.user
  }

  const login = async (credentials) => {
    const response = await loginRequest(credentials)
    const authenticatedUser = response.user
    const authToken = response.token

    setUser(authenticatedUser)
    setToken(authToken)

    localStorage.setItem("user", JSON.stringify(authenticatedUser))
    localStorage.setItem("token", authToken)

    return authenticatedUser
  }

  const logout = async () => {
    setUser(null)
    setToken(null)

    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
