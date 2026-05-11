import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all fields" })
  }

  try {
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      })
    }

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.status(201).json({
      message: "user registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const userExists = await User.findOne({ email })

    if (!userExists) {
      return res.status(400).json({
        message: "Invalid credentials",
      })
    }

    const isMatch = await bcrypt.compare(password, userExists.password)

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      })
    }

    const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.status(200).json({
      message: "Login Successful",
      user: {
        id: userExists._id,
        name: userExists.name,
        email: userExists.email,
        role: userExists.role,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

export const bootstrapSuperAdmin = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    user.role = "superadmin"

    await user.save()

    res.status(201).json({
      message:
        "User is now a superadmin, give the madafaka a round of applause!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

export default { registerUser, loginUser, bootstrapSuperAdmin }
