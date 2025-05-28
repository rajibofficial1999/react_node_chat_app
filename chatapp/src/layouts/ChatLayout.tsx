import { getChatList } from "@/actions/friends";
import ChatListSkeleton from "@/components/ChatListSkeleton";
import ChatSidebar from "@/components/ChatSidebar";
import { useSocket } from "@/contexts/SocketContext";
import useStore from "@/lib/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router";

const ChatLayout = () => {
  const { socket } = useSocket();
  const { user, setMessageTypingInfo } = useStore((state) => state);
  const { chatId } = useParams();

  const queryClient = useQueryClient();

  const { data: chatList, isLoading } = useQuery({
    queryKey: ["getChatList"],
    queryFn: getChatList,
  });

  const refreshMessageAndChatList = (eventChatId: string) => {
    queryClient.invalidateQueries(["getChatList"] as any);
    if (chatId && chatId === eventChatId) {
      queryClient.invalidateQueries(["getMessageData", eventChatId] as any);
    }
  };

  useEffect(() => {
    if (!socket || !user || !chatList) return;

    // Leave all previously joined rooms
    socket.emit("leave-all-rooms");

    for (const chat of chatList) {
      socket.emit("join-chat", {
        userId: user._id,
        chatId: chat._id,
        isGroup: chat.isGroup,
      });
    }
  }, [socket, user, chatList]);

  useEffect(() => {
    if (!socket) return;

    const handleRefresh = (data: { chatId: string; message?: any }) => {
      refreshMessageAndChatList(data.chatId);
    };

    const handleTypingDetected = (data: { chatId: string; userId: string }) => {
      setMessageTypingInfo({
        userId: data.userId,
        chatId: data.chatId,
      });
    };

    const handleTypingUndetected = (_data: {
      chatId: string;
      userId: string;
    }) => {
      setMessageTypingInfo(null);
    };

    socket.on("receive-message", handleRefresh);
    socket.on("friend-blocked", handleRefresh);
    socket.on("friend-unblocked", handleRefresh);
    socket.on("friend-deleted", handleRefresh);
    socket.on("group-member-added", handleRefresh);
    socket.on("group-member-removed", handleRefresh);
    socket.on("group-deleted", handleRefresh);
    socket.on("group-updated", handleRefresh);
    socket.on("group-avatar-changed", handleRefresh);
    socket.on("user-avatar-changed", handleRefresh);
    socket.on("friend-accepted", handleRefresh);
    socket.on("user-unblocked", handleRefresh);
    socket.on("typing-detected", handleTypingDetected);
    socket.on("typing-undetected", handleTypingUndetected);
    socket.on("message-has-seen", handleRefresh);

    return () => {
      socket.off("receive-message", handleRefresh);
      socket.off("friend-blocked", handleRefresh);
      socket.off("friend-unblocked", handleRefresh);
      socket.off("friend-deleted", handleRefresh);
      socket.off("group-member-added", handleRefresh);
      socket.off("group-member-removed", handleRefresh);
      socket.off("group-deleted", handleRefresh);
      socket.off("group-updated", handleRefresh);
      socket.off("group-avatar-changed", handleRefresh);
      socket.off("user-avatar-changed", handleRefresh);
      socket.off("friend-accepted", handleRefresh);
      socket.off("user-unblocked", handleRefresh);
      socket.off("typing-detected", handleTypingDetected);
      socket.off("typing-undetected", handleTypingUndetected);
      socket.off("message-has-seen", handleRefresh);
    };
  }, [socket, chatList]);

  return (
    <div className="w-full flex ">
      {isLoading ? (
        <ChatListSkeleton />
      ) : (
        <ChatSidebar chatList={chatList || []} />
      )}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;
