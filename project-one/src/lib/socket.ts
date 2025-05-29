import { Server, Socket } from "socket.io";
import { Friend, Group, User } from "../models";

export const socketEvents = async (
  socket: Socket,
  io: Server,
  userIdToSocketId: Map<string, string>,
  socketIdToUserId: Map<string, string>
) => {
  socket.on("user-online", (userId) => {
    userIdToSocketId.set(userId, socket.id);
    socketIdToUserId.set(socket.id, userId);
    socket.join(userId);
    io.emit("online-users", Array.from(userIdToSocketId.keys()));
  });

  socket.on("join-chat", async ({ userId, chatId, isGroup }) => {
    let chatItem: IFriend | IGroup | null = null;
    let isAuthorized = false;

    try {
      if (isGroup) {
        chatItem = (await Group.findById(chatId)) as IGroup;
        isAuthorized =
          chatItem?.owner.toString() === userId.toString() ||
          chatItem?.members.some(
            (member) => member.toString() === userId.toString()
          );
      } else {
        chatItem = (await Friend.findById(chatId)) as IFriend;
        isAuthorized =
          chatItem?.sender.toString() === userId.toString() ||
          chatItem?.receiver.toString() === userId.toString();
      }

      if (isAuthorized) {
        socket.join(chatId);
      } else {
        console.warn(`Unauthorized join attempt by ${userId} to ${chatId}`);
      }
    } catch (error) {
      console.error("join-chat error:", error);
    }
  });
  socket.on("send-message", ({ chatId, message }) => {
    io.to(chatId).emit("receive-message", { chatId, message });
  });

  socket.on("logout", (userId) => {
    userIdToSocketId.delete(userId);
    io.emit("online-users", Array.from(userIdToSocketId.keys()));
  });

  socket.on("block-friend", ({ chatId }) => {
    io.to(chatId).emit("friend-blocked", { chatId });
  });

  socket.on("unblock-friend", ({ chatId }) => {
    io.to(chatId).emit("friend-unblocked", { chatId });
  });

  socket.on("delete-friend", ({ chatId }) => {
    io.to(chatId).emit("friend-deleted", { chatId });
  });

  socket.on("add-group-member", ({ chatId, addedUserId }) => {
    const socketId = userIdToSocketId.get(addedUserId);

    if (socketId) {
      socket.to(socketId).emit("group-member-added", { chatId });
    }
  });

  socket.on("add-group-member", ({ chatId }) => {
    socket.to(chatId).emit("group-member-added", { chatId });
  });

  socket.on("remove-group-member", ({ chatId }) => {
    io.to(chatId).emit("group-member-removed", { chatId }); //send to sender also
  });

  socket.on("delete-group", ({ chatId }) => {
    socket.to(chatId).emit("group-deleted", { chatId });
  });

  socket.on("update-group", ({ chatId }) => {
    io.to(chatId).emit("group-updated", { chatId }); //send to sender also
  });

  socket.on("change-group-avatar", ({ chatId }) => {
    socket.to(chatId).emit("group-avatar-changed", { chatId });
  });

  socket.on("change-user-avatar", async ({ userId }) => {
    const user = await User.findById(userId);
    if (!user) {
      return;
    }

    // Find all accepted friend relationships
    const friends = await Friend.find({
      isBlocked: false,
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }],
    });

    for (const friend of friends) {
      const chatId = friend._id.toString();
      io.to(chatId).emit("user-avatar-changed", {
        chatId,
      });
    }
  });

  socket.on("accept-friend", ({ chatId, acceptedUserId }) => {
    const socketId = userIdToSocketId.get(acceptedUserId);

    if (socketId) {
      io.to(socketId).emit("friend-accepted", { chatId });
    }
  });

  socket.on("unblock-user", ({ chatId, unblockedUserId }) => {
    const socketId = userIdToSocketId.get(unblockedUserId);

    if (socketId) {
      io.to(socketId).emit("user-unblocked", { chatId });
    }
  });

  socket.on("message-is-typing", ({ chatId, name }) => {
    socket.to(chatId).emit("typing-detected", { chatId, name });
  });

  socket.on("message-is-not-typing", ({ chatId, name }) => {
    socket.to(chatId).emit("typing-undetected", { chatId, name });
  });

  socket.on("seen-message", ({ chatId }) => {
    socket.to(chatId).emit("message-has-seen", { chatId });
  });

  socket.on("call-user", ({ to, offer }) => {
    const socketId = userIdToSocketId.get(to);
    const userId = socketIdToUserId.get(socket.id);

    if (socketId && userId) {
      io.to(socketId).emit("incoming-call", { from: userId, offer });
    }
  });

  socket.on("call-accepted", ({ callerId, answer }) => {
    const socketId = userIdToSocketId.get(callerId);

    if (socketId) {
      socket.to(socketId).emit("call-accepted", { answer });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, id] of userIdToSocketId.entries()) {
      if (id === socket.id) {
        userIdToSocketId.delete(userId);
        break;
      }
    }
    io.emit("online-users", Array.from(userIdToSocketId.keys()));
  });
};
