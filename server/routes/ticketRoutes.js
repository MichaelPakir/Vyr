import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
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

const uploadsDir = path.resolve("uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "-")
    cb(null, unique)
  },
})

const upload = multer({ storage })

router.post("/", protect, upload.array("attachments", 6), createTicket)
router.get("/my", protect, getMyTickets)
router.get("/:id", protect, getTicketById)
router.get("/", protect, admin, getAllTickets)
router.put("/:id", protect, admin, updateTicketStatus)

router.post("/:ticketId/comments", protect, addComment)
router.get("/:ticketId/comments", protect, getCommentsByTicket)

export default router
