import axiosInstance from "@/lib/axios";
import type { GroupCreateData, GroupUpdateData } from "@/lib/validation";

export const getGroupById = async (groupId: string): Promise<ChatInfo> => {
  const response = await axiosInstance.get(`/groups/${groupId}`);

  return response.data;
};

export const updateOrCreateGroup = async ({
  data,
  groupId,
}: {
  data: GroupUpdateData | GroupCreateData;
  groupId: string;
}): Promise<void> => {
  let response;
  if (!groupId) {
    const parsedData = data as GroupCreateData;
    const formData = new FormData();
    formData.append("name", parsedData.name);
    formData.append("description", parsedData.description);
    formData.append("avatar", parsedData.avatar as File);
    response = await axiosInstance.post("/groups", formData);
  } else {
    response = await axiosInstance.patch(`/groups/${groupId}`, data);
  }
  return response.data;
};

export const leaveGroup = async (groupId: string): Promise<void> => {
  await axiosInstance.post("/groups/members/leave", { groupId });
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  await axiosInstance.delete(`/groups/${groupId}`);
};

export const getGroupMembers = async (groupId: string): Promise<User[]> => {
  const response = await axiosInstance.get(`/groups/members/${groupId}`);

  return response.data;
};

export const addGroupMember = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}): Promise<void> => {
  await axiosInstance.post(`/groups/members/add`, { groupId, userId });
};

export const removeGroupMember = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}): Promise<void> => {
  await axiosInstance.post(`/groups/members/remove`, { groupId, userId });
};

export const changeGroupAvatar = async ({
  file,
  groupId,
}: {
  file: File;
  groupId: string;
}): Promise<void> => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await axiosInstance.patch(
    `/groups/avatar/${groupId}`,
    formData
  );
  return response.data;
};
