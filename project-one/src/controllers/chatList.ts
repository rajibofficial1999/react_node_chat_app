import { RequestHandler } from "express";
import { Friend, Group } from "../models";

export const GetChatList: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;

    // --- Get Friends Data ---
    const friendsData = await Friend.find({
      status: "accepted",
      $or: [{ sender: authUser._id }, { receiver: authUser._id }],
    })
      .populate({
        path: "lastMessage",
        model: "Message",
        populate: {
          path: "sender",
          select: "name _id avatar",
        },
      })
      .populate({
        path: "messages",
        model: "Message",
        match: {
          sender: { $ne: authUser._id },
          readBy: {
            $not: {
              $elemMatch: { userId: authUser._id },
            },
          },
        },
      })
      .populate("sender", "name _id avatar")
      .populate("receiver", "name _id avatar")
      .select("-messages");

    const normalizedFriends = friendsData.map((friend) => {
      const isSender = friend.sender._id.toString() === authUser._id.toString();
      const otherUser = isSender ? friend.receiver : friend.sender;

      return {
        _id: friend._id,
        isGroup: false,
        isBlocked: friend.isBlocked || false,
        createdAt: friend.createdAt,
        updatedAt: friend.updatedAt,
        lastMessage: friend.lastMessage,
        unReadMessagesCount: friend.messages.length,
        friend: otherUser,
      };
    });

    // --- Get Groups Data ---
    const groupsData = await Group.find({
      $or: [{ owner: authUser._id }, { members: authUser._id }],
    })
      .populate({
        path: "lastMessage",
        model: "Message",
        populate: {
          path: "sender",
          select: "name _id avatar",
        },
      })
      .populate({
        path: "messages",
        model: "Message",
        match: {
          sender: { $ne: authUser._id },
          readBy: {
            $not: {
              $elemMatch: { userId: authUser._id },
            },
          },
        },
      })
      .select("name avatar createdAt updatedAt lastMessage");

    const normalizedGroups = groupsData.map((group) => ({
      _id: group._id,
      isGroup: true,
      name: group.name,
      avatar: group.avatar,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      unReadMessagesCount: group.messages.length,
      lastMessage: group.lastMessage,
    }));

    // --- Merge and Sort ---
    const merged = [...normalizedFriends, ...normalizedGroups];

    const sorted = merged.sort((a, b) => {
      const dateA = (a.lastMessage as IMessage)?.createdAt
        ? new Date((a.lastMessage as IMessage).createdAt).getTime()
        : 0;
      const dateB = (b.lastMessage as IMessage)?.createdAt
        ? new Date((b.lastMessage as IMessage).createdAt).getTime()
        : 0;
      return dateB - dateA;
    });

    // --- Send Response ---
    res.send(sorted);
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
