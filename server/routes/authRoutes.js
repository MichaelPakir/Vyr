import express from "express"
import authController from "../controllers/authController.js"
import { bootstrapSecret } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.post(
  "/bootstrap-superadmin",
  bootstrapSecret,
  authController.bootstrapSuperAdmin,
)

export default router
