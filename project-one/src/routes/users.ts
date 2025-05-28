import { Router } from "express";
import { SearchUsersByEmailAndUsername } from "../controllers/users";
import { protect, softProtect } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";
import { UpdateUserAvatar } from "../controllers/users";

const router = Router();

router.get("/search", protect, SearchUsersByEmailAndUsername);
router.patch("/avatar", softProtect, upload.single("avatar"), UpdateUserAvatar);

export default router;
