import { FormEvent, useState } from "react";
import { Input, Button } from "@/components/ui";
import { cn } from "@/core/utils";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;

    await onSendMessage(message.trim());
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-4 sticky bottom-0"
    >
      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          )}
        />
        <Button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          isLoading={isLoading}
          size="md"
        >
          Send
        </Button>
      </div>
    </form>
  );
}
