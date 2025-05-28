import { RequestHandler } from "express";
import { createTokenAndSetCookie, uploadBuffer } from "../lib/utils";
import { User } from "../models";
import jwt, { JwtPayload } from "jsonwebtoken";

export const SignIn: RequestHandler = async (req, res) => {
  try {
    const { username = "", password = "" } = req.body;
    if (!username || !password) {
      res.status(400).send("Please provide all fields");
      return;
    }
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password");
    if (!user) {
      res.status(400).send("The provided credentials are invalid");
      return;
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      res.status(400).send("The provided credentials are invalid");
      return;
    }

    const userObj = user.toObject();
    delete userObj.password;

    createTokenAndSetCookie(user, res);

    res.send({
      success: true,
      message: "Sign In Successful",
      user: userObj,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const SignUp: RequestHandler = async (req, res) => {
  try {
    const { name = "", username = "", password = "" } = req.body;
    if (!name || !username || !password) {
      res.status(400).send("Please provide all fields");
      return;
    }

    const existUser = await User.findOne({ username });

    if (existUser) {
      res.status(400).send("A user with this username already exists");
      return;
    }

    const newUser = await User.create({
      name,
      username,
      password,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    createTokenAndSetCookie(newUser, res);

    res.status(201).send({
      success: true,
      message: "Sign Up Successful",
      user: userObj,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const SignOut: RequestHandler = async (req, res) => {
  res.clearCookie("chat_access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  res.send("Sign Out Successful");
};

export const LoggedInUser: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const UpdateUserInfo: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;

    const { name = "", email = "" } = req.body;

    if (!name && !email) {
      res.status(400).send("Name and email are required");
      return;
    }

    const user = await User.findOne({ email });
    if (user) {
      res.status(400).send("The email already associated with an account");
      return;
    }

    const { code, codeExpiry } = generateCode();

    authUser.name = name;
    authUser.email = email;
    authUser.verifiedToken = code.toString();
    authUser.verfiedTokenExpires = codeExpiry;

    await authUser.save();

    // Send verification email
    console.log(code);

    res.send("User updated successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const FinishOnboarding: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;

    if (!authUser.onBoarding) {
      res.status(400).send("You've already completed your profile");
      return;
    }

    if (!authUser.avatar || !authUser.email) {
      res.status(400).send("Please add your avatar and email first");
      return;
    }

    authUser.onBoarding = false;

    await authUser.save();

    res.send("Onboarding completed successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const VerifyCode: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;

    const { code } = req.body;

    if (!code) {
      res.status(400).send("Code is required");
      return;
    }

    const user = await User.findById(authUser._id).select("+verifiedToken");

    if (user.verifiedToken !== code) {
      res.status(400).send("Invalid code");
      return;
    }

    // check if code is expired
    if (user.verfiedTokenExpires < new Date()) {
      res.status(400).send("Code has expired");
      return;
    }

    user.isEmailVerified = true;
    user.verifiedToken = null;
    user.verfiedTokenExpires = null;

    await user.save();

    res.send("Email verified successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const ResendCode: RequestHandler = async (req, res) => {
  try {
    const authUser = req.user as IUser;

    if (authUser.verfiedTokenExpires > new Date()) {
      res.status(400).send("You can only resend the code once per minute");
      return;
    }

    const { code, codeExpiry } = generateCode();

    authUser.verifiedToken = code.toString();
    authUser.verfiedTokenExpires = codeExpiry;

    await authUser.save();

    // Send verification email
    console.log(code);

    res.send("Code resent successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const ForgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email = "" } = req.body;
    if (!email) {
      res.status(400).send("Email is required");
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send("The provided email is invalid");
      return;
    }

    const token = generatePasswordResetToken(user);

    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Send verification email
    console.log(url);

    res.send("Password reset link sent successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const ResetPassword: RequestHandler = async (req, res) => {
  try {
    const { password = "" } = req.body;
    const token = req.headers.authorization as string;

    if (!token) {
      res.status(400).send("Authorization token is not provided");
      return;
    }

    if (!password) {
      res.status(400).send("Password is required");
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).send("Invalid token");
      return;
    }

    user.password = password;

    await user.save();

    res.send("Password reset successfully");
  } catch (error: any) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

const generateCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000);
  const codeExpiry = new Date();
  codeExpiry.setMinutes(codeExpiry.getMinutes() + 1);

  return { code, codeExpiry };
};

const generatePasswordResetToken = (user: IUser) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  return token;
};
