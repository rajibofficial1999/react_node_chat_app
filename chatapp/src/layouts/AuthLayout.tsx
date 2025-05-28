import { getLoggedInUser } from "@/actions/users";
import PageLoader from "@/components/PageLoader";
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

      socket.on("online-users", handleOnlineUsers);

      return () => {
        socket.off("online-users", handleOnlineUsers);
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
