import User from "../models/User.js"

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")

    res.json(users)
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
    })
  }
}

export const promoteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.role === "superadmin") {
      return res.status(400).json({ message: "Cannot change superadmin role" })
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" })
    }

    user.role = "admin"
    await user.save()

    const safeUser = await User.findById(id).select("-password")

    res.json({ message: "User promoted", user: safeUser })
  } catch (error) {
    res.status(500).json({ message: "Failed to promote user" })
  }
}

export const demoteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { id } = req.params

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.role === "superadmin") {
      return res.status(400).json({ message: "Cannot change superadmin role" })
    }

    if (user.role === "user") {
      return res.status(400).json({ message: "User is already a regular user" })
    }

    user.role = "user"
    await user.save()

    const safeUser = await User.findById(id).select("-password")

    res.json({ message: "User demoted", user: safeUser })
  } catch (error) {
    res.status(500).json({ message: "Failed to demote user" })
  }
}
