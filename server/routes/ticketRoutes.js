import express from "express"
import multer from "multer"

import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  getTicketById,
  deleteTicket,
  assignTicket,
} from "../controllers/ticketController.js"

import {
  addComment,
  getCommentsByTicket,
} from "../controllers/commentController.js"

import { admin, protect } from "../middleware/authMiddleware.js"

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
})

router.post("/", protect, upload.array("attachments", 6), createTicket)

router.get("/my", protect, getMyTickets)
router.get("/:id", protect, getTicketById)
router.get("/", protect, admin, getAllTickets)
router.put("/:id", protect, admin, updateTicketStatus)
router.patch("/:id/assign", protect, assignTicket)
router.delete("/:id", protect, admin, deleteTicket)

router.post("/:ticketId/comments", protect, addComment)
router.get("/:ticketId/comments", protect, getCommentsByTicket)

export default router
