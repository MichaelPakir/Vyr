import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"
dotenv.config()

import express from "express"
import cors from "cors"
import connectDB from "./config/db.js"

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("API is running")
})

const PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
