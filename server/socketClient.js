import { io } from "socket.io-client"

const socket = io("http://localhost:5000")

socket.on("connect", () => {
  console.log("Connected:", socket.id)
})

socket.on("ticketUpdated", (data) => {
  console.log("Ticket updated:", data)
})

socket.on("newComment", (data) => {
  console.log("New comment:", data)
})
