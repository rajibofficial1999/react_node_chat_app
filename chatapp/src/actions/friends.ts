import axiosInstance from "@/lib/axios";

export const getFriendById = async (friendId: string): Promise<ChatInfo> => {
  const response = await axiosInstance.get(`/friends/${friendId}`);

  return response.data;
};

export const getAllFriends = async (): Promise<User[]> => {
  const response = await axiosInstance.get("/friends");

  return response.data;
};

export const getPendingFriends = async (): Promise<Friend[]> => {
  const response = await axiosInstance.get("/friends/pending");

  return response.data;
};

export const getChatList = async (): Promise<ChatItem[]> => {
  const response = await axiosInstance.get("/chatlist");

  return response.data;
};

export const sendFriendRequest = async (friendId: string): Promise<void> => {
  await axiosInstance.post(`/friends/send-request`, {
    receiverId: friendId,
  });
};

export const acceptFriendRequest = async (
  friendshipId: string
): Promise<void> => {
  await axiosInstance.post(`/friends/accept-request`, {
    friendshipId,
  });
};

export const rejectFriendRequest = async (
  friendshipId: string
): Promise<void> => {
  await axiosInstance.post(`/friends/reject-request`, {
    friendshipId,
  });
};

export const deleteFriend = async (friendId: string): Promise<void> => {
  await axiosInstance.delete(`/friends/${friendId}`);
};

export const blockFriend = async (friendId: string): Promise<void> => {
  await axiosInstance.post("/friends/block", {
    friendshipId: friendId,
  });
};

export const unblockFriend = async (friendId: string): Promise<void> => {
  await axiosInstance.post("/friends/unblock", {
    friendshipId: friendId,
  });
};

export const getBlockedUsers = async (): Promise<ChatItem[]> => {
  const response = await axiosInstance.get("/friends/blocked");

  return response.data;
};
