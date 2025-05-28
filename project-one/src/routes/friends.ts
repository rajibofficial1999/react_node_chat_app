import { Router } from "express";
import {
  AcceptRequst,
  BlockFriend,
  DeleteFriend,
  RejectRequest,
  SendRequst,
  UnBlockFriend,
  GetBlockedFriends,
  GetPendingFriends,
  GetAllFriends,
  GetFriendById,
} from "../controllers/friend";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", protect, GetAllFriends);
router.get("/pending", protect, GetPendingFriends);
router.get("/blocked", protect, GetBlockedFriends);
router.post("/send-request", protect, SendRequst);
router.post("/accept-request", protect, AcceptRequst);
router.post("/reject-request", protect, RejectRequest);
router.post("/block", protect, BlockFriend);
router.post("/unblock", protect, UnBlockFriend);
router.delete("/:friendId", protect, DeleteFriend);
router.get("/:friendId", protect, GetFriendById);

export default router;
