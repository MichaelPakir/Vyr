import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
  },
  { timestamps: true },
)

const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User
