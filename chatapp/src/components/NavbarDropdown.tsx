import { blockFriend, deleteFriend, unblockFriend } from "@/actions/friends";
import { deleteGroup, leaveGroup } from "@/actions/group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useStore from "@/lib/store";
import { parseError } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DiamondMinus,
  EllipsisVertical,
  PenBox,
  Shield,
  ShieldOff,
  Trash,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useSocket } from "@/contexts/SocketContext";
import { useState } from "react";
import GroupFormModal from "./GroupFormModal";

interface Props {
  showAddMemberModal: (groupId: string) => void;
  showDeleteMemberModal: (groupId: string) => void;
}

const NavbarDropdown: React.FC<Props> = ({
  showAddMemberModal,
  showDeleteMemberModal,
}) => {
  const { user, chatInfo: chatItem } = useStore((state) => state);
  const { socket } = useSocket();
  const [showGroupModal, setShowGroupModal] = useState(false);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate: blockUser, isPending: isBlocking } = useMutation({
    mutationFn: blockFriend,
    onSuccess: (_data, friendShipId) => {
      if (socket && friendShipId) {
        socket.emit("block-friend", {
          chatId: friendShipId,
        });
      }

      toast("You have blocked the user");
    },
    onError: (error) => {
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const { mutate: unBlockUser, isPending: isUnBlocking } = useMutation({
    mutationFn: unblockFriend,
    onSuccess: (_data, friendShipId) => {
      if (socket && friendShipId) {
        socket.emit("unblock-friend", {
          chatId: friendShipId,
        });
      }

      toast("You have unblocked the user");
    },
    onError: (error) => {
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const { mutate: deleteFriendship, isPending: isDeleting } = useMutation({
    mutationFn: deleteFriend,
    onSuccess: (_data, friendShipId) => {
      toast("You have deleted the friend");
      if (socket && friendShipId) {
        socket.emit("delete-friend", {
          chatId: friendShipId,
        });
      }
    },
    onError: (error) => {
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const { mutate: leave, isPending: isLeaving } = useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => {
      toast("You have left the group");
      queryClient.invalidateQueries(["getChatList"] as any);

      navigate("/chat");
    },
    onError: (error) => {
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const { mutate: handleDeleteGroup, isPending: isDeletingGroup } = useMutation(
    {
      mutationFn: deleteGroup,
      onSuccess: () => {
        toast("You have deleted the group");

        if (socket && chatItem?._id) {
          socket.emit("delete-group", {
            chatId: chatItem._id,
          });
        }

        queryClient.invalidateQueries(["getChatList"] as any);

        navigate("/chat");
      },
      onError: (error) => {
        const parsedError = parseError(error);
        toast(parsedError);
      },
    }
  );

  return (
    <>
      <GroupFormModal isOpen={showGroupModal} setIsOpen={setShowGroupModal} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 border-gray-300" align="end">
          {chatItem?.isGroup ? (
            <>
              {user?._id === String((chatItem as Group)?.owner) ? (
                <>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => showAddMemberModal(chatItem._id)}
                      className="w-full flex cursor-pointer "
                    >
                      <UserPlus />
                      <span>Add members</span>
                    </button>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => showDeleteMemberModal(chatItem._id)}
                      className="w-full flex cursor-pointer "
                    >
                      <UserMinus />
                      <span>Delete members</span>
                    </button>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => setShowGroupModal(true)}
                      className="w-full flex cursor-pointer "
                    >
                      <PenBox />
                      <span>Edit group</span>
                    </button>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <button
                      disabled={isDeletingGroup}
                      onClick={() => handleDeleteGroup(chatItem._id)}
                      className="w-full flex cursor-pointer text-destructive hover:!text-destructive"
                    >
                      <Trash className="text-destructive hover:!text-destructive" />
                      <span>Delete group</span>
                    </button>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <button
                    disabled={isLeaving}
                    onClick={() => leave(chatItem._id)}
                    className="w-full flex cursor-pointer text-destructive hover:!text-destructive"
                  >
                    <DiamondMinus className="text-destructive hover:!text-destructive" />
                    <span>Leave group</span>
                  </button>
                </DropdownMenuItem>
              )}
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <button
                  disabled={isDeleting}
                  onClick={() => deleteFriendship(chatItem?.friendShipId || "")}
                  className="w-full flex cursor-pointer"
                >
                  <Trash />
                  <span>Delete</span>
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                {!chatItem?.isGroup && chatItem?.isBlocked ? (
                  user?._id === String(chatItem.blockedBy) && (
                    <button
                      disabled={isUnBlocking}
                      onClick={() => unBlockUser(chatItem?.friendShipId || "")}
                      className="w-full flex cursor-pointer text-destructive hover:!text-destructive"
                    >
                      <ShieldOff className="text-destructive hover:!text-destructive" />
                      <span>Unblock</span>
                    </button>
                  )
                ) : (
                  <button
                    disabled={isBlocking}
                    onClick={() => blockUser(chatItem?.friendShipId || "")}
                    className="w-full flex cursor-pointer text-destructive hover:!text-destructive"
                  >
                    <Shield className="text-destructive hover:!text-destructive" />
                    <span>Block</span>
                  </button>
                )}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default NavbarDropdown;
