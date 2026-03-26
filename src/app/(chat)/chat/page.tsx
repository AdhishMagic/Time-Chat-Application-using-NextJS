'use client';

import { useState, useCallback } from 'react';
import { ChatWindow, MessageBubble, MessageInput, type Message } from '@/modules/chat/components';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(
    async (content: string) => {
      setIsLoading(true);

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'This is a demo response. Connect your API to enable real messaging.',
          sender: 'other',
          senderName: 'Assistant',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <div className="flex flex-col h-full">
      <ChatWindow
        messages={messages}
        renderMessage={(message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            sender={message.sender}
            senderName={message.senderName}
            timestamp={message.timestamp}
            isEdited={message.isEdited}
          />
        )}
        isEmpty={messages.length === 0}
        emptyState={
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-900 font-medium">Start a conversation</p>
            <p className="text-gray-500 text-sm mt-1">Send a message to begin chatting</p>
          </div>
        }
      />
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Type your message here..."
      />
    </div>
  );
}

