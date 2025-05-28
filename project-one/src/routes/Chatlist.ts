import { Router } from "express";
import { GetChatList } from "../controllers/chatList";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", protect, GetChatList);

export default router;
