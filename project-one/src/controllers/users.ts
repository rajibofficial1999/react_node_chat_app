import { RequestHandler } from "express";
import { User } from "../models";
import { uploadBuffer } from "../lib/utils";

export const SearchUsersByEmailAndUsername: RequestHandler = async (
  req,
  res
) => {
  try {
    const { key = "" } = req.query;
    const authUser = req.user as IUser;

    if (!key) {
      res.status(400).send("Search key is required");
      return;
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: key, $options: "i" } },
            { username: { $regex: key, $options: "i" } },
            { email: { $regex: key, $options: "i" } },
          ],
        },
        { _id: { $ne: authUser._id } },
      ],
    });

    res.send(users);
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const UpdateUserAvatar: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;
    const file = req.file;

    if (!file) {
      res.status(404).send("Avatar is required");
      return;
    }

    const result = await uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype
    );
    const avatarUrl = (result as any).secure_url;

    await User.findOneAndUpdate(
      { _id: authUser._id },
      { $set: { avatar: avatarUrl } },
      { new: true }
    );

    res.send("Avatar updated successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
