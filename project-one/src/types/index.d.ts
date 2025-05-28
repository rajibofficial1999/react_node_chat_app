import mongoose, { Document, Types } from "mongoose";

export {};

declare global {
  type FriendStatus = "pending" | "accepted";
  interface IUser extends Document {
    _id: string;
    name: string;
    username: string;
    email: string;
    password: string;
    avatar: string | undefined;
    onBoarding: boolean;
    isEmailVerified: boolean;
    verifiedToken: string;
    verfiedTokenExpires: Date;
    createdAt: Date;
    updatedAt: Date;
  }

  interface IFriend extends Document {
    _id: string;
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    updatedAt: Date;
    createdAt: Date;
    messages: Types.ObjectId[];
    status: FriendStatus;
    isBlocked: boolean;
    blockedBy: Types.ObjectId;
    lastMessage: Types.ObjectId | IMessage;
  }

  interface IAttachment {
    name: string;
    url: string;
    type: string;
    size: number;
  }

  interface IMessage extends Document {
    _id: string;
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    friend: Types.ObjectId;
    group: Types.ObjectId;
    content: string;
    notification: string;
    attachments: IAttachment[];
    readBy: IMessageRead[];
    updatedAt: Date;
    createdAt: Date;
  }

  interface IMessageRead extends Document {
    userId: Types.ObjectId;
    name: string;
  }

  interface IGroup extends Document {
    _id: string;
    name: string;
    description: string;
    owner: Types.ObjectId;
    avatar: string;
    members: Types.ObjectId[];
    messages: Types.ObjectId[];
    lastMessage: Types.ObjectId | IMessage;
    updatedAt: Date;
    createdAt: Date;
  }

  type BelongsToModel = "User" | "Message" | "Friend" | "Group";

  interface INotification extends Document {
    _id: string;
    receiverId: Types.ObjectId;
    message: string;

    belongsToId: Types.ObjectId;
    belongsToModel: BelongsToModel;

    updatedAt: Date;
    createdAt: Date;
  }

  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}
