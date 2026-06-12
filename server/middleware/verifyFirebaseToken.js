import { auth } from "../config/firebaseAdmin.js"
import User from "../models/User.js"

export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" })
  }

  try {
    const token = authHeader.split(" ")[1]
    const decoded = await auth.verifyIdToken(token)

    // Upsert user into MongoDB
    req.user = await User.findOneAndUpdate(
      { email: decoded.email },
      {
        $set: {
          firebaseUid: decoded.uid,
          name: decoded.name || decoded.email.split("@")[0],
          email: decoded.email,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).select("-password")

    next()
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" })
  }
}
