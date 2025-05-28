import { sendMessage } from "@/actions/messages";
import { useSocket } from "@/contexts/SocketContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, formatFileSize, parseError } from "@/lib/utils";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useMutation } from "@tanstack/react-query";
import {
  File,
  Image,
  Paperclip,
  Send,
  SendHorizonal,
  Smile,
  X,
} from "lucide-react";
import React, {
  useEffect,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
} from "react";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import LoaderButton from "./LoaderButton";
import Modal from "./Modal";
import { Button, buttonVariants } from "./ui/button";
import useStore from "@/lib/store";

interface Props {
  friendId: string | null;
  groupId: string | null;
  receiverId: string | null;
}

const ChatForm: FC<Props> = ({ friendId, groupId, receiverId }) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImagesUrl, setPreviewImageUrl] = useState<
    (string | ArrayBuffer)[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useStore((state) => state);

  const isMobile = useIsMobile();

  const { socket } = useSocket();

  const { mutate, isPending } = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      let chatId = "";

      if (friendId) {
        chatId = friendId;
      }

      if (groupId) {
        chatId = groupId;
      }

      if (socket && chatId) {
        socket.emit("send-message", {
          chatId,
          message: {
            content,
            createdAt: new Date().toISOString(),
          },
        });
      }

      if (imagesInputRef.current) {
        imagesInputRef.current.value = "";
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setPreviewImageUrl([]);
      setContent("");
      setAttachments([]);
    },
    onError: (error) => {
      let parsedError = parseError(error);

      toast(parsedError);
    },
  });

  const onMessageSend = () => {
    if (!content.trim() && attachments.length === 0) return;

    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("friendId", friendId || "");
    formData.append("receiverId", receiverId || "");
    formData.append("groupId", groupId || "");

    if (attachments.length > 5) {
      toast("You can only send 5 images at a time");
      if (imagesInputRef.current) {
        imagesInputRef.current.value = "";
      }
      setPreviewImageUrl([]);
      setAttachments([]);
      return;
    }

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    mutate(formData);
  };

  const addEmoji = (emoji: any) => {
    setContent((prev) => prev + emoji.native);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      setAttachments([]);

      onMessageSend();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = e.target.files;

      if (files.length > 5) {
        toast("You can only send 5 images at a time");

        if (imagesInputRef.current) {
          imagesInputRef.current.value = "";
        }

        return;
      }

      const fileArray = Array.from(files);

      setAttachments(fileArray);

      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImageUrl((prev) => [...prev, reader.result!]);
        };
        reader.readAsDataURL(file);
      });

      setIsModalOpen(true);
      if (imagesInputRef.current) {
        imagesInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      setAttachments(Array.from(files));

      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setPreviewImageUrl([]);
    setAttachments([]);
    if (imagesInputRef.current) {
      imagesInputRef.current.value = "";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsTyping(true);

    // Reset the debounce timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing to false if user doesn't type for 2000ms
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  useEffect(() => {
    if (previewImagesUrl.length === 0) {
      if (imagesInputRef.current) {
        imagesInputRef.current.value = "";
      }
      setIsModalOpen(false);
    }
  }, [previewImagesUrl]);

  useEffect(() => {
    let chatId = "";
    if (friendId) {
      chatId = friendId;
    }

    if (groupId) {
      chatId = groupId;
    }

    if (isTyping) {
      if (user && socket) {
        socket.emit("message-is-typing", {
          chatId: chatId,
          userId: user._id,
        });
      }
    } else {
      if (user && socket) {
        socket.emit("message-is-not-typing", {
          chatId: chatId,
          userId: user._id,
        });
      }
    }
  }, [isTyping]);

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onClose={handleCloseModal}
      >
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, i) => (
              <div className="" key={i}>
                {attachment.type.indexOf("image/") === -1 && (
                  <div className="flex items-center gap-2 mb-5">
                    <File className="size-10 text-gray-600" />
                    <div>
                      <h1 className="font-semibold">{attachment.name}</h1>
                      <p className="text-gray-500 text-sm">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {previewImagesUrl.map((url, i) => (
              <div className="relative group" key={i}>
                <div className="absolute inset-0 bg-gray-800/60 rounded-md opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity duration-150" />
                <img
                  src={typeof url === "string" ? url : ""}
                  alt="Preview"
                  className="rounded-md border border-gray-400 max-h-32 object-contain"
                />
                <button
                  onClick={() => {
                    setPreviewImageUrl((prev) =>
                      prev.filter((_, index) => index !== i)
                    );

                    setAttachments((prev) =>
                      prev.filter((_, index) => index !== i)
                    );
                  }}
                  className="size-8 bg-destructive absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 rounded-full flex justify-center items-center cursor-pointer opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity duration-300"
                >
                  <X />
                </button>
              </div>
            ))}
          </div>

          <LoaderButton
            className="rounded-full size-10 mt-2"
            onClick={() => {
              setAttachments([]);
              onMessageSend();
            }}
            isLoading={isPending}
            hideContentIfLoading={true}
          >
            <SendHorizonal className="size-6" />
          </LoaderButton>
          <p className="text-gray-700">Send</p>
        </div>
      </Modal>
      <div className="flex items-center gap-1 sm:gap-2">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            id="file"
            accept="
    .pdf,.csv,.zip,.rar,.xlsx,.doc,.docx,.ppt,.pptx,.txt,.rtf,.html,.htm,.xml,.json,
    .css,.js,.java,.c,.cpp,.php,.py,.go,.ts,.kt,.swift,.rs,.rb,.scala,.lua,.pl,.pm,
    .sh,.bash,.bat,.ps1,.fish,.m,.ml,.r,.jl,.clj,.cljs,.cljc,.edn,.sql,.f,.for,
    .pas,.inc,.asm,.s,.a51,.asmx,.cas,.inf,.nasm,.mojo"
            onChange={handleFileChange}
            disabled={content.trim() !== ""}
          />
          <label
            htmlFor="file"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: cn("cursor-pointer", {
                "opacity-50 cursor-not-allowed": content.trim() !== "",
              }),
            })}
          >
            <Paperclip />
          </label>
        </div>

        <div className="w-full">
          <TextareaAutosize
            className="w-full text-sm border border-gray-300 rounded-md min-h-[50px] max-h-[100px] px-3 py-2 placeholder:text-sm focus:!outline-none focus:!border-primary duration-300"
            placeholder="Write a message"
            onKeyDown={handleKeyDown}
            value={content}
            onChange={handleTyping}
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative">
            {showPicker && (
              <div ref={pickerRef} className="bottom-14 absolute right-5 z-10">
                <Picker
                  data={data}
                  onEmojiSelect={addEmoji}
                  theme="light"
                  perLine={isMobile ? 7 : 8}
                />
              </div>
            )}
            <Button
              variant="ghost"
              className="cursor-pointer text-orange-500"
              size="icon"
              onClick={() => setShowPicker(!showPicker)}
            >
              <Smile className="!size-5" />
            </Button>
          </div>

          <div>
            <input
              ref={imagesInputRef}
              type="file"
              className="hidden"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              disabled={content.trim() !== ""}
            />
            <label
              htmlFor="images"
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className: cn("cursor-pointer", {
                  "opacity-50 cursor-not-allowed": content.trim() !== "",
                }),
              })}
            >
              <Image strokeWidth={1.5} />
            </label>
          </div>

          <LoaderButton
            onClick={onMessageSend}
            isLoading={isPending}
            hideContentIfLoading={true}
            className="cursor-pointer"
            size="icon"
            disabled={!content.trim() || attachments.length > 0}
          >
            <Send />
          </LoaderButton>
        </div>
      </div>
    </>
  );
};

export default ChatForm;
