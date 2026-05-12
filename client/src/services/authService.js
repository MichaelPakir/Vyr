import axios from "axios"
import { API_BASE_URL } from "./apiConfig"

const API_URL = `${API_BASE_URL}/api/auth`

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
