export type Message = {
  id: string;
  username: string;
  content: string;
  isOwnMessage: boolean;
  createdAt: string;
  conversationId: number;
};
