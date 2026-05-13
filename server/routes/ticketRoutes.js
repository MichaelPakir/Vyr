import express from "express"
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  getTicketById,
} from "../controllers/ticketController.js"

import { admin, protect } from "../middleware/authMiddleware.js"

const router = express.Router()

//user routes
router.post("/", protect, createTicket)
router.get("/my", protect, getMyTickets)
router.get("/:id", protect, getTicketById)

//admin routes
router.get("/", protect, admin, getAllTickets)
router.put("/:id", protect, admin, updateTicketStatus)

export default router
