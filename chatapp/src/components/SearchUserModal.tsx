import { searchUsersByUserNameAndEmail } from "@/actions/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import debounce from "lodash/debounce";
import { UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import IconInput from "./IconInput";
import LoaderButton from "./LoaderButton";
import Modal from "./Modal";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filterUsers: User[];
  handleAction: (userId: string) => void;
  onClose?: () => void;
  loadingState: LoadingStateProps | null;
  setLoadingState: React.Dispatch<
    React.SetStateAction<LoadingStateProps | null>
  >;
  isGroup?: boolean;
}

const SearchUserModal: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  handleAction,
  onClose,
  filterUsers,
  loadingState,
  setLoadingState,
  isGroup = false,
}) => {
  const [search, setSearch] = useState("");

  const { data: users } = useQuery({
    queryKey: ["searchUsers", search],
    queryFn: ({ queryKey }) => {
      const [, key] = queryKey;
      return searchUsersByUserNameAndEmail(key);
    },
    enabled: !!search,
  });

  const debouncedSetSearch = useMemo(
    () => debounce((val: string) => setSearch(val), 400),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={() => onClose && onClose()}
      preventMobileModal={true}
    >
      <div>
        <Label className="mb-2" htmlFor="search">
          Search by username or email
        </Label>

        <IconInput
          placeholder="Username or email"
          icon={Users}
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
      </div>
      <ScrollArea className="max-h-[300px] px-5">
        <ul className="w-full space-y-2 divide-y divide-gray-200">
          {users &&
            users.map((user) => {
              const userEntry = filterUsers.find((u) => u._id === user._id);

              const shouldShowButton = isGroup
                ? !userEntry
                : !(userEntry && userEntry.isAccepted);

              const isLoadingUserButton = loadingState?.[user._id];

              const isPendingUser = !isGroup
                ? userEntry?.isPending === true
                : false;

              const isDisabledUserButton = isLoadingUserButton || isPendingUser;

              return (
                <li className="flex items-center gap-2 pb-2" key={user._id}>
                  <Avatar className="size-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <h1 className="font-semibold text-sm">{user.name}</h1>
                      <p className="text-sm">
                        Join on {format(user.createdAt, "dd MMM yyyy")}
                      </p>
                    </div>
                    {shouldShowButton && (
                      <LoaderButton
                        size={isPendingUser ? "sm" : "icon"}
                        variant="outline"
                        className={cn("border-gray-300", {
                          "text-yellow-500 border-yellow-500": isPendingUser,
                        })}
                        disabled={isDisabledUserButton}
                        isLoading={isLoadingUserButton}
                        hideContentIfLoading={true}
                        onClick={() => {
                          if (isGroup || !isPendingUser) {
                            setLoadingState({
                              [user._id]: true,
                            });
                            handleAction(user._id);
                          }
                        }}
                      >
                        {isPendingUser ? "Sent" : <UserPlus />}
                      </LoaderButton>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </ScrollArea>
    </Modal>
  );
};

export default SearchUserModal;
