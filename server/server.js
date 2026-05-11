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

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
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
  origin: CLIENT_URL,
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
