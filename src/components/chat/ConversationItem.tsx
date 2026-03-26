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
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "text-sm font-medium truncate",
              isActive ? "text-blue-900" : "text-gray-900"
            )}>
              {name}
            </h3>
            {lastMessageTime && (
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {formatDistanceToNow(new Date(lastMessageTime), { addSuffix: false })}
              </span>
            )}
          </div>
          {lastMessage && (
            <p className="text-sm text-gray-600 truncate mt-1">
              {lastMessage}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <div className="bg-blue-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </div>
    </button>
  );
}
