import { create } from 'zustand';

interface User {
  _id: string;
  email: string;
  name: string;
}

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt?: string;
  isEdited?: boolean;
}

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

type ChatState = {
  currentUser: User | null;
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: Message[];
  isTyping: boolean;
  onlineUsers: string[];

  setUser: (user: User | null) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  mergeMessages: (newMessages: Message[]) => void;
  deleteMessage: (messageId: string) => void;
  setTyping: (isTyping: boolean) => void;
  setOnlineUsers: (users: string[]) => void;
  reset: () => void;
};

const normalizeId = (id: unknown): string => String(id).toLowerCase();

const isValidMessage = (msg: unknown): msg is Message => {
  if (!msg || typeof msg !== 'object') return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m._id === 'string' &&
    typeof m.conversationId === 'string' &&
    typeof m.senderId === 'string' &&
    typeof m.text === 'string' &&
    typeof m.createdAt === 'string'
  );
};

const sortByDate = (messages: Message[]): Message[] =>
  [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

export const useChatStore = create<ChatState>((set) => ({
  currentUser: null,
  activeConversationId: null,
  conversations: [],
  messages: [],
  isTyping: false,
  onlineUsers: [],

  setUser: (user) => set({ currentUser: user }),

  setActiveConversation: (conversationId) =>
    set((state) => {
      if (state.activeConversationId === conversationId) return state;
      return { activeConversationId: conversationId, messages: [] };
    }),

  setConversations: (conversations) =>
    set({
      conversations: Array.isArray(conversations) ? [...conversations] : [],
    }),

  addMessage: (message) =>
    set((state) => {
      if (!isValidMessage(message)) return state;
      const normalizedNewId = normalizeId(message._id);
      const isDuplicate = state.messages.some(
        (m) => normalizeId(m._id) === normalizedNewId
      );
      if (isDuplicate) return state;
      return { messages: sortByDate([...state.messages, message]) };
    }),

  setMessages: (messages) =>
    set({
      messages: Array.isArray(messages)
        ? sortByDate(messages.filter(isValidMessage))
        : [],
    }),

  mergeMessages: (newMessages) =>
    set((state) => {
      if (!Array.isArray(newMessages)) return state;
      const validNewMessages = newMessages.filter(isValidMessage);
      if (validNewMessages.length === 0) return state;

      const existingIds = new Set(
        state.messages.map((m) => normalizeId(m._id))
      );
      const uniqueNew = validNewMessages.filter(
        (m) => !existingIds.has(normalizeId(m._id))
      );

      if (uniqueNew.length === 0) return state;
      return { messages: sortByDate([...state.messages, ...uniqueNew]) };
    }),

  deleteMessage: (messageId) =>
    set((state) => {
      const normalizedId = normalizeId(messageId);
      const filtered = state.messages.filter(
        (m) => normalizeId(m._id) !== normalizedId
      );
      if (filtered.length === state.messages.length) return state;
      return { messages: filtered };
    }),

  setTyping: (isTyping) => set({ isTyping: Boolean(isTyping) }),

  setOnlineUsers: (users) =>
    set({
      onlineUsers: Array.isArray(users) ? [...users] : [],
    }),

  reset: () =>
    set({
      currentUser: null,
      activeConversationId: null,
      conversations: [],
      messages: [],
      isTyping: false,
      onlineUsers: [],
    }),
}));
