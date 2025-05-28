import { ScrollArea } from "@/components/ui/scroll-area";
import useStore from "@/lib/store";
import { cn, formatRelativeDate, parseError } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Ban, UserPlus, X } from "lucide-react";
import { Link, useParams } from "react-router";
import SidebarDropdown from "./SidebarDropdown";
import { Button } from "./ui/button";
import SearchUserModal from "./SearchUserModal";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllFriends, sendFriendRequest } from "@/actions/friends";
import { toast } from "sonner";

interface Props {
  chatList: ChatItem[];
}

const ChatSidebar: React.FC<Props> = ({ chatList }) => {
  const { chatId } = useParams();
  const { user, onlineUsersId, isShowChatSidebar, setShowChatSidebar } =
    useStore((state) => state);

  const [showModal, setShowModal] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingStateProps | null>(
    null
  );

  const queryClient = useQueryClient();

  const { data: fetchedFriends } = useQuery({
    queryKey: ["getFriends"],
    queryFn: getAllFriends,
    enabled: showModal,
  });

  const { mutate } = useMutation({
    mutationFn: sendFriendRequest,

    onSuccess: () => {
      setLoadingState(null);
      toast("Request sent successfully");

      queryClient.invalidateQueries(["getFriends"] as any);
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
    mutate(userId);
  };

  return (
    <>
      <SearchUserModal
        isOpen={showModal}
        setIsOpen={setShowModal}
        handleAction={(userId: string) => handleAddMember(userId)}
        filterUsers={fetchedFriends || []}
        loadingState={loadingState}
        setLoadingState={setLoadingState}
      />

      <aside
        className={cn(
          "w-full min-w-[320px] max-w-[320px] h-screen flex-col border-r border-gray-300 hidden md:flex",
          {
            "!flex absolute left-0 top-0 z-20 w-full min-w-screen max-w-screen bg-white":
              isShowChatSidebar,
          }
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-300 px-4 max-h-14 min-h-14 h-full">
          <h1 className="font-bold">Chats</h1>
          <div className="flex items-center gap-2">
            <Button
              className="cursor-pointer"
              variant="ghost"
              size="icon"
              onClick={() => setShowModal(true)}
            >
              <UserPlus />
            </Button>

            <Button
              className="cursor-pointer md:hidden"
              variant="ghost"
              size="icon"
              onClick={() => setShowChatSidebar(false)}
            >
              <X />
            </Button>
          </div>
        </div>

        {/* Scrollable Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {chatList?.map((chat) => (
              <Link
                to={`/chat/${chat._id}`}
                key={chat._id}
                className={cn(
                  "flex items-center space-x-2 w-full hover:bg-gray-100 p-2 rounded-md",
                  {
                    "bg-gray-100": chat._id === chatId,
                  }
                )}
              >
                <div className="relative h-10 w-12">
                  <Avatar className="w-full h-full flex">
                    <AvatarImage
                      className="w-full h-full flex rounded-full object-cover"
                      src={chat.isGroup ? chat.avatar : chat.friend.avatar}
                    />
                    <AvatarFallback className="size-10 bg-gray-300 flex justify-center items-center rounded-full">
                      {chat.isGroup ? (
                        chat?.name?.charAt(0) || "N"
                      ) : chat.isBlocked ? (
                        <Ban className="text-destructive/60" />
                      ) : (
                        chat.friend.name.charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {!chat.isGroup && (
                    <div
                      className={cn(
                        "size-2 absolute rounded-full right-0 bottom-2",
                        {
                          "bg-green-500": onlineUsersId.includes(
                            chat?.friend?._id
                          ),
                          "bg-yellow-500": !onlineUsersId.includes(
                            chat?.friend?._id
                          ),
                        }
                      )}
                    />
                  )}
                </div>
                <div className="w-full">
                  <div className="flex justify-between items-center w-full">
                    <h1
                      className={cn("font-medium text-gray-800", {
                        "text-gray-900": chat.unReadMessagesCount > 0,
                      })}
                    >
                      {chat.isGroup ? chat.name : chat.friend.name}
                    </h1>
                    <span
                      className={cn("text-xs text-gray-600", {
                        "text-gray-900": chat.unReadMessagesCount > 0,
                      })}
                    >
                      {formatRelativeDate(
                        chat.lastMessage
                          ? chat.lastMessage.createdAt
                          : chat.createdAt
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    {chat.isBlocked ? (
                      <div className="text-sm text-destructive/80">Blocked</div>
                    ) : (
                      <div>
                        {chat.lastMessage &&
                          chat.lastMessage?.content &&
                          chat.lastMessage.attachments.length === 0 && (
                            <p
                              className={cn(
                                "text-sm truncate max-w-[200px] text-gray-600 italic",
                                {
                                  "text-gray-800": chat.unReadMessagesCount > 0,
                                }
                              )}
                            >
                              {user?._id === chat.lastMessage.sender._id && (
                                <span
                                  className={cn("text-gray-700 font-semibold", {
                                    "text-gray-900":
                                      chat.unReadMessagesCount > 0,
                                  })}
                                >
                                  You:{" "}
                                </span>
                              )}
                              {chat.lastMessage.content}
                            </p>
                          )}

                        {chat.lastMessage &&
                          chat.lastMessage?.attachments.length > 0 &&
                          !chat.lastMessage.content && (
                            <p className="text-sm text-gray-600 italic">
                              {user?._id === chat.lastMessage.sender._id && (
                                <span
                                  className={cn("text-gray-700 font-semibold", {
                                    "text-gray-900":
                                      chat.unReadMessagesCount > 0,
                                  })}
                                >
                                  You:{" "}
                                </span>
                              )}
                              Sent attachment
                            </p>
                          )}

                        {!chat.lastMessage && (
                          <p className="text-sm text-gray-600">No messages</p>
                        )}
                      </div>
                    )}
                    {chat.unReadMessagesCount > 0 && (
                      <div className="size-5 rounded-full bg-primary text-wrap flex items-center justify-center text-[9px] text-white">
                        {chat.unReadMessagesCount > 99
                          ? "99+"
                          : chat.unReadMessagesCount}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>

        {/* Sticky Bottom Dropdown */}
        <div className="border-t border-gray-300 px-4 pt-2 pb-4">
          <SidebarDropdown />
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
