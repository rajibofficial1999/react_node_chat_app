import { getLoggedInUser } from "@/actions/users";
import PageLoader from "@/components/PageLoader";
import { usePeer } from "@/contexts/PeerContext";
import { useSocket } from "@/contexts/SocketContext";
import useStore from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router";

const AuthLayout = () => {
  const { socket } = useSocket();
  const { setUser, setOnlineUsersId, setChatInfo, chatInfo } = useStore(
    (state) => state
  );
  const { chatId } = useParams() as Partial<{
    chatId: string;
  }>;

  const { createAnswer, setRemoteAnswer } = usePeer();

  const {
    data: me,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getLoggedInUser,
    retry: false,
  });

  useEffect(() => {
    if (me) setUser(me);
  }, [me, setUser]);

  useEffect(() => {
    if (socket && me?._id) {
      socket.emit("user-online", me._id);

      const handleOnlineUsers = (users: string[]) => {
        setOnlineUsersId(users);
      };

      const handleIncomingCall = async (data: {
        from: string;
        offer: RTCSessionDescriptionInit;
      }) => {
        const { from, offer } = data;
        const answer = await createAnswer(offer);

        socket.emit("call-accepted", {
          callerId: from,
          answer,
        });
      };

      const handleCallAccepted = async (data: {
        answer: RTCSessionDescriptionInit;
      }) => {
        const { answer } = data;
        await setRemoteAnswer(answer);
      };

      socket.on("online-users", handleOnlineUsers);
      socket.on("incoming-call", handleIncomingCall);
      socket.on("call-accepted", handleCallAccepted);

      return () => {
        socket.off("online-users", handleOnlineUsers);
        socket.off("incoming-call", handleIncomingCall);
        socket.off("call-accepted", handleCallAccepted);
      };
    }
  }, [socket, me?._id]);

  useEffect(() => {
    if (chatInfo && !chatId) {
      setChatInfo(null);
    }
  }, [chatId]);

  if (isLoading) return <PageLoader />;

  if (!me || isError) return <Navigate to="/signin" replace />;

  if (me.onBoarding) return <Navigate to="/onboarding" replace />;

  if (!me.isEmailVerified) return <Navigate to="/verify-email" replace />;

  return (
    <div className="overflow-x-hidden w-full">
      <Outlet />
    </div>
  );
};

export default React.memo(AuthLayout);
