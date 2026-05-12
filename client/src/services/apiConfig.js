export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/auth$/, "") ||
  "http://localhost:5000"
