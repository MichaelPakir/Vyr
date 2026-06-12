import "./config/env.js"
import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import path from "path"

import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import ticketRoutes from "./routes/ticketRoutes.js"
import usersRoutes from "./routes/usersRoutes.js"
import { setIO } from "./socket.js"

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
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
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
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}

app.use((req, res, next) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true")
  }
  next()
})

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
  next()
})

app.use(cors(corsOptions))
app.use(express.json())

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url)
  next()
})

app.use("/uploads", express.static(path.resolve("uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/users", usersRoutes)

app.get("/", (req, res) => {
  res.send("API is running")
})

const PORT = process.env.PORT || 5000

connectDB()

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
