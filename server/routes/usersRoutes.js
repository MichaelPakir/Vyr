import express from "express"
import { admin, protect } from "../middleware/authMiddleware.js"
import {
  getUsers,
  promoteUser,
  demoteUser,
} from "./../controllers/usersController.js"

const router = express.Router()

router.get("/", protect, admin, getUsers)

router.patch("/:id/promote", protect, promoteUser)
router.patch("/:id/demote", protect, demoteUser)

export default router
