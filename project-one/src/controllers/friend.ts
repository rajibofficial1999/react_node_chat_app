import { RequestHandler } from "express";
import { User } from "../models/user";
import mongoose, { Document } from "mongoose";
import { Friend, Message } from "../models";
import { createMessage } from "../lib/utils";

interface IPopulatedFriend extends Document {
  sender: IUser;
  receiver: IUser;
  status: string;
  isBlocked: boolean;
}

export const GetFriendById: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const friendId = req.params.friendId;

    if (!friendId) {
      res.status(404).send("Friend ID is required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      res.status(404).send("Invalid Friend ID");
      return;
    }

    const friend = await Friend.findOne({
      _id: friendId,
      isBlocked: false,
    })
      .populate("sender", "-password -__v")
      .populate("receiver", "-password -__v")
      .select("-messages -lastMessage");

    if (!friend) {
      res.status(404).send("Friend not found");
      return;
    }

    if (friend.sender._id.toString() !== authUser._id.toString()) {
      if (friend.receiver._id.toString() !== authUser._id.toString()) {
        res.status(401).send("You are not eligible to view this friend");
        return;
      }
    }

    res.send({
      ...friend.toObject(),
      isGroup: false,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const GetAllFriends: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;

    const friendsData = (await Friend.find({
      isBlocked: false,
      $or: [{ sender: authUser._id }, { receiver: authUser._id }],
    })
      .populate("sender", "-password -__v")
      .populate("receiver", "-password -__v")) as unknown as IPopulatedFriend[];

    const friends = friendsData.map((friend) => {
      const sender = friend.sender as IUser;
      const receiver = friend.receiver as IUser;

      const isSender = sender._id.toString() === authUser._id.toString();
      const otherUser = isSender ? receiver : sender;

      return {
        ...otherUser.toObject(),
        isAccepted: friend.status === "accepted",
        isPending: friend.status === "pending",
      };
    });

    res.send(friends);
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const GetPendingFriends: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;

    const friendsData = await Friend.find({
      status: "pending",
      receiver: authUser._id,
      $or: [{ sender: authUser._id }, { receiver: authUser._id }],
    })
      .populate("sender", "-password -__v")
      .populate("receiver", "-password -__v");

    const friends = friendsData.map((friend) => {
      // Determine which user is the actual "friend"
      const isSender = friend.sender._id.toString() === authUser._id.toString();
      const data = isSender ? friend.receiver : friend.sender;

      return {
        _id: friend._id,
        createdAt: friend.createdAt,
        updatedAt: friend.updatedAt,
        user: data,
      };
    });

    res.send(friends);
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const GetBlockedFriends: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;

    const friendsData = await Friend.find({
      isBlocked: true,
      blockedBy: authUser._id,
      $or: [{ sender: authUser._id }, { receiver: authUser._id }],
    })
      .populate("sender", "-password -__v")
      .populate("receiver", "-password -__v");

    const friends = friendsData.map((friend) => {
      // Determine which user is the actual "friend"
      const isSender = friend.sender._id.toString() === authUser._id.toString();
      const data = isSender ? friend.receiver : friend.sender;

      return {
        _id: friend._id,
        createdAt: friend.createdAt,
        updatedAt: friend.updatedAt,
        friend: data,
      };
    });

    res.send(friends);
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const SendRequst: RequestHandler = async (req, res) => {
  try {
    const { receiverId = "" } = req.body;
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      res.status(400).send("Invalid Receiver ID");
      return;
    }
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(400).send("Receiver not found");
      return;
    }

    const sender = req.user as IUser;

    if (sender._id === receiver._id) {
      res.status(400).send("You cannot send request to yourself");
      return;
    }

    const existsFriend = await Friend.findOne({
      $or: [
        { sender: sender._id, receiver: receiver._id },
        { sender: receiver._id, receiver: sender._id },
      ],
    });

    if (existsFriend) {
      res.status(400).send("Friend already exists");
      return;
    }

    await Friend.create({
      sender: sender._id,
      receiver: receiver._id,
    });

    res.send("Send Request Successful");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const AcceptRequst: RequestHandler = async (req, res) => {
  try {
    const { friendshipId = "" } = req.body;
    if (!friendshipId || !mongoose.Types.ObjectId.isValid(friendshipId)) {
      res.status(400).send("Invalid Friend ID");
      return;
    }
    const friend = await Friend.findById(friendshipId);
    if (!friend) {
      res.status(400).send("Friend not found");
      return;
    }

    const authUser = req.user as IUser;

    if (authUser._id.toString() !== friend.receiver.toString()) {
      res.status(400).send("You are not the receiver of this friend request");
      return;
    }

    if (friend.status !== "pending") {
      res.status(400).send("Friend request is already accepted");
      return;
    }

    await Friend.findOneAndUpdate(
      { _id: friend._id },
      { $set: { status: "accepted" } },
      { new: true }
    );

    await createMessage({
      senderId: authUser._id,
      friendId: friend._id,
      receiverId: friend.sender.toString(),
      notification: `${authUser.name} accepted your friend request`,
    });

    res.send("Accept Friend Request Successful");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const RejectRequest: RequestHandler = async (req, res) => {
  try {
    const { friendshipId = "" } = req.body;
    if (!friendshipId || !mongoose.Types.ObjectId.isValid(friendshipId)) {
      res.status(400).send("Invalid Friend ID");
      return;
    }
    const friend = await Friend.findById(friendshipId);
    if (!friend) {
      res.status(400).send("Friend not found");
      return;
    }

    const authUser = req.user as IUser;

    if (authUser._id.toString() !== friend.receiver.toString()) {
      res.status(400).send("You are not the receiver of this friend request");
      return;
    }

    if (friend.status !== "pending") {
      res.status(400).send("Friend request is already accepted");
      return;
    }

    await Friend.findByIdAndDelete(friendshipId);

    res.send("Reject Friend Request Successful");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const BlockFriend: RequestHandler = async (req, res) => {
  try {
    const { friendshipId = "" } = req.body;
    if (!friendshipId || !mongoose.Types.ObjectId.isValid(friendshipId)) {
      res.status(400).send("Invalid Friend ID");
      return;
    }
    const friend = await Friend.findById(friendshipId)
      .populate("sender")
      .populate("receiver");
    if (!friend) {
      res.status(400).send("Friend not found");
      return;
    }

    if (friend.status !== "accepted") {
      res.status(400).send("You cannot block a friend that is not accepted");
      return;
    }

    const authUser = req.user as IUser;

    const isSender = friend.sender._id.toString() === authUser._id.toString();
    const isReceiver =
      friend.receiver._id.toString() === authUser._id.toString();
    const otherUser = isSender ? friend.receiver : friend.sender;

    if (!isSender && !isReceiver) {
      res.status(400).send("You are not eligible to block this user");
      return;
    }

    await Friend.findOneAndUpdate(
      { _id: friend._id },
      { $set: { isBlocked: true, blockedBy: authUser._id } },
      { new: true }
    );

    await createMessage({
      senderId: authUser._id,
      friendId: friend._id,
      receiverId: otherUser._id.toString(),
      notification: `${authUser.name} has blocked you`,
    });

    res.send("Block Friend Successful");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const UnBlockFriend: RequestHandler = async (req, res) => {
  try {
    const { friendshipId = "" } = req.body;
    if (!friendshipId || !mongoose.Types.ObjectId.isValid(friendshipId)) {
      res.status(400).send("Invalid Friend ID");
      return;
    }
    const friend = await Friend.findById(friendshipId);
    if (!friend) {
      res.status(400).send("Friend not found");
      return;
    }

    if (friend.status !== "accepted") {
      res.status(400).send("You cannot block a friend that is not accepted");
      return;
    }

    const authUser = req.user as IUser;

    const isSender = friend.sender._id.toString() === authUser._id.toString();
    const isReceiver =
      friend.receiver._id.toString() === authUser._id.toString();
    const otherUser = isSender ? friend.receiver : friend.sender;

    if (
      (!isSender && !isReceiver) ||
      friend.blockedBy.toString() !== authUser._id.toString()
    ) {
      res.status(400).send("You are not eligible to unblock this user");
      return;
    }

    await Friend.findOneAndUpdate(
      { _id: friend._id },
      { $set: { isBlocked: false, blockedBy: null } },
      { new: true }
    );

    // Create message
    await createMessage({
      senderId: authUser._id,
      friendId: friend._id,
      receiverId: otherUser._id.toString(),
      notification: `${authUser.name} has unblocked you`,
    });

    res.send("UnBlock Friend Successful");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const DeleteFriend: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const friendId = req.params.friendId;

    if (!friendId) {
      res.status(400).send("Friend ID is required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      res.status(400).send("Invalid Friend ID");
      return;
    }

    const friend = await Friend.findById(friendId);
    if (!friend) {
      res.status(400).send("Friend not found");
      return;
    }

    const isSender = friend.sender._id.toString() === authUser._id.toString();
    const isReceiver =
      friend.receiver._id.toString() === authUser._id.toString();

    if (!isSender && !isReceiver) {
      res.status(400).send("You are not eligible to block this user");
      return;
    }

    await Message.deleteMany({ friend: friendId });
    await Friend.findByIdAndDelete(friendId);

    res.send("Friend deleted successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
