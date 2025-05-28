import {
  getAllFriends,
  getBlockedUsers,
  getPendingFriends,
  sendFriendRequest,
} from "@/actions/friends";
import BlockedUsersModal from "@/components/BlockedUsersModal";
import GroupFormModal from "@/components/GroupFormModal";
import PendingFriendsModal from "@/components/PendingFriendsModal";
import SearchUserModal from "@/components/SearchUserModal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseError } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShieldBan,
  UserRoundCog,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Chat = () => {
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingStateProps | null>(
    null
  );
  const [showBlockListModal, setShowBlockListModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: fetchedFriends } = useQuery({
    queryKey: ["getFriends"],
    queryFn: getAllFriends,
    enabled: showUsersModal,
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

  const { data: fetchedPendingFriends } = useQuery({
    queryKey: ["getPendingFriends"],
    queryFn: getPendingFriends,
    enabled: showFriendsModal,
  });

  const { data: blockedUsers } = useQuery({
    queryKey: ["getBlockedUsers"],
    queryFn: getBlockedUsers,
    enabled: showBlockListModal,
  });

  return (
    <>
      <PendingFriendsModal
        isOpen={showFriendsModal}
        setIsOpen={setShowFriendsModal}
        friends={fetchedPendingFriends}
      />

      <BlockedUsersModal
        isOpen={showBlockListModal}
        setIsOpen={setShowBlockListModal}
        friends={blockedUsers}
      />

      <SearchUserModal
        isOpen={showUsersModal}
        setIsOpen={setShowUsersModal}
        handleAction={(userId: string) => handleAddMember(userId)}
        filterUsers={fetchedFriends || []}
        loadingState={loadingState}
        setLoadingState={setLoadingState}
      />

      <ScrollArea className="w-full h-screen">
        <div className="flex justify-end items-center h-14 sticky top-0 z-10 bg-white border-b border-gray-300">
          <Button
            className="cursor-pointer"
            variant="link"
            onClick={() => setShowBlockListModal(true)}
          >
            <ShieldBan /> <span>Block List</span>
          </Button>

          <Button
            className="cursor-pointer"
            variant="link"
            onClick={() => setShowFriendsModal(true)}
          >
            <UserRoundCog /> <span>Pending Request</span>
          </Button>

          <Button
            className="cursor-pointer"
            variant="link"
            onClick={() => setShowUsersModal(true)}
          >
            <UserRoundPlus /> <span>Add Friend</span>
          </Button>
          <Button
            className="cursor-pointer"
            variant="link"
            onClick={() => setShowGroupModal(true)}
          >
            <UsersRound /> <span>Create Group</span>
          </Button>
        </div>
        <GroupFormModal isOpen={showGroupModal} setIsOpen={setShowGroupModal} />
        {/* <ScrollArea className="w-full h-screen">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eius,
          voluptatibus.
        </ScrollArea> */}
      </ScrollArea>
    </>
  );
};

export default Chat;
