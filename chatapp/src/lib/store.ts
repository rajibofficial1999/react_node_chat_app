import { create } from "zustand";

type MessgeTypingInfo = {
  chatId: string;
  userId: string;
};

type State = {
  user: User | null;
  onlineUsersId: string[];
  isShowChatSidebar: boolean;
  chatInfo: ChatInfo | null;
  messageTypingInfo: MessgeTypingInfo | null;
};

type Action = {
  setUser: (user: State["user"]) => void;
  setOnlineUsersId: (usersId: string[]) => void;
  setShowChatSidebar: (isShow: boolean) => void;
  setChatInfo: (chatInfo: State["chatInfo"]) => void;
  setMessageTypingInfo: (messageTypingInfo: State["messageTypingInfo"]) => void;
};

const useStore = create<State & Action>()((set) => ({
  user: null,
  onlineUsersId: [],
  isShowChatSidebar: false,
  chatInfo: null,
  messageTypingInfo: null,
  setUser: (user: User | null) => set({ user }),
  setOnlineUsersId: (usersId: string[]) => set({ onlineUsersId: usersId }),
  setShowChatSidebar: (isShow: boolean) => set({ isShowChatSidebar: isShow }),
  setChatInfo: (chatInfo: ChatInfo | null) => set({ chatInfo }),
  setMessageTypingInfo: (messageTypingInfo: MessgeTypingInfo | null) =>
    set({ messageTypingInfo }),
}));

export default useStore;
