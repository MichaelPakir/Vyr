import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"
import ticketRoutes from "./routes/ticketRoutes.js"
import { createServer } from "http"
import { Server } from "socket.io"
import { setIO } from "./socket.js"
dotenv.config()

import express from "express"
import cors from "cors"
import connectDB from "./config/db.js"

const app = express()

const server = createServer(app)

const CLIENT_URLS = process.env.CLIENT_URLS || "http://localhost:5173"

const allowedOrigins = (CLIENT_URLS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error("Not allowed by CORS"))
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
})

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

setIO(io)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error("Not allowed by CORS"))
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/tickets", ticketRoutes)

app.get("/", (req, res) => {
  res.send("API is running")
})

const PORT = process.env.PORT || 5000

connectDB()

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
