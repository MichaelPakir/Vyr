import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { auth } from "../config/firebaseAdmin.js"

const roleAccess =
  (...allowedRoles) =>
  (req, res, next) => {
    try {
      if (req.user && allowedRoles.includes(req.user.role)) {
        return next()
      }

      return res.status(403).json({
        message: "Access denied",
      })
    } catch (error) {
      return res.status(403).json({
        message: "Access denied",
      })
    }
  }

export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]

      try {
        const decodedFirebaseToken = await auth.verifyIdToken(token)
        const email = decodedFirebaseToken.email

        if (!email) {
          return res.status(401).json({ message: "Not authorized" })
        }

        req.user = await User.findOneAndUpdate(
          { email },
          {
            $set: {
              firebaseUid: decodedFirebaseToken.uid,
              name: decodedFirebaseToken.name || email.split("@")[0],
              email,
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        ).select("-password")

        return next()
      } catch (firebaseError) {
        // Firebase verification failed, fall back to JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select("-password")
        return next()
      }
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" })
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" })
  }
}

export const admin = (req, res, next) => {
  try {
    if (req.user && ["admin", "superadmin"].includes(req.user.role)) {
      return next()
    }
    return res.status(403).json({
      message: "Not authorized as admin",
    })
  } catch (error) {
    res.status(403).json({
      message: "Admin access only",
    })
  }
}

export const bootstrapSecret = (req, res, next) => {
  const providedSecret = req.headers["x-bootstrap-secret"]
  if (
    process.env.SUPERADMIN_BOOTSTRAP_SECRET &&
    providedSecret === process.env.SUPERADMIN_BOOTSTRAP_SECRET
  ) {
    return next()
  } else {
    return res.status(403).json({
      message: "Invalid bootstrap secret",
    })
  }
}

export default { protect, admin }
