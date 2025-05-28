import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { GetMessages, MarkAsRead, SendMessage } from "../controllers/messages";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/:id", protect, GetMessages);
router.post("/send", protect, upload.array("attachments", 5), SendMessage);
router.patch("/:id/mark-as-read", protect, MarkAsRead);

export default router;
