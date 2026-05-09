import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Comment = mongoose.model("Comment", commentSchema)

export default Comment
