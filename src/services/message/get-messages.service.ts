import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { Types } from 'mongoose';
import { parseDateSafe } from '@/lib/safe-parse';

export interface MessageListResponse {
  messages: any[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function getMessagesService(
  conversationId: string,
  userId: string,
  cursor?: string,
  limit: number = 20
): Promise<MessageListResponse> {
  let userIdObj: Types.ObjectId;
  let convIdObj: Types.ObjectId;

  try {
    userIdObj = new Types.ObjectId(userId);
    convIdObj = new Types.ObjectId(conversationId);
  } catch {
    throw new Error('Invalid ID format');
  }

  const conversation = await Conversation.findById(convIdObj);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (!conversation.members.includes(userIdObj)) {
    throw new Error('Not a member of this conversation');
  }

  let query: any = {
    conversationId: convIdObj,
    isDeleted: false,
  };

  if (cursor) {
    const cursorDate = parseDateSafe(cursor);
    if (cursorDate) {
      try {
        const cursorId = new Types.ObjectId(cursor);
        query.$or = [
          { createdAt: { $lt: cursorDate } },
          { createdAt: cursorDate, _id: { $lt: cursorId } },
        ];
      } catch {
        // Skip cursor if invalid ObjectId
      }
    }
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = messages.length > limit;
  const result = messages.slice(0, limit);
  const nextCursor =
    hasMore && result.length > 0 ? result[result.length - 1]._id.toString() : null;

  return {
    messages: result,
    nextCursor,
    hasMore,
  };
}
