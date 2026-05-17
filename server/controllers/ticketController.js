import { isObjectIdOrHexString } from "mongoose"
import Ticket from "./../models/Ticket.js"
import { getIO } from "../socket.js"

export const createTicket = async (req, res) => {
  const { title, description } = req.body

  if (!title || !description) {
    return res.status(400).json({
      message: "Please fill all fields",
    })
  }

  try {
    const ticketData = {
      title,
      description,
      createdBy: req.user._id,
    }

    if (req.files && req.files.length > 0) {
      ticketData.attachments = req.files.map((f) => ({
        filename: f.filename,
        url: `/uploads/${f.filename}`,
        mimetype: f.mimetype,
        size: f.size,
      }))
    }

    const ticket = new Ticket(ticketData)

    await ticket.save()

    return res.status(201).json({
      message: "Ticket created",
    })
  } catch (error) {
    console.error("Create ticket error:", error)
    res.status(500).json({
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

    const ticket = await Ticket.findById(id).populate(
      "createdBy",
      "name email role",
    )

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
