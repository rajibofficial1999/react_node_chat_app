import { z } from "zod";

export {};

declare global {
  type FriendStatus = "pending" | "accepted";

  interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    password: string;
    avatar: string | undefined;
    createdAt: string;
    updatedAt: string;
    isBlocked?: boolean;
    isAccepted?: boolean;
    isPending?: boolean;
    onBoarding?: boolean;
    isEmailVerified?: boolean;
    passwordResetExpires?: string;
    verfiedTokenExpires?: string;
  }

  interface Friend {
    _id: string;
    sender: User;
    receiver: User;
    updatedAt: string;
    createdAt: string;
    messages: Message[];
    status: FriendStatus;
    isBlocked: boolean;
    blockedBy: User;
    lastMessage: Message;
    user?: User;
  }

  interface Attachment {
    name: string;
    url: string;
    type: string;
    size: number;
  }

  type ReadBy = {
    userId: string;
    name: string;
  };

  interface Message {
    _id: string;
    sender: User;
    receiver: User;
    friend: Friend;
    group: Group;
    content: string | undefined;
    attachments: Attachment[];
    readBy: ReadBy[];
    updatedAt: string;
    createdAt: string;
    notification: string | undefined;
  }

  interface Group {
    _id: string;
    name: string;
    description: string;
    owner: User;
    avatar: string;
    members: User[];
    messages: Message[];
    lastMessage: Message;
    updatedAt: string;
    createdAt: string;
  }

  interface ChatItem {
    _id: string;
    isGroup: boolean;
    name?: string;
    avatar?: string;
    friend: User;
    createdAt: string;
    updatedAt: string;
    lastMessage?: Message;
    unReadMessagesCount: number;
    isBlocked: boolean;
  }

  interface AuthResponse {
    success: boolean;
    message: string;
    user: User;
  }

  interface ChatInfo extends Group, Friend, ChatItem {
    friendShipId?: string;
  }

  interface LoadingStateProps {
    [key: string]: boolean;
  }
}
