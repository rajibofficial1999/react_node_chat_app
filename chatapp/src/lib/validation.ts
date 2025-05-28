import { z } from "zod";

export const signinSchema = z.object({
  username: z
    .string({ required_error: "Username or email is required" })
    .nonempty("Username or email is required"),
  password: z
    .string({ required_error: "Password is required" })
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .nonempty("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name must be at most 30 characters"),
  username: z
    .string({ required_error: "Username is required" })
    .nonempty("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .refine((val) => /^[a-zA-Z0-9_]+$/.test(val), {
      message: "Username can only contain letters, numbers, and underscores",
    })
    .refine((val) => !/^\d+$/.test(val), {
      message: "Username cannot be only numbers",
    }),
  password: z
    .string({ required_error: "Password is required" })
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password must be at most 30 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

export const groupCreateSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .nonempty("Name is required")
    .max(50, "Name must be at most 50 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .nonempty("Description is required")
    .max(90, "Description must be at most 90 characters"),
  avatar: z
    .instanceof(File, { message: "Avatar must be a file" })
    .optional()
    .refine((file) => file && file.size >= 0, {
      message: "Avatar is required",
    })
    .refine((file) => file && file.size <= 3 * 1024 * 1024, {
      message: "Avatar must be less than 5MB",
    })
    .refine(
      (file) =>
        file &&
        ["image/jpeg", "image/png", "image/webp", , "image/jpg"].includes(
          file.type
        ),
      {
        message: "Only JPEG, PNG, or WEBP images are allowed",
      }
    ),
});

export const groupUpdateSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .nonempty("Name is required")
    .max(50, "Name must be at most 50 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .nonempty("Description is required")
    .max(90, "Description must be at most 90 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email address is required" })
    .nonempty("Email address is required")
    .email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string({ required_error: "Password is required" })
      .nonempty("Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(30, "Password must be at most 30 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
        "Password must include uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .nonempty("Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SigninData = z.infer<typeof signinSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type GroupCreateData = z.infer<typeof groupCreateSchema>;
export type GroupUpdateData = z.infer<typeof groupUpdateSchema>;
