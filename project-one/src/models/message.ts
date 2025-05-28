import mongoose, { Schema, Types } from "mongoose";

const attachmentSchema = new mongoose.Schema<IAttachment>(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const messageReadSchema = new mongoose.Schema<IMessageRead>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new mongoose.Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    friend: {
      type: Schema.Types.ObjectId,
      ref: "Friend",
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    content: {
      type: String,
    },
    notification: {
      type: String,
    },
    readBy: [messageReadSchema],

    attachments: [attachmentSchema],
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
