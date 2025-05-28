import { getGroupById, updateOrCreateGroup } from "@/actions/group";
import { parseError } from "@/lib/utils";
import {
  groupCreateSchema,
  groupUpdateSchema,
  type GroupCreateData,
  type GroupUpdateData,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import InputWrapper from "./InputWrapper";
import LoaderButton from "./LoaderButton";
import Modal from "./Modal";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import FileInput from "./FileInput";
import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import useStore from "@/lib/store";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type FormType = GroupCreateData | GroupUpdateData;

const GroupFormModal: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  const { socket } = useSocket();

  const { chatInfo } = useStore((state) => state);

  const form: UseFormReturn<FormType> = chatInfo?._id
    ? useForm<GroupUpdateData>({
        resolver: zodResolver(groupUpdateSchema),
        defaultValues: {
          name: "",
          description: "",
        },
      })
    : useForm<GroupCreateData>({
        resolver: zodResolver(groupCreateSchema),
        defaultValues: {
          name: "",
          description: "",
        },
      });

  const {
    handleSubmit,
    register,
    setError,
    setValue,
    resetField,
    formState: { errors },
  } = form;

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: updateOrCreateGroup,
    onSuccess: () => {
      toast(
        chatInfo?._id
          ? "Group updated successfully"
          : "Group created successfully"
      );
      setIsOpen(false);

      resetField("name");
      resetField("description");
      !chatInfo?._id && resetField("avatar");

      if (chatInfo?._id && socket) {
        socket.emit("update-group", {
          chatId: chatInfo?._id,
        });
      } else {
        queryClient.invalidateQueries(["getChatList"] as any);
      }
    },
    onError: (error) => {
      let parsedError = parseError(error);

      setError("name", { type: "manual", message: parsedError });
    },
  });

  const onSubmit = (data: GroupCreateData | GroupUpdateData) => {
    mutate({ data, groupId: chatInfo?._id || "" });
  };

  const { data: fetchedGroup } = useQuery({
    queryKey: ["getGroupById", chatInfo?._id],
    queryFn: ({ queryKey }) => {
      const [, key] = queryKey;
      return getGroupById(key as string);
    },
    enabled: !!chatInfo?._id && isOpen,
  });

  useEffect(() => {
    if (fetchedGroup) {
      setValue("name", fetchedGroup.name);
      setValue("description", fetchedGroup.description);
    }
  }, [fetchedGroup, setValue]);

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <form action="" className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label className="mb-2" htmlFor="name">
            Group name
          </Label>
          <InputWrapper name="name" errors={errors}>
            <Input
              defaultValue={fetchedGroup?.name || ""}
              placeholder="Enter name"
              className="py-4"
              {...register("name")}
            />
          </InputWrapper>
        </div>
        <div>
          <Label className="mb-2" htmlFor="desc">
            Group description
          </Label>
          <InputWrapper name="description" errors={errors}>
            <TextareaAutosize
              defaultValue={fetchedGroup?.description || ""}
              placeholder="Enter description"
              className="w-full border border-gray-300 rounded-md px-3 py-2 placeholder:text-sm focus:!outline-none focus:!border-primary focus:ring-1 ring-primary duration-200 resize-none"
              minRows={2}
              {...register("description")}
            />
          </InputWrapper>
        </div>
        {!chatInfo?._id && (
          <div>
            <InputWrapper name="avatar" errors={errors}>
              <FileInput
                onFileChange={(file) => setValue("avatar", file)}
                accept=".png,.jpg,.jpeg,.webp"
                onRemove={() => setValue("avatar", undefined)}
              />
            </InputWrapper>
          </div>
        )}
        <div>
          <LoaderButton className="w-full py-5" isLoading={isPending}>
            {chatInfo?._id ? "Update group" : "Create group"}
          </LoaderButton>
        </div>
      </form>
    </Modal>
  );
};

export default GroupFormModal;
