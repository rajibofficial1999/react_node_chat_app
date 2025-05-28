import mongoose, { Schema } from "mongoose";

const friendSchema = new mongoose.Schema<IFriend>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Friend = mongoose.model<IFriend>("Friend", friendSchema);
