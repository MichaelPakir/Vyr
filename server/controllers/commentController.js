import Comment from "./../models/Comment.js"
import Ticket from "../models/Ticket.js"
import { getIO } from "../socket.js"

export const addComment = async (req, res) => {
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
      ticket: ticketId,
      author: req.user._id,
    })

    await comment.save()

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name role",
    )

    const io = getIO()

    io.emit("newComment", populatedComment)

    return res.status(201).json({
      message: "Comment created",
      comment: populatedComment,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    })
  }
}

export const getCommentsByTicket = async (req, res) => {
  const { ticketId } = req.params

  try {
    const comments = await Comment.find({ ticket: ticketId })
      .populate("author", "name role")
      .sort({ createdAt: 1 })

    return res.status(200).json(comments)
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    })
  }
}
