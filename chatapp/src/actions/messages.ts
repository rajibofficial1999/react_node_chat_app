import axiosInstance from "@/lib/axios";

export const sendMessage = async (data: any): Promise<any> => {
  const response = await axiosInstance.post("/messages/send", data);

  return response.data;
};

export const getMessageData = async (chatId: string) => {
  const response = await axiosInstance.get(`messages/${chatId}`);

  return response.data;
};

export const markAsRead = async (chatId: string): Promise<void> => {
  await axiosInstance.patch(`messages/${chatId}/mark-as-read`);
};
