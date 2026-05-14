import express from "express"
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  getTicketById,
} from "../controllers/ticketController.js"

import {
  addComment,
  getCommentsByTicket,
} from "../controllers/commentController.js"

import { admin, protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/", protect, createTicket)
router.get("/my", protect, getMyTickets)
router.get("/:id", protect, getTicketById)
router.get("/", protect, admin, getAllTickets)
router.put("/:id", protect, admin, updateTicketStatus)

router.post("/:ticketId/comments", protect, addComment)
router.get("/:ticketId/comments", protect, getCommentsByTicket)

export default router
