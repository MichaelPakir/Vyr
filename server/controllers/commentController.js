import Comment from "./../models/Comment.js"
import Ticket from "../models/Ticket.js"
import { getIO } from "../socket.js"

const normalizeRole = (role) => role?.toLowerCase().trim()
const normalizeStatus = (status) => status?.toLowerCase().trim()
const isAdminRole = (role) => ["admin", "superadmin"].includes(normalizeRole(role))

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

    const isAdmin = isAdminRole(req.user.role)
    const isCreator =
      ticketExists.createdBy.toString() === req.user._id.toString()

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Access denied",
      })
    }

    const comment = new Comment({
      message,
      ticket: ticketId,
      author: req.user._id,
    })

    await comment.save()

    let currentTicket = ticketExists
    let didUpdateTicketStatus = false
    const currentStatus = normalizeStatus(ticketExists.status)

    if (isAdmin && currentStatus !== "pending" && currentStatus !== "resolved") {
      ticketExists.status = "Pending"
      currentTicket = await ticketExists.save()
      didUpdateTicketStatus = true
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name role",
    )

    const io = getIO()

    io.emit("newComment", populatedComment)

    if (didUpdateTicketStatus) {
      io.emit("ticketUpdated", {
        id: currentTicket._id,
        title: currentTicket.title,
        status: currentTicket.status,
        updatedAt: currentTicket.updatedAt,
      })
    }

    return res.status(201).json({
      message: "Comment created",
      comment: populatedComment,
      ticket: currentTicket,
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
    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      })
    }

    const isCreator = ticket.createdBy.toString() === req.user._id.toString()
    const isAdmin = isAdminRole(req.user.role)

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Access denied",
      })
    }

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
