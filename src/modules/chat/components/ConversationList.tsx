import { cn } from "@/core/utils";
import { SkeletonLoader } from "@/components/ui";
import { ConversationItem } from "./ConversationItem";

export interface Conversation {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  avatar?: string;
  unreadCount?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading = false,
  emptyState,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <SkeletonLoader count={5} />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        {emptyState || (
          <div className="text-center">
            <p className="text-gray-500 text-sm">No conversations yet</p>
            <p className="text-gray-400 text-xs mt-1">Start a new conversation to begin</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          {...conversation}
          isActive={conversation.id === activeConversationId}
          onClick={() => onSelectConversation(conversation.id)}
        />
      ))}
    </div>
  );
}
