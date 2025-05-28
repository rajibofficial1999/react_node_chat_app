import { Response } from "express";
import jwt from "jsonwebtoken";
import { Readable } from "stream";
import cloudinary from "./cloudinary";
import { Notification, Message } from "../models";
import { Types } from "mongoose";

interface NotificationParams {
  message: string;
  belongsToId: string;
  belongsToModel: BelongsToModel;
  receiverId?: string;
}

interface MessageParams {
  senderId: string;
  friendId?: string;
  groupId?: string;
  receiverId?: string;
  notification?: string;
}

export const createTokenAndSetCookie = (user: IUser, res: Response) => {
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7h",
  });

  res.cookie("chat_access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 60 * 60 * 1000,
  });
};

const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

export const uploadBuffer = (
  fileBuffer: Buffer,
  filename: string,
  mimetype: string
) => {
  return new Promise((resolve, reject) => {
    const isRawFile =
      !mimetype.startsWith("image/") && !mimetype.startsWith("video/");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "messages",
        public_id: filename,
        resource_type: isRawFile ? "raw" : "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    bufferToStream(fileBuffer).pipe(uploadStream);
  });
};

export const createMessage = async ({
  senderId,
  friendId,
  groupId,
  receiverId,
  notification,
}: MessageParams): Promise<IMessage> => {
  try {
    if (!friendId && !groupId) {
      throw new Error("Friend ID or Group ID is required");
    }

    if ((friendId && !receiverId) || (!friendId && receiverId)) {
      throw new Error("Both Friend ID and Receiver ID are required");
    }

    if (friendId && !Types.ObjectId.isValid(friendId)) {
      throw new Error("Invalid friendId");
    }

    if (receiverId && !Types.ObjectId.isValid(receiverId)) {
      throw new Error("Invalid receiverId");
    }

    if (groupId && !Types.ObjectId.isValid(groupId)) {
      throw new Error("Invalid groupId");
    }

    const message = new Message({
      sender: new Types.ObjectId(senderId),
      receiver: receiverId ? new Types.ObjectId(receiverId) : undefined,
      friend: friendId ? new Types.ObjectId(friendId) : undefined,
      group: groupId ? new Types.ObjectId(groupId) : undefined,
      notification: notification || undefined,
    });

    await message.save();

    return message;
  } catch (error) {
    throw error;
  }
};

export const createNotification = async ({
  belongsToId,
  belongsToModel,
  message,
  receiverId,
}: NotificationParams): Promise<INotification> => {
  if (!Types.ObjectId.isValid(belongsToId)) {
    throw new Error("Invalid belongsToId");
  }

  if (receiverId && !Types.ObjectId.isValid(receiverId)) {
    throw new Error("Invalid receiverId");
  }

  const notification = new Notification({
    message,
    belongsToId: new Types.ObjectId(belongsToId),
    belongsToModel,
    receiver: receiverId ? new Types.ObjectId(receiverId) : undefined,
  });

  await notification.save();

  return notification;
};
