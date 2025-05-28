import useStore from "@/lib/store";
import { Avatar } from "@radix-ui/react-avatar";
import { format } from "date-fns";
import { Camera, ChevronDown, ChevronRight, LoaderCircle } from "lucide-react";
import InfoItem from "./InfoItem";
import Modal from "./Modal";
import { AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import UserModal from "./UserModal";
import { useRef, useState } from "react";
import { cn, parseError } from "@/lib/utils";
import { toast } from "sonner";
import { changeGroupAvatar } from "@/actions/group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/contexts/SocketContext";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatInfo: ChatInfo | undefined;
}

const ChatInfoModal: React.FC<Props> = ({ isOpen, setIsOpen, chatInfo }) => {
  const [isMemberCollasped, setIsMemberCollapsed] = useState(false);
  const { user } = useStore((state) => state);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { socket } = useSocket();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: changeGroupAvatar,
    onSuccess: () => {
      toast("Avatar changed successfully");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (socket && chatInfo?._id) {
        socket.emit("change-group-avatar", {
          chatId: chatInfo?._id,
        });
      }

      queryClient.invalidateQueries(["chatInfo", chatInfo?._id || ""] as any);
    },
    onError: (error) => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      let parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type.indexOf("image/") === -1) {
        toast("Only JPEG, PNG, or WEBP images are allowed");
        return;
      }

      mutate({ file, groupId: chatInfo?._id || "" });
    }
  };
  return (
    <>
      {chatInfo && chatInfo.isGroup ? (
        <Modal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          preventMobileModal={true}
          onClose={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        >
          <div className="space-y-8">
            <div className="size-25 mx-auto relative">
              <Avatar className="w-full h-full flex rounded-full">
                <AvatarImage
                  src={chatInfo.avatar || ""}
                  className="rounded-full object-cover"
                />
                <AvatarFallback>{chatInfo.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              {isPending && (
                <LoaderCircle className="absolute right-1/2 top-1/2 size-8 translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
              )}
              {!isPending && user?._id === String(chatInfo.owner._id) && (
                <label
                  htmlFor="user-avatar"
                  className="size-7 absolute right-1.5 bottom-1.5 rounded-full bg-primary text-white flex justify-center items-center cursor-pointer"
                >
                  <Camera className="size-5" />
                  <input
                    id="user-avatar"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                </label>
              )}
            </div>
            <div>
              <h1 className="font-semibold text-2xl">Group information</h1>
              <p className="text-gray-500 text-sm">
                The group's information to be displayed
              </p>
            </div>
            <div className="divide-y divide-gray-300 space-y-2">
              <InfoItem
                className="pb-2 text-sm"
                label="Name"
                value={chatInfo.name}
              />
              <InfoItem
                className="pb-2 text-sm"
                label="Admin"
                value={chatInfo.owner.name}
              />
              <div className="grid grid-cols-2 gap-2 pb-2">
                <h1 className="font-semibold text-sm">Description</h1>
                <ScrollArea className="max-h-[60px]">
                  <p className="text-gray-500 text-sm">
                    {chatInfo.description}
                  </p>
                </ScrollArea>
              </div>
              <div className="pb-2">
                <div className="grid grid-cols-2 gap-2">
                  <h1 className="font-semibold text-sm">Members</h1>

                  <button
                    className="text-gray-500 text-sm cursor-pointer"
                    onClick={() => setIsMemberCollapsed(!isMemberCollasped)}
                  >
                    {isMemberCollasped ? (
                      <ChevronDown className="text-gray-500 size-5" />
                    ) : (
                      <ChevronRight className="text-gray-500 size-5" />
                    )}
                  </button>
                </div>
                <div
                  className={cn("grid grid-cols-2 gap-2 h-0 duration-200", {
                    "h-auto mt-2": isMemberCollasped,
                  })}
                >
                  <div />
                  <ScrollArea
                    className={cn(
                      "max-h-[80px] invisible opacity-0 duration-100",
                      {
                        "visible opacity-100": isMemberCollasped,
                      }
                    )}
                  >
                    <ul>
                      {chatInfo.members.map((member) => (
                        <li
                          className="flex items-center gap-2"
                          key={member._id}
                        >
                          <Avatar className="size-5 flex rounded-full">
                            <AvatarImage
                              src={member.avatar || ""}
                              className="rounded-full object-cover"
                            />
                            <AvatarFallback>
                              {member.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <h2 className="font-semibold text-sm">
                            {member.name}
                          </h2>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </div>
              <InfoItem
                label="Created on"
                className="pb-2 text-sm"
                value={format(chatInfo.createdAt, "dd MMM yyyy")}
              />
            </div>
          </div>
        </Modal>
      ) : (
        chatInfo && (
          <UserModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            user={chatInfo.sender}
            items={
              <InfoItem
                paraClassName="capitalize"
                label="Friend status"
                value={chatInfo.status}
              />
            }
          />
        )
      )}
    </>
  );
};
export default ChatInfoModal;
