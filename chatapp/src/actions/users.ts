import axiosInstance from "@/lib/axios";

export const searchUsersByUserNameAndEmail = async (
  key: string
): Promise<User[]> => {
  const response = await axiosInstance(`/users/search?key=${key}`);

  return response.data;
};

export const changeAuthUserAvatar = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await axiosInstance.patch(`/users/avatar`, formData);
  return response.data;
};

export const getLoggedInUser = async (): Promise<User> => {
  const response = await axiosInstance.get("/auth/me");

  return response.data;
};
