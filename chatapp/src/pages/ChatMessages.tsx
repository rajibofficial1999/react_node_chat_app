import { getMessageData, markAsRead } from "@/actions/messages";
import ChatForm from "@/components/ChatForm";
import ChatNavbar from "@/components/ChatNavbar";
import MessagesSkeleton from "@/components/MessagesSkeleton";
import NotFound from "@/components/NotFound";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/contexts/SocketContext";

import useStore from "@/lib/store";
import {
  cn,
  formatFileSize,
  formatRelativeDate,
  parseError,
} from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { File } from "lucide-react";
import { useEffect, Fragment, useRef, useState, useMemo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { Navigate, useParams } from "react-router";
import { toast } from "sonner";

interface MessageData {
  chatItem: ChatInfo;
  messages: Message[];
}

const ChatMessages = () => {
  const { chatId = "" } = useParams() as { chatId?: string };
  if (!chatId) return <Navigate to="/" replace />;

  const [hasNewMessage, setHasNewMessage] = useState(false);

  const { user, setChatInfo, messageTypingInfo } = useStore((state) => state);

  const { socket } = useSocket();

  const queryClient = useQueryClient();
  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const {
    data: messageData,
    isLoading,
    isError,
    error,
  } = useQuery<MessageData>({
    queryKey: ["getMessageData", chatId],
    queryFn: async ({ queryKey }) => getMessageData(queryKey[1] as string),
    retry: false,
  });

  const { mutate } = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      if (socket && chatId) {
        socket.emit("seen-message", {
          chatId: chatId,
        });
      }

      queryClient.invalidateQueries(["getChatList"] as any);
    },
    onError: (error) => {
      const parsedError = parseError(error);
      toast(parsedError);
    },
  });

  const { chatItem, messages = [] } = messageData || {
    chatItem: null,
    messages: [],
  };

  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

  useEffect(() => {
    setChatInfo(chatItem);
  }, [chatItem]);

  useEffect(() => {
    if (messageData) {
      setHasNewMessage(true);

      mutate(chatId || "");
    }
  }, [messageData, chatId]);

  useEffect(() => {
    if (scrollDownRef.current && hasNewMessage) {
      scrollDownRef.current.scrollIntoView({ behavior: "instant" });
      setHasNewMessage(false);
    }
  }, [hasNewMessage]);

  if (isLoading) return <MessagesSkeleton />;

  if (isError && (error as AxiosError)?.status === 404) {
    return <NotFound error={error} />;
  }

  const filteredMessages = messages.filter((message) => !message.notification);
  const lastMessage = filteredMessages[0];

  const isSeen = (message: Message): boolean => {
    const readers = message.readBy.filter(
      (reader) => reader.userId !== user?._id
    );

    if (readers.length === 0) return false;

    return (
      lastMessage.sender._id === user?._id && lastMessage._id === message._id
    );
  };

  const seenText = (message: Message): string => {
    if (!chatItem?.isGroup) return "Seen";

    const readers = message.readBy.reduce((acc: string[], reader) => {
      if (reader.userId !== user?._id) {
        acc.push(reader.name);
      }
      return acc;
    }, []);

    return `Seen by ${readers.join(", ")}`;
  };

  const renderNotification = (message: Message) => {
    if (!message.notification) return null;
    if (chatItem?.isGroup || user?._id !== message.sender._id)
      return message.notification;
    if (message.notification.includes(" blocked"))
      return "You have blocked the user";
    if (message.notification.includes("unblocked"))
      return "You have unblocked the user";
    return null;
  };

  const renderAttachment = (
    attachment: Attachment,
    isOwnMessage: boolean,
    createdAt: string,
    idx: number,
    length: number
  ) => {
    if (attachment.type.startsWith("image/")) {
      return (
        <div key={attachment.url}>
          <PhotoProvider>
            <PhotoView src={attachment.url}>
              <LazyLoadImage
                alt={attachment.name}
                src={attachment.url}
                className="max-h-[300px] max-w-[200px] rounded-sm cursor-pointer"
              />
            </PhotoView>
          </PhotoProvider>
          {idx === length - 1 && (
            <div className="w-full flex justify-end mb-2 mt-1">
              <p className="text-xs text-gray-500">
                {formatRelativeDate(createdAt)}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={attachment.url} className="flex items-center gap-2">
        <File className="size-10" strokeWidth={0.5} />
        <div>
          <h1 className="font-semibold">{attachment.name}</h1>
          <div className="flex justify-between items-center gap-5">
            <p
              className={cn(
                "text-xs",
                isOwnMessage ? "text-gray-300" : "text-gray-500"
              )}
            >
              {formatFileSize(attachment.size)}
            </p>
            <p
              className={cn(
                "text-xs",
                isOwnMessage ? "text-gray-300" : "text-gray-500"
              )}
            >
              {formatRelativeDate(createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col ">
      <ChatNavbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 px-6 overflow-y-auto relative">
          {!isLoading && messages.length > 0 ? (
            <div
              className={cn("flex h-full flex-1 flex-col my-4", {
                "mb-10": messageTypingInfo,
              })}
            >
              {reversedMessages.map((message) => {
                const isOwnMessage = message.sender._id === user?._id;
                const isTextMessage = !!message?.content;
                const isNotification = !!message?.notification;

                return (
                  <Fragment key={message._id}>
                    {isNotification && (
                      <div className="text-sm text-center text-gray-400 italic mt-3">
                        {renderNotification(message)}
                      </div>
                    )}

                    {!isNotification && (
                      <div>
                        <div
                          className={cn("flex items-end mt-2", {
                            "justify-end": isOwnMessage,
                          })}
                        >
                          {chatItem?.isGroup &&
                            !isOwnMessage &&
                            !isNotification && (
                              <div
                                className={cn({
                                  "relative top-[-22px]":
                                    message.attachments[0]?.type.startsWith(
                                      "image/"
                                    ),
                                })}
                              >
                                <Avatar className="size-5 mr-1 border-2 border-gray-300">
                                  <AvatarImage src={message.sender.avatar} />
                                  <AvatarFallback>
                                    {message.sender.name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}

                          <div
                            className={cn("rounded-lg lg:max-w-xl", {
                              "bg-primary text-white px-4 py-2 flex-row-reverse ml-10 sm:ml-14":
                                isOwnMessage &&
                                (isTextMessage ||
                                  !message.attachments[0]?.type.startsWith(
                                    "image/"
                                  )),
                              "bg-gray-200 px-4 py-2 mr-10 sm:mr-14":
                                !isOwnMessage &&
                                (isTextMessage ||
                                  !message.attachments[0]?.type.startsWith(
                                    "image/"
                                  )),
                              "flex flex-wrap gap-2":
                                message.attachments.length > 0,
                              "justify-end":
                                message.attachments.length > 0 && isOwnMessage,
                            })}
                          >
                            {isTextMessage && <p>{message.content}</p>}

                            {message.attachments.map((attachment, idx) =>
                              renderAttachment(
                                attachment,
                                isOwnMessage,
                                message.createdAt,
                                idx,
                                message.attachments.length
                              )
                            )}

                            {isTextMessage && (
                              <p
                                className={cn(
                                  "text-xs",
                                  isOwnMessage
                                    ? "text-gray-200"
                                    : "text-gray-500"
                                )}
                              >
                                {formatRelativeDate(message.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>

                        {isSeen(message) && (
                          <div className="flex justify-end">
                            <p className="text-gray-400 text-xs break-words whitespace-pre-wrap text-right w-full max-w-xs sm:max-w-sm lg:max-w-md">
                              {seenText(message)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 mt-4">
              No messages yet
            </div>
          )}

          {messageTypingInfo && (
            <div className="absolute bottom-0 left-2 sm:left-4 z-20 bg-white rounded-full flex items-center justify-center">
              <div className="flex space-x-3 text-gray-600 text-sm">
                <div className="flex items-center space-x-0.5 mt-2.5">
                  <div className="h-5 animate-bounce animation-delay-200">
                    <div className="size-1 rounded-full bg-gray-400"></div>
                  </div>
                  <div className="h-5 animate-bounce animation-delay-300">
                    <div className="size-1 rounded-full bg-gray-400"></div>
                  </div>
                  <div className="h-5 animate-bounce animation-delay-400">
                    <div className="size-1 rounded-full bg-gray-400"></div>
                  </div>
                </div>
                <p className="text-gray-500">
                  {chatItem?.isGroup ? "Someone is typing..." : "Typing..."}
                </p>
              </div>
            </div>
          )}

          <div ref={scrollDownRef} />
        </ScrollArea>

        {!chatItem?.isGroup && chatItem?.isBlocked ? null : (
          <div className="border-t px-2 sm:px-4 py-3 border-gray-300">
            <ChatForm
              friendId={!chatItem?.isGroup ? chatId : null}
              receiverId={!chatItem?.isGroup ? chatItem?._id || null : null}
              groupId={chatItem?.isGroup ? chatId : null}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
