import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/auth"

export const registerRequest = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData)

  return response.data
}

export const loginRequest = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials)

  return response.data
}

export const logoutRequest = async () => {
  const response = await axios.post(`${API_URL}/logout`)

  return response.data
}
