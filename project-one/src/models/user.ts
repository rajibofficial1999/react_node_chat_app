import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          return /^[a-zA-Z0-9_]+$/.test(value);
        },
        message: "Please provide a valid username",
      },
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Please provide a valid email address",
      },
    },
    avatar: {
      type: String,
    },
    onBoarding: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verifiedToken: {
      type: String,
      select: false,
    },
    verfiedTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this as IUser;

  if (!user.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
