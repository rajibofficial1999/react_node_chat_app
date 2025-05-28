import { RequestHandler } from "express";
import { Group, Message, User } from "../models";
import { createMessage, uploadBuffer } from "../lib/utils";
import mongoose from "mongoose";
import { format } from "date-fns";

export const GetGroupById: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const groupId = req.params.groupId;

    if (!groupId) {
      res.status(404).send("Group ID is required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(404).send("Invalid Group ID");
      return;
    }

    const group = await Group.findById(groupId)
      .populate({
        path: "members",
        select: "name _id avatar",
      })
      .populate({
        path: "owner",
        select: "name _id avatar",
      })
      .select("-lastMessage -messages");

    if (!group) {
      res.status(404).send("Group not found");
      return;
    }

    if (group.owner._id.toString() !== authUser._id.toString()) {
      const isMember = group.members.some(
        (member: any) => member._id.toString() === authUser._id.toString()
      );

      if (!isMember) {
        res.status(400).send("You are not a member of this group");
        return;
      }
    }

    res.send({
      ...group.toObject(),
      isGroup: true,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const Create: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const { name = "", description = "" } = req.body;

    const file = req.file as Express.Multer.File;

    if (!name) {
      res.status(400).send("Group name is required");
      return;
    }

    if (!file) {
      res.status(400).send("Avatar is required");
      return;
    }

    const result = await uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype
    );
    const avatarUrl = (result as any).secure_url;

    // Create group in DB
    const group = new Group({
      name,
      description: description || null,
      avatar: avatarUrl,
      owner: authUser._id,
    });

    await group.save();

    // Create message
    await createMessage({
      senderId: authUser._id,
      groupId: group._id,
      notification: `A new group is created by ${authUser.name}`,
    });

    res.send("Group created successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const AddMember: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const { groupId = "", userId = "" } = req.body;

    if (!groupId || !userId) {
      res.status(400).send("Group ID and User ID are required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).send("Invalid Group ID");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).send("Invalid User ID");
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(400).send("Group not found");
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(400).send("User not found");
      return;
    }

    if (group.owner.toString() !== authUser._id.toString()) {
      res.status(400).send("Only admin can add members to this group");
      return;
    }

    if (
      group.members.some((member) => member.toString() === userId.toString())
    ) {
      res.status(400).send("User is already a member of this group");
      return;
    }

    if (userId === authUser._id) {
      res.status(400).send("You cannot add yourself to this group");
      return;
    }

    await Group.findOneAndUpdate(
      { _id: group._id },
      { $push: { members: userId } },
      { new: true }
    );

    // Create message
    await createMessage({
      senderId: authUser._id,
      groupId: group._id,
      notification: `Added ${user.name} to the group`,
    });

    res.send("Member added successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const RemoveMember: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const { groupId = "", userId = "" } = req.body;

    if (!groupId || !userId) {
      res.status(400).send("Group ID and User ID are required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).send("Invalid Group ID");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).send("Invalid User ID");
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(400).send("Group not found");
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(400).send("User not found");
      return;
    }

    if (group.owner.toString() !== authUser._id.toString()) {
      res.status(400).send("Only admin can remove members from this group");
      return;
    }

    if (
      !group.members.some((member) => member.toString() === userId.toString())
    ) {
      res.status(400).send("User is not a member of this group");
      return;
    }

    await Group.findOneAndUpdate(
      { _id: group._id },
      { $pull: { members: userId } },
      { new: true }
    );

    // Create message
    await createMessage({
      senderId: authUser._id,
      groupId: group._id,
      notification: `Removed ${user.name} from the group`,
    });

    res.send("Member removed successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const LeaveGroup: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const { groupId = "" } = req.body;

    if (!groupId) {
      res.status(400).send("Group ID is required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).send("Invalid Group ID");
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(400).send("Group not found");
      return;
    }

    if (
      !group.members.some(
        (member) => member.toString() === authUser._id.toString()
      )
    ) {
      res.status(400).send("You are not a member of this group");
      return;
    }

    await Group.findOneAndUpdate(
      { _id: group._id },
      { $pull: { members: authUser._id } },
      { new: true }
    );

    // Create message
    await createMessage({
      senderId: authUser._id,
      groupId: group._id,
      notification: `${authUser.name} left the group`,
    });

    res.send("Group left successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const UpdateGroup: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const { name = "", description = "" } = req.body;
    const groupId = req.params.groupId;

    if (!groupId) {
      res.status(400).send("Group ID is required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).send("Invalid Group ID");
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(400).send("Group not found");
      return;
    }

    if (group.owner.toString() !== authUser._id.toString()) {
      res.status(400).send("Only admin can Edit this group");
      return;
    }

    if (!name && !description) {
      res.status(400).send("Name and description are required");
      return;
    }

    await Group.findOneAndUpdate(
      { _id: group._id },
      { $set: { name, description } },
      { new: true }
    );

    res.send("Group updated successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const UpdateAvatar: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const groupId = req.params.groupId;
    const file = req.file;

    if (!groupId) {
      res.status(404).send("Group ID is required");
      return;
    }

    if (!file) {
      res.status(404).send("Avatar is required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(404).send("Invalid Group ID");
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).send("Group not found");
      return;
    }

    if (group.owner.toString() !== authUser._id.toString()) {
      res.status(400).send("Only admin can Edit this group");
      return;
    }

    const result = await uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype
    );
    const avatarUrl = (result as any).secure_url;

    await Group.findOneAndUpdate(
      { _id: group._id },
      { $set: { avatar: avatarUrl } },
      { new: true }
    );

    // Create message
    await createMessage({
      senderId: authUser._id,
      groupId: group._id,
      notification: `Admin changed the group avatar`,
    });

    res.send("Avatar updated successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const deleteGroup: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const groupId = req.params.groupId;

    if (!groupId) {
      res.status(400).send("Group ID is required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).send("Invalid Group ID");
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(400).send("Group not found");
      return;
    }

    if (group.owner.toString() !== authUser._id.toString()) {
      res.status(400).send("Only admin can delete this group");
      return;
    }

    await Message.deleteMany({ group: groupId });

    await Group.findByIdAndDelete(groupId);

    res.send("Group deleted successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const getGroupMembers: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const groupId = req.params.groupId;

    if (!groupId) {
      res.status(400).send("Group ID is required");
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      res.status(400).send("Invalid Group ID");
      return;
    }

    const group = await Group.findById(groupId);
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

    const members = await User.find({ _id: { $in: group.members } });

    res.send(members);
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
