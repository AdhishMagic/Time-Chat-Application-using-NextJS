import { cn } from "@/core/utils";
import { Avatar } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  content: string;
  sender: "user" | "other";
  senderName?: string;
  senderAvatar?: string;
  timestamp?: Date;
  isEdited?: boolean;
}

export function MessageBubble({
  content,
  sender,
  senderName = "User",
  senderAvatar,
  timestamp,
  isEdited,
}: MessageBubbleProps) {
  const isUser = sender === "user";

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 items-end",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar
          initials={senderName.substring(0, 2).toUpperCase()}
          src={senderAvatar}
          size="md"
        />
      )}
      <div className={cn("max-w-xs lg:max-w-md", isUser ? "order-2" : "order-1")}>
        {!isUser && (
          <p className="text-xs text-gray-500 mb-1 px-3">{senderName}</p>
        )}
        <div
          className={cn(
            "rounded-lg px-4 py-2 break-words",
            isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-100 text-gray-900 rounded-bl-none"
          )}
        >
          <p className="text-sm">{content}</p>
        </div>
        <div
          className={cn(
            "text-xs mt-1 flex items-center gap-1",
            isUser ? "text-gray-500 justify-end" : "text-gray-500 justify-start"
          )}
        >
          {timestamp && (
            <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
          )}
          {isEdited && <span className="italic">(edited)</span>}
        </div>
      </div>
    </div>
  );
}
