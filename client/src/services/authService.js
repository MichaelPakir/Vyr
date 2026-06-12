import axios from "axios"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth"
import { API_BASE_URL } from "./apiConfig"
import { auth, googleProvider } from "../firebase"

const API_URL = `${API_BASE_URL}/api/auth`

export const registerRequest = async (userData) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    userData.email,
    userData.password,
  )

  if (userData.name) {
    await updateProfile(credential.user, { displayName: userData.name })
  }

  // Save to MongoDB
  await axios.post(`${API_URL}/register`, userData)

  return credential.user
}

export const loginRequest = async (credentials) => {
  // Bypass Firebase — authenticate directly against MongoDB
  const { data } = await axios.post(`${API_URL}/login`, credentials)
  return data
}

export const loginWithGoogleRequest = async () => {
  const credential = await signInWithPopup(auth, googleProvider)
  return credential.user
}

export const logoutRequest = async () => {
  await signOut(auth)
}

export const getCurrentUserRequest = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data.user
  } catch (error) {
    console.log("Message:", error.message)
    console.log("Code:", error.code)
    console.log("Response:", error.response)
    console.log("Request:", error.request)
    throw error
  }
}
