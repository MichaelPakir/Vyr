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
        filename: {
          type: String,
        },
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        mimetype: {
          type: String,
        },
        size: {
          type: Number,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Open", "Pending", "Resolved"],
      default: "Open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
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
