import { removeGroupMember } from "@/actions/group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { parseError } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";
import LoaderButton from "./LoaderButton";
import Modal from "./Modal";
import { ScrollArea } from "./ui/scroll-area";
import { useSocket } from "@/contexts/SocketContext";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  groupId: string;
  setGroupId: React.Dispatch<React.SetStateAction<string>>;
  members: User[];
  loadingState: LoadingStateProps | null;
  setLoadingState: React.Dispatch<
    React.SetStateAction<LoadingStateProps | null>
  >;
}

const RemoveMemberModal: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  groupId,
  setGroupId,
  members,
  loadingState,
  setLoadingState,
}) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { mutate: removeMember } = useMutation({
    mutationFn: removeGroupMember,

    onSuccess: () => {
      setLoadingState(null);
      toast("Member removed successfully");

      if (socket && groupId) {
        socket.emit("remove-group-member", {
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

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={() => setGroupId("")}
      preventMobileModal={true}
    >
      <ScrollArea className="max-h-[300px] px-5">
        <ul className="w-full space-y-2 divide-y divide-gray-200">
          {members.length > 0 ? (
            members.map((member) => (
              <li className="flex items-center gap-2 pb-2" key={member._id}>
                <Avatar className="size-10">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h1 className="font-semibold text-sm">{member.name}</h1>
                    <p className="text-sm">
                      Join on {format(member.createdAt, "dd MMM yyyy")}
                    </p>
                  </div>
                  <LoaderButton
                    size="icon"
                    variant="outline"
                    className="border-gray-300"
                    isLoading={loadingState?.[member._id]}
                    hideContentIfLoading={true}
                    onClick={() => {
                      setLoadingState({
                        [member._id]: true,
                      });
                      removeMember({
                        groupId,
                        userId: member._id,
                      });
                    }}
                  >
                    <UserMinus />
                  </LoaderButton>
                </div>
              </li>
            ))
          ) : (
            <h1 className="text-center text-sm">No members available</h1>
          )}
        </ul>
      </ScrollArea>
    </Modal>
  );
};

export default RemoveMemberModal;
