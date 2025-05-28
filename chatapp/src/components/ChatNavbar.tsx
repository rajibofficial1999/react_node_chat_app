import { getFriendById } from "@/actions/friends";
import { addGroupMember, getGroupById, getGroupMembers } from "@/actions/group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/contexts/SocketContext";
import useStore from "@/lib/store";
import { cn, parseError } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Menu, Phone, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ChatInfoModal from "./ChatInfoModal";
import NavbarDropdown from "./NavbarDropdown";
import RemoveMemberModal from "./RemoveMemberModal";
import SearchUserModal from "./SearchUserModal";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

const ChatNavbar = () => {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingStateProps | null>(
    null
  );

  const { setShowChatSidebar, chatInfo: chatItem } = useStore((state) => state);

  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const navigate = useNavigate();

  const { data: fetchedMembers } = useQuery({
    queryKey: ["getMembers", groupId],
    queryFn: ({ queryKey }) => {
      const [, key] = queryKey;
      return getGroupMembers(key);
    },
    enabled: !!groupId && (isAddMemberModalOpen || isDeleteMemberModalOpen),
  });

  const { mutate } = useMutation({
    mutationFn: addGroupMember,

    onSuccess: (_data, variables) => {
      setLoadingState(null);
      toast("Member added successfully");

      if (socket && groupId && variables?.userId) {
        socket.emit("add-group-member", {
          chatId: groupId,
          addedUserId: variables.userId,
        });

        socket.emit("add-group-member", {
          chatId: groupId,
        });
      }

      queryClient.invalidateQueries(["getMembers", groupId] as any);
    },
    onError: (error) => {
      setLoadingState(null);
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const handleAddMember = (userId: string) => {
    setLoadingState({
      [userId]: true,
    });
    mutate({
      groupId,
      userId,
    });
  };

  const { data: fetchedChatInfo } = useQuery({
    queryKey: ["chatInfo", chatItem?._id],
    queryFn: ({ queryKey }) => {
      const [, key] = queryKey;
      if (!chatItem?.isGroup) {
        return getFriendById(key as string);
      }
      return getGroupById(key as string);
    },
    enabled: !!chatItem?._id && showChatModal,
  });

  const makeAudioCall = () => {
    navigate(`/audio-call/${chatItem?._id}`);
  };

  const makeVideoCall = () => {
    navigate(`/video-call/${chatItem?._id}`);
  };

  return (
    <>
      <ChatInfoModal
        isOpen={showChatModal}
        setIsOpen={setShowChatModal}
        chatInfo={fetchedChatInfo}
      />
      <SearchUserModal
        isOpen={isAddMemberModalOpen}
        setIsOpen={setIsAddMemberModalOpen}
        handleAction={(userId: string) => handleAddMember(userId)}
        onClose={() => setGroupId("")}
        filterUsers={(fetchedMembers && fetchedMembers) || []}
        loadingState={loadingState}
        setLoadingState={setLoadingState}
        isGroup={true}
      />

      <RemoveMemberModal
        isOpen={isDeleteMemberModalOpen}
        setIsOpen={setIsDeleteMemberModalOpen}
        groupId={groupId}
        setGroupId={setGroupId}
        members={(fetchedMembers && fetchedMembers) || []}
        loadingState={loadingState}
        setLoadingState={setLoadingState}
      />

      <div className="flex justify-between items-center border-b border-gray-300 w-full sticky top-0 z-10 bg-white px-4 h-14">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer md:hidden"
            onClick={() => setShowChatSidebar(true)}
          >
            <Menu />
          </Button>
          <button
            className="cursor-pointer"
            onClick={() => setShowChatModal(true)}
          >
            <Avatar className="size-10">
              <AvatarImage src={chatItem?.avatar} />
              <AvatarFallback>{chatItem?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
          <button
            className="cursor-pointer"
            onClick={() => setShowChatModal(true)}
          >
            <h1 className="font-semibold">{chatItem?.name}</h1>
          </button>
        </div>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn("cursor-pointer", {
              "cursor-not-allowed": !chatItem?.isGroup && chatItem?.isBlocked,
            })}
            disabled={!chatItem?.isGroup && chatItem?.isBlocked}
            onClick={makeAudioCall}
          >
            <Phone />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("cursor-pointer", {
              "cursor-not-allowed": !chatItem?.isGroup && chatItem?.isBlocked,
            })}
            disabled={!chatItem?.isGroup && chatItem?.isBlocked}
            onClick={makeVideoCall}
          >
            <Video />
          </Button>
          <NavbarDropdown
            showAddMemberModal={(groupId) => {
              setIsAddMemberModalOpen(true);
              setGroupId(groupId);
            }}
            showDeleteMemberModal={(groupId) => {
              setIsDeleteMemberModalOpen(true);
              setGroupId(groupId);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ChatNavbar;
