import mongoose, { Schema } from "mongoose";

const notificationSchema = new mongoose.Schema<INotification>(
  {
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },

    belongsToId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    belongsToModel: {
      type: String,
      required: true,
      enum: ["User", "Message", "Friend", "Group"],
    },
  },
  {
    timestamps: true,
  }
);
export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
