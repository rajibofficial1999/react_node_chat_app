import { format } from "date-fns";
import { Camera, LoaderCircle } from "lucide-react";
import InfoItem from "./InfoItem";
import Modal from "./Modal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeAuthUserAvatar } from "@/actions/users";
import { toast } from "sonner";
import { parseError } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: User;
  items?: React.ReactNode;
  showChangeAvatarButton?: boolean;
}

const UserModal: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  user,
  items,
  showChangeAvatarButton = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { socket } = useSocket();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: changeAuthUserAvatar,
    onSuccess: () => {
      toast("Avatar changed successfully");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (socket && user) {
        socket.emit("change-user-avatar", {
          userId: user._id,
        });
      }

      queryClient.invalidateQueries(["getLoggedInUser"] as any);
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

      mutate(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={() => {
        if (!showChangeAvatarButton) return;

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }}
    >
      {user && (
        <div className="space-y-8">
          <div className="size-25 mx-auto relative">
            <Avatar className="w-full h-full flex rounded-full">
              <AvatarImage
                src={user.avatar || ""}
                className="rounded-full object-cover"
              />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {isPending && (
              <LoaderCircle className="absolute right-1/2 top-1/2 size-8 translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
            )}
            {showChangeAvatarButton && (
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
            <h1 className="font-semibold text-2xl">User information</h1>
            <p className="text-gray-500 text-sm">
              The user's information to be displayed
            </p>
          </div>
          <div className="divide-y divide-gray-300 space-y-2">
            <InfoItem label="Full name" value={user.name} />
            <InfoItem label="Email address" value={user.email} />
            <InfoItem label="Username" value={user.username} />
            <InfoItem
              label="Join on"
              value={format(user.createdAt, "dd MMM yyyy")}
            />
            {items && items}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UserModal;
