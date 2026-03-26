import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/core/utils";
import { Loader, SkeletonLoader } from "@/components/ui";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "other";
  senderName?: string;
  senderAvatar?: string;
  timestamp: Date;
  isEdited?: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  renderMessage: (message: Message) => ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
}

export function ChatWindow({
  messages,
  renderMessage,
  isLoading = false,
  isEmpty = false,
  emptyState,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader size="lg" label="Loading messages..." />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        {emptyState || (
          <div className="text-center">
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-gray-400 text-xs mt-1">Start the conversation now</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-white flex flex-col"
    >
      <div className="flex-1 p-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Start the conversation now</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id}>
                {renderMessage(message)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
