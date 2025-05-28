import { unblockFriend } from "@/actions/friends";
import { useSocket } from "@/contexts/SocketContext";
import { parseError } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldBan } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import LoaderButton from "./LoaderButton";
import Modal from "./Modal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  friends: ChatItem[] | undefined;
}

const BlockedUsersModal: React.FC<Props> = ({ isOpen, setIsOpen, friends }) => {
  const [loadingState, setLoadingState] = useState<LoadingStateProps | null>(
    null
  );
  const [unblockedUserId, setUnblockedUserId] = useState("");

  const queryClient = useQueryClient();

  const { socket } = useSocket();

  const { mutate } = useMutation({
    mutationFn: unblockFriend,

    onSuccess: (_data, friendshipId) => {
      setLoadingState(null);
      toast("Request accepted successfully");

      if (socket && friendshipId && unblockedUserId) {
        socket.emit("unblock-user", {
          chatId: friendshipId,
          unblockedUserId,
        });
      }

      queryClient.invalidateQueries(["getBlockedUsers"] as any);
    },
    onError: (error) => {
      setLoadingState(null);
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const handleUnblockedFriend = (friendId: string, userId?: string) => {
    setUnblockedUserId(userId || "");
    setLoadingState({
      [friendId]: true,
    });
    mutate(friendId);
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
                    <AvatarImage src={friendItem?.friend?.avatar} />
                    <AvatarFallback>
                      {friendItem?.friend?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <h1 className="font-semibold text-sm">
                        {friendItem?.friend?.name}
                      </h1>
                      {/* <p className="text-sm text-gray-500">
                        Join on{" "}
                        {format(
                          friendItem?.user?.createdAt || "",
                          "dd MMM yyyy"
                        )}
                      </p> */}
                    </div>
                    <LoaderButton
                      size="sm"
                      variant="outline"
                      className="border-gray-300"
                      isLoading={isLoadingUserButton}
                      hideContentIfLoading={true}
                      onClick={() => {
                        setLoadingState({
                          [friendItem._id]: true,
                        });
                        handleUnblockedFriend(
                          friendItem._id,
                          friendItem.friend._id
                        );
                      }}
                    >
                      <ShieldBan /> <span>Unblock</span>
                    </LoaderButton>
                  </div>
                </li>
              );
            })
          ) : (
            <p className="text-center text-sm">No blocked friends available</p>
          )}
        </ul>
      </ScrollArea>
    </Modal>
  );
};

export default BlockedUsersModal;
