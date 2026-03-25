import ChatWindow from "@/features/chat/components/ChatWindow";
import { getWelcomeMessage } from "@/services/chat.service";

export default async function ChatPage() {
  const initialMessage = getWelcomeMessage();

  return <ChatWindow initialMessage={initialMessage} />;
}
