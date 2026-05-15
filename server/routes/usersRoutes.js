import express from "express"
import { admin, protect } from "../middleware/authMiddleware.js"
import { getUsers } from "./../controllers/usersController.js"

const router = express.Router()

router.get("/", protect, admin, getUsers)

export default router
