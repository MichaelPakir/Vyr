import axios from "axios"

const API_URL = "http://localhost:5000/api/users"

export const getUsersRequest = async (token) => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export const promoteUserRequest = async (userId, token) => {
  const response = await axios.patch(
    `${API_URL}/${userId}/promote`,
    null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export const demoteUserRequest = async (userId, token) => {
  const response = await axios.patch(
    `${API_URL}/${userId}/demote`,
    null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
