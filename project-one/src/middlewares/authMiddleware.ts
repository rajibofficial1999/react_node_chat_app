import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user";

export const protect: RequestHandler = async (req, res, next) => {
  const token = req.cookies.chat_access_token;

  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).send("Unauthorized");
      return;
    }

    if (user.onBoarding) {
      res.status(401).send("Complete your profile first");
      return;
    }

    if (!user.isEmailVerified) {
      res.status(401).send("Verify your email first");
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};

export const softProtect: RequestHandler = async (req, res, next) => {
  const token = req.cookies.chat_access_token;

  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).send("Unauthorized");
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};
