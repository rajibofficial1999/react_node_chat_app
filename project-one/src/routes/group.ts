import { Router } from "express";

import {
  AddMember,
  Create,
  deleteGroup,
  getGroupMembers,
  LeaveGroup,
  RemoveMember,
  UpdateAvatar,
  UpdateGroup,
  GetGroupById,
} from "../controllers/group";
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/:groupId", protect, GetGroupById);
router.get("/members/:groupId", protect, getGroupMembers);
router.post("/", protect, upload.single("avatar"), Create);
router.post("/members/add", protect, AddMember);
router.post("/members/remove", protect, RemoveMember);
router.post("/members/leave", protect, LeaveGroup);
router.patch("/:groupId", protect, UpdateGroup);
router.patch(
  "/avatar/:groupId",
  protect,
  upload.single("avatar"),
  UpdateAvatar
);
router.delete("/:groupId", protect, deleteGroup);

export default router;
