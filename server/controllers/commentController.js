import Comment from "./../models/Comment"
import Ticket from "../models/Ticket"
import { getIO } from "../socket.js"

const addComment = async (req, res) => {
  const { ticketId } = req.params
  const { message } = req.body

  if (!message) {
    return res.status(400).json({
      message: "Message is required",
    })
  }

  try {
    const ticketExists = await Ticket.findById(ticketId)
    if (!ticketExists) {
      return res.status(404).json({
        message: "Ticket not found",
      })
    }

    const comment = new Comment({
      message,
      ticketId,
      author: req.user._id,
    })

    await comment.save()

    const io = getIO()
    io.emit("newComment", {
      id: comment._id,
      message: comment.message,
      ticketId: comment.ticketId,
      author: comment.author,
      createdAt: comment.createdAt,
    })

    return res.status(201).json({
      message: "Comment created",
      comment,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    })
  }
}
