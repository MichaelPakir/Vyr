import { isObjectIdOrHexString } from "mongoose"
import Ticket from "./../models/Ticket.js"
import { getIO } from "../socket.js"
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js"
import cloudinary from "../config/cloudinary.js"
import User from "../models/User.js"

export const createTicket = async (req, res) => {
  const { title, description } = req.body

  if (!title || !description) {
    return res.status(400).json({
      message: "Please fill all fields",
    })
  }

  try {
    let attachments = []

    if (req.files?.length) {
      attachments = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(
            file.buffer,
            "support-tickets",
          )

          return {
            filename: file.originalname,
            url: result.secure_url,
            publicId: result.public_id,
            mimetype: file.mimetype,
            size: file.size,
          }
        }),
      )
    }

    const ticket = new Ticket({
      title,
      description,
      createdBy: req.user._id,
      attachments,
    })

    await ticket.save()

    return res.status(201).json({
      message: "Ticket created",
      ticket,
    })
  } catch (error) {
    console.error("Create ticket error:", error)

    return res.status(500).json({
      message: "Ticket not created",
      error: error.message,
    })
  }
}

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      createdBy: req.user._id,
    })
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ updatedAt: -1 })

    return res.status(200).json({
      message: "Fetched tickets",
      tickets,
    })
  } catch (error) {
    return res.status(400).json({
      message: "Failed to fetch tickets",
    })
  }
}

export const getAllTickets = async (req, res) => {
  try {
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      })
    }

    const tickets = await Ticket.find({})
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ updatedAt: -1 })

    return res.status(200).json({
      message: "Fetched all tickets",
      tickets,
    })
  } catch (error) {
    return res.status(400).json({
      message: "Failed to fetch tickets",
    })
  }
}

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params

    if (!isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      })
    }

    const ticket = await Ticket.findById(id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      })
    }

    const isCreator =
      ticket.createdBy._id.toString() === req.user._id.toString()
    const isAdmin = ["admin", "superadmin"].includes(req.user.role)

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Access denied",
      })
    }

    res.json({ ticket })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const allowedStatuses = ["Open", "Pending", "Resolved"]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid ticket status",
      })
    }

    const ticket = await Ticket.findById(id)

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      })
    }

    ticket.status = status

    await ticket.save()

    const io = getIO()
    io.emit("ticketUpdated", {
      id: ticket._id,
      title: ticket.title,
      status: ticket.status,
      updatedAt: ticket.updatedAt,
    })

    return res.status(200).json({
      message: "Ticket updated",
      ticket,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update ticket",
    })
  }
}

export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params
    const { assigneeId } = req.body

    // Validate ticket id
    if (!isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      })
    }

    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only superadmins can assign tickets",
      })
    }

    const ticket = await Ticket.findById(id)

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      })
    }

    //Unassign flow
    if (!assigneeId) {
      ticket.assignedTo = null
      ticket.assignedBy = null
      ticket.assignedAt = null

      await ticket.save()

      const unassignedTicket = await Ticket.findById(ticket._id)
        .populate("assignedTo", "name email role")
        .populate("assignedBy", "name email role")
        .populate("createdBy", "name email role")

      const io = getIO()
      io.emit("ticketAssigned", {
        ticketId: ticket._id,
        assignedTo: null,
        assignedBy: null,
        assignedAt: null,
      })

      return res.status(200).json({
        message: "Ticket unassigned",
        ticket: unassignedTicket,
      })
    }

    //This will validate assignee
    if (!isObjectIdOrHexString(assigneeId)) {
      return res.status(400).json({
        message: "Invalid assigneeId",
      })
    }

    const assignee = await User.findById(assigneeId)

    if (!assignee || assignee.role !== "admin") {
      return res.status(400).json({
        message: "Assignee must be an admin user",
      })
    }

    //Assign flow
    ticket.assignedTo = assignee._id
    ticket.assignedBy = req.user._id
    ticket.assignedAt = new Date()

    await ticket.save()

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .populate("createdBy", "name email role")

    const io = getIO()
    io.emit("ticketAssigned", {
      ticketId: ticket._id,
      assignedTo: assignee._id,
      assignedBy: req.user._id,
      assignedAt: ticket.assignedAt,
    })

    return res.status(200).json({
      message: "Ticket assigned successfully",
      ticket: updatedTicket,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    })
  }
}

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params
    const ticket = await Ticket.findById(id)

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      })
    }

    if (ticket.attachments?.length) {
      await Promise.all(
        ticket.attachments
          .filter((file) => file.publicId)
          .map((file) => cloudinary.uploader.destroy(file.publicId)),
      )
    }

    await ticket.deleteOne()

    return res.status(200).json({
      message: "Ticket deleted",
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    })
  }
}
