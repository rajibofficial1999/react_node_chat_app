import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import { uploadBuffer } from "../lib/utils";
import { Friend } from "../models/friend";
import { Group } from "../models/group";
import { Message } from "../models/message";
import { User } from "../models/user";

export const GetMessages: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).send("Invalid ID");
      return;
    }

    const friend = await Friend.findOne({
      _id: id,
      $or: [{ sender: authUser._id }, { receiver: authUser._id }],
    })
      .populate("sender")
      .populate("receiver")
      .lean();

    if (!friend) {
      const group = await Group.findById(id);
      if (!group) {
        res.status(404).send("Conversation not found");
        return;
      }

      if (group.owner.toString() !== authUser._id.toString()) {
        const isMember = group.members.some(
          (member: any) => member._id.toString() === authUser._id.toString()
        );

        if (!isMember) {
          res.status(404).send("You are not a member of this group");
          return;
        }
      }

      const messages = await Message.find({
        group: id,
      })
        .populate("sender", "name avatar _id")
        .populate("receiver", "name _id")
        .populate("attachments")
        .sort({ createdAt: -1 });

      res.send({
        messages,
        chatItem: {
          ...group.toObject(),
          isGroup: true,
        },
      });

      return;
    }

    const isSender = friend.sender._id.toString() === authUser._id.toString();
    const user = isSender ? friend.receiver : friend.sender;

    const messages = await Message.find({
      friend: id,
      $or: [{ sender: authUser._id }, { receiver: authUser._id }],
    })
      .populate("sender", "name _id")
      .populate("receiver", "name _id")
      .populate("attachments")
      .sort({ createdAt: -1 });

    res.send({
      messages,
      chatItem: {
        ...user,
        isBlocked: friend.isBlocked || false,
        blockedBy: friend.blockedBy || null,
        friendShipId: friend._id,
        isGroup: false,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const SendMessage: RequestHandler = async (req, res) => {
  try {
    const {
      receiverId = "",
      friendId = "",
      groupId = "",
      content = "",
    } = req.body;
    const authUser = req.user as IUser;

    const attachments = req.files as Express.Multer.File[];

    // === VALIDATION ===

    if (!friendId && !groupId) {
      res.status(400).send("Friend ID or Group ID is required");
      return;
    }

    if ((friendId && !receiverId) || (!friendId && receiverId)) {
      res.status(400).send("Both Friend ID and Receiver ID are required");
      return;
    }

    if (!content && attachments.length === 0) {
      res.status(400).send("At least one attachment or content is required");
      return;
    }

    if (attachments.length > 5) {
      res.status(400).send("Maximum 5 attachments allowed");
      return;
    }

    let message = new Message();
    message.sender = new mongoose.Types.ObjectId(authUser._id);

    // === FRIEND MESSAGE ===
    let friend: IFriend | null = null;
    if (friendId) {
      if (
        !mongoose.Types.ObjectId.isValid(friendId) ||
        !mongoose.Types.ObjectId.isValid(receiverId)
      ) {
        res.status(400).send("Invalid Friend ID or Receiver ID");
        return;
      }

      friend = await Friend.findById(friendId)
        .populate("sender")
        .populate("receiver");
      if (!friend) {
        res.status(400).send("Friend not found");
        return;
      }

      if (friend.isBlocked) {
        res.status(400).send("You cannot send message to this friend");
        return;
      }

      if (friend.status !== "accepted") {
        res.status(400).send("You cannot send message to this friend");
        return;
      }

      const isSender = friend.sender._id.toString() === authUser._id.toString();
      const isReceiver =
        friend.receiver._id.toString() === authUser._id.toString();

      if (!isSender && !isReceiver) {
        res
          .status(400)
          .send("You are not eligible to send message to this friend");
        return;
      }

      if (receiverId === authUser._id.toString()) {
        res.status(400).send("You cannot send message to yourself");
        return;
      }

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        res.status(400).send("Receiver not found");
        return;
      }

      message.friend = new mongoose.Types.ObjectId(friend._id);
      message.receiver = receiver._id;
    }

    // === GROUP MESSAGE ===
    let group: IGroup | null = null;
    if (groupId) {
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        res.status(400).send("Invalid Group ID");
        return;
      }

      group = await Group.findById(groupId).populate("members");
      if (!group) {
        res.status(400).send("Group not found");
        return;
      }

      if (group.owner.toString() !== authUser._id.toString()) {
        const isMember = group.members.some(
          (member: any) => member._id.toString() === authUser._id.toString()
        );

        if (!isMember) {
          res.status(400).send("You are not a member of this group");
          return;
        }
      }

      message.group = new mongoose.Types.ObjectId(group._id);
    }

    // === CONTENT + ATTACHMENTS ===
    if (content) {
      message.content = content;
    }

    if (attachments.length > 0) {
      let uploadedAttachments: IAttachment[] = [];

      for (const file of attachments) {
        const result = await uploadBuffer(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        const newValue: IAttachment = {
          name: file.originalname,
          url: (result as any).secure_url,
          size: file.size,
          type: file.mimetype,
        };

        uploadedAttachments.push(newValue);
      }

      message.attachments = uploadedAttachments;
    }

    message.readBy = [
      {
        userId: new Types.ObjectId(authUser._id),
        name: authUser.name,
      },
    ] as IMessageRead[];

    await message.save();

    if (group) {
      group.messages.push(new Types.ObjectId(message._id));
      group.lastMessage = new Types.ObjectId(message._id);
      await group.save();
    }

    if (friend) {
      friend.messages.push(new Types.ObjectId(message._id));
      friend.lastMessage = new Types.ObjectId(message._id);
      await friend.save();
    }

    res.status(200).send("Message sent.");
  } catch (error: any) {
    console.error(error);
    res.status(500).send(error.message || "Something went wrong");
  }
};

export const MarkAsRead: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).send("Invalid ID");
      return;
    }

    const friend = await Friend.findById(id);
    if (!friend) {
      const group = await Group.findById(id);
      if (!group) {
        res.status(404).send("Conversation not found");
        return;
      }

      if (group.owner.toString() !== authUser._id.toString()) {
        const isMember = group.members.some(
          (member: any) => member._id.toString() === authUser._id.toString()
        );

        if (!isMember) {
          res.status(404).send("You are not a member of this group");
          return;
        }
      }

      await Message.updateMany(
        {
          sender: { $ne: authUser._id },
          group: group._id,
          "readBy.userId": { $ne: authUser._id },
        },
        {
          $addToSet: {
            readBy: {
              userId: authUser._id,
              name: authUser.name,
            },
          },
        }
      );

      res.send("Conversation marked as read");
      return;
    }

    const isSender = friend.sender._id.toString() === authUser._id.toString();
    const isReceiver =
      friend.receiver._id.toString() === authUser._id.toString();

    if (isReceiver || isSender) {
      await Message.updateMany(
        {
          receiver: authUser._id,
          friend: friend._id,
          "readBy.userId": { $ne: authUser._id },
        },
        {
          $addToSet: {
            readBy: {
              userId: authUser._id,
              name: authUser.name,
            },
          },
        }
      );
      res.send("Conversation marked as read");
      return;
    }

    res.status(404).send("Conversation not found");
  } catch (error: any) {
    console.error(error);
    res.status(500).send(error.message || "Something went wrong");
  }
};
