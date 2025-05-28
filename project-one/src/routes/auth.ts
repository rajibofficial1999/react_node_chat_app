import { Router } from "express";
import {
  FinishOnboarding,
  ForgotPassword,
  LoggedInUser,
  ResendCode,
  ResetPassword,
  SignIn,
  SignOut,
  SignUp,
  UpdateUserInfo,
  VerifyCode,
} from "../controllers/auth";
import { softProtect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/signin", SignIn);
router.post("/signup", SignUp);
router.post("/signout", softProtect, SignOut);

router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);

router.get("/me", softProtect, LoggedInUser);

router.patch("/update-info", softProtect, UpdateUserInfo);
router.post("/verify-code", softProtect, VerifyCode);
router.post("/resend-code", softProtect, ResendCode);
router.patch("/finish-onboarding", softProtect, FinishOnboarding);

export default router;
