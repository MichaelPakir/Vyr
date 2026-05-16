import mongoose from "mongoose"

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
        mimetype: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: ["Open", "Pending", "Resolved"],
      default: "Open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

const Ticket = mongoose.model("Ticket", ticketSchema)

export default Ticket
