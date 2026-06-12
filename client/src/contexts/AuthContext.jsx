import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"
import {
  getCurrentUserRequest,
  loginRequest,
  loginWithGoogleRequest,
  logoutRequest,
  registerRequest,
} from "../services/authService"
import { AuthContext } from "./authContextValue"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setToken(null)
        setLoading(false)
        return
      }

      try {
        const idToken = await firebaseUser.getIdToken()
        const appUser = await getCurrentUserRequest(idToken)

        setUser(appUser)
        setToken(idToken)
      } catch (error) {
        console.error(error)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const register = async (formData) => {
    const firebaseUser = await registerRequest(formData)
    const idToken = await firebaseUser.getIdToken(true)
    const appUser = await getCurrentUserRequest(idToken)

    setUser(appUser)
    setToken(idToken)

    return appUser
  }

  const login = async (credentials) => {
    // loginRequest now returns { user, token } from MongoDB directly
    const { user, token } = await loginRequest(credentials)

    setUser(user)
    setToken(token)

    return user
  }

  const loginWithGoogle = async () => {
    const firebaseUser = await loginWithGoogleRequest()
    const idToken = await firebaseUser.getIdToken()
    const appUser = await getCurrentUserRequest(idToken)

    setUser(appUser)
    setToken(idToken)

    return appUser
  }

  const logout = async () => {
    await logoutRequest()

    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, register, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
