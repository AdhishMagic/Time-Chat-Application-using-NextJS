import { cn } from "@/core/utils";
import { Avatar } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";

interface ConversationItemProps {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  avatar?: string;
  unreadCount?: number;
  isActive?: boolean;
  onClick: () => void;
}

export function ConversationItem({
  id,
  name,
  lastMessage,
  lastMessageTime,
  avatar,
  unreadCount = 0,
  isActive = false,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-gray-200 transition-colors duration-150 hover:bg-gray-50",
        isActive && "bg-blue-50 border-l-4 border-l-blue-600"
      )}
    >
      <div className="flex gap-3 items-start">
        <Avatar
          initials={name.substring(0, 2).toUpperCase()}
          src={avatar}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <p className="font-semibold text-sm text-gray-900">{name}</p>
            {lastMessageTime && (
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {formatDistanceToNow(new Date(lastMessageTime), {
                  addSuffix: false,
                })}
              </span>
            )}
          </div>
          {lastMessage && (
            <p className="text-sm text-gray-600 truncate mt-1">{lastMessage}</p>
          )}
          {unreadCount > 0 && (
            <div className="mt-2">
              <span className="inline-block bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
