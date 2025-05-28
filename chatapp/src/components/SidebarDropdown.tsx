import { LogOut, Settings, User } from "lucide-react";

import { SignOut } from "@/actions/auth";
import { useSocket } from "@/contexts/SocketContext";
import useStore from "@/lib/store";
import { parseError } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserModal from "./UserModal";
import { useState } from "react";

const SidebarDropdown = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { socket } = useSocket();
  const { user } = useStore((state) => state);

  const { mutate, isPending } = useMutation({
    mutationFn: SignOut,
    onSuccess: () => {
      if (socket && user?._id) {
        socket.emit("logout", user._id);
      }

      queryClient.clear();
      toast("You have been successfully logged out");
      navigate("/signin");
    },
    onError: (error) => {
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });
  return (
    <>
      <UserModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        user={user as User}
        showChangeAvatarButton={true}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar className="size-10">
              <AvatarImage src={user?.avatar || ""} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-sm">{user?.name}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-gray-300" align="start">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <button
                disabled={isPending}
                onClick={() => setIsOpen(true)}
                className="w-full flex cursor-pointer"
              >
                <User />
                <span>Profile</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="w-full flex cursor-pointer">
                <Settings />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <button
              disabled={isPending}
              onClick={() => mutate()}
              className="w-full flex cursor-pointer text-destructive hover:!text-destructive"
            >
              <LogOut className="text-destructive hover:!text-destructive" />
              <span>Log out</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default SidebarDropdown;
