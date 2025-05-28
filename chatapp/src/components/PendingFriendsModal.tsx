import { acceptFriendRequest, rejectFriendRequest } from "@/actions/friends";
import { parseError } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronDown, Loader, Trash, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Modal from "./Modal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { useSocket } from "@/contexts/SocketContext";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  friends: Friend[] | undefined;
}

const PendingFriendsModal: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  friends,
}) => {
  const [loadingState, setLoadingState] = useState<LoadingStateProps | null>(
    null
  );
  const [acceptedUserId, setAcceptedUserId] = useState("");

  const queryClient = useQueryClient();

  const { socket } = useSocket();

  const { mutate } = useMutation({
    mutationFn: acceptFriendRequest,

    onSuccess: (_data, friendshipId) => {
      setLoadingState(null);
      toast("Request accepted successfully");

      if (socket && friendshipId && acceptedUserId) {
        socket.emit("accept-friend", {
          chatId: friendshipId,
          acceptedUserId,
        });
      }

      queryClient.invalidateQueries(["getFriends"] as any);
    },
    onError: (error) => {
      setLoadingState(null);
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const handleAcceptFriend = (friendId: string, userId?: string) => {
    setAcceptedUserId(userId || "");
    setLoadingState({
      [friendId]: true,
    });
    mutate(friendId);
  };

  const { mutate: rejectMutation } = useMutation({
    mutationFn: rejectFriendRequest,

    onSuccess: () => {
      setLoadingState(null);
      toast("Request rejected successfully");

      queryClient.invalidateQueries(["getPendingFriends"] as any);
    },
    onError: (error) => {
      setLoadingState(null);
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const handleRejectFriend = (friendId: string) => {
    setLoadingState({
      [friendId]: true,
    });
    rejectMutation(friendId);
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} preventMobileModal={true}>
      <ScrollArea className="max-h-[300px] px-5">
        <ul className="w-full space-y-2 divide-y divide-gray-200">
          {friends && friends.length > 0 ? (
            friends.map((friendItem) => {
              const isLoadingUserButton = loadingState?.[friendItem._id];

              return (
                <li
                  className="flex items-center gap-2 pb-2"
                  key={friendItem._id}
                >
                  <Avatar className="size-10">
                    <AvatarImage src={friendItem?.user?.avatar} />
                    <AvatarFallback>
                      {friendItem?.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <h1 className="font-semibold text-sm">
                        {friendItem?.user?.name}
                      </h1>
                      <p className="text-sm text-gray-500">
                        Join on{" "}
                        {format(
                          friendItem?.user?.createdAt || "",
                          "dd MMM yyyy"
                        )}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        disabled={isLoadingUserButton}
                      >
                        <Button
                          variant="outline"
                          className="cursor-pointer border-gray-300"
                        >
                          <span>Options</span>
                          {isLoadingUserButton ? (
                            <Loader className="animate-spin" />
                          ) : (
                            <ChevronDown />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-48 border-gray-300"
                        align="end"
                      >
                        <DropdownMenuItem asChild>
                          <button
                            className="w-full flex cursor-pointer"
                            onClick={() =>
                              handleAcceptFriend(
                                friendItem._id,
                                friendItem.user?._id
                              )
                            }
                          >
                            <UserPlus />
                            <span>Accept</span>
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <button
                            className="w-full flex cursor-pointer text-destructive hover:!text-destructive"
                            onClick={() => handleRejectFriend(friendItem._id)}
                          >
                            <Trash className="text-destructive hover:!text-destructive" />
                            <span>Delete</span>
                          </button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              );
            })
          ) : (
            <p className="text-center text-sm">No pending friends available</p>
          )}
        </ul>
      </ScrollArea>
    </Modal>
  );
};

export default PendingFriendsModal;
