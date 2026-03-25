/**
 * Message Service
 * Handles all message-related database operations
 * Repository pattern: Abstracts DB layer from business logic
 */

import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import UnreadCounter from '@/models/UnreadCounter';

export interface CreateMessageInput {
  conversationId: string;
  senderId: string;
  text: string;
  messageType?: 'text' | 'image' | 'file';
}

export interface MessageFilter {
  conversationId: string;
  limit?: number;
  skip?: number;
  sortBy?: 'createdAt' | '-createdAt';
}

/**
 * Create a new message
 */
export async function createMessage(input: CreateMessageInput) {
  try {
    await connectDB();

    const message = new Message({
      conversationId: input.conversationId,
      senderId: input.senderId,
      text: input.text,
      messageType: input.messageType || 'text',
    });

    await message.save();

    // Note: Update conversation's last message if needed
    // This depends on your Conversation schema structure

    return {
      success: true,
      message: message.toJSON(),
      error: null,
    };
  } catch (error) {
    console.error('[MESSAGE_SERVICE] Create message error:', error);
    return {
      success: false,
      message: null,
      error: error instanceof Error ? error.message : 'Failed to create message',
    };
  }
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(filter: MessageFilter) {
  try {
    await connectDB();

    const limit = filter.limit || 50;
    const skip = filter.skip || 0;
    const sort = filter.sortBy || '-createdAt';

    const messages = await Message.find({
      conversationId: filter.conversationId,
    })
      .populate('senderId', 'username email')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Message.countDocuments({
      conversationId: filter.conversationId,
    });

    return {
      success: true,
      messages: messages,
      pagination: { total, limit, skip, hasMore: skip + limit < total },
      error: null,
    };
  } catch (error) {
    console.error('[MESSAGE_SERVICE] Get conversation messages error:', error);
    return {
      success: false,
      messages: [],
      pagination: { total: 0, limit: 0, skip: 0, hasMore: false },
      error: error instanceof Error ? error.message : 'Failed to fetch messages',
    };
  }
}

/**
 * Get a single message by ID
 */
export async function getMessageById(messageId: string) {
  try {
    await connectDB();

    const message = await Message.findById(messageId)
      .populate('senderId', 'username email')
      .populate('conversationId');

    if (!message) {
      return {
        success: true,
        message: null,
        error: null,
      };
    }

    return {
      success: true,
      message: message.toJSON(),
      error: null,
    };
  } catch (error) {
    console.error('[MESSAGE_SERVICE] Get message by ID error:', error);
    return {
      success: false,
      message: null,
      error: error instanceof Error ? error.message : 'Failed to fetch message',
    };
  }
}

/**
 * Update a message (for editing)
 */
export async function updateMessage(
  messageId: string,
  content: string,
  userId: string
) {
  try {
    await connectDB();

    const message = await Message.findById(messageId);

    if (!message) {
      return {
        success: false,
        message: null,
        error: 'Message not found',
      };
    }

    // Verify ownership
    if (message.senderId.toString() !== userId) {
      return {
        success: false,
        message: null,
        error: 'Unauthorized to edit this message',
      };
    }

    message.text = content;
    message.editedAt = new Date();
    await message.save();

    return {
      success: true,
      message: message.toJSON(),
      error: null,
    };
  } catch (error) {
    console.error('[MESSAGE_SERVICE] Update message error:', error);
    return {
      success: false,
      message: null,
      error: error instanceof Error ? error.message : 'Failed to update message',
    };
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string, userId: string) {
  try {
    await connectDB();

    const message = await Message.findById(messageId);

    if (!message) {
      return {
        success: false,
        error: 'Message not found',
      };
    }

    // Verify ownership
    if (message.senderId.toString() !== userId) {
      return {
        success: false,
        error: 'Unauthorized to delete this message',
      };
    }

    await Message.findByIdAndDelete(messageId);

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('[MESSAGE_SERVICE] Delete message error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete message',
    };
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string, userId: string) {
  try {
    await connectDB();

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!message) {
      return {
        success: false,
        message: null,
        error: 'Message not found',
      };
    }

    return {
      success: true,
      message: message.toJSON(),
      error: null,
    };
  } catch (error) {
    console.error('[MESSAGE_SERVICE] Mark message as read error:', error);
    return {
      success: false,
      message: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to mark message as read',
    };
  }
}

/**
 * Get unread message count for a user in a conversation
 */
export async function getUnreadCount(
  conversationId: string,
  userId: string
): Promise<number> {
  try {
    await connectDB();

    const unreadCounter = await UnreadCounter.findOne({
      conversationId: conversationId,
      userId: userId,
    });

    return unreadCounter?.unreadCount || 0;
  } catch (error) {
    console.error('[MESSAGE_SERVICE] Get unread count error:', error);
    return 0;
  }
}

/**
 * Update unread count
 */
export async function updateUnreadCount(
  conversationId: string,
  userId: string,
  count: number
) {
  try {
    await connectDB();

    if (count <= 0) {
      await UnreadCounter.findOneAndDelete({
        conversationId: conversationId,
        userId: userId,
      });
    } else {
      await UnreadCounter.findOneAndUpdate(
        {
          conversationId: conversationId,
          userId: userId,
        },
        { unreadCount: count },
        { upsert: true, new: true }
      );
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('[MESSAGE_SERVICE] Update unread count error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update unread count',
    };
  }
}

/**
 * Archive old messages
 * Move messages older than specified date to MessageArchive
 */
export async function archiveOldMessages(beforeDate: Date) {
  try {
    await connectDB();

    const messagesToArchive = await Message.find({
      createdAt: { $lt: beforeDate },
    });

    if (messagesToArchive.length === 0) {
      return {
        success: true,
        archivedCount: 0,
        error: null,
      };
    }

    // Delete old messages (adjust as needed based on your data retention policy)
    const result = await Message.deleteMany({
      createdAt: { $lt: beforeDate },
    });

    return {
      success: true,
      archivedCount: result.deletedCount,
      error: null,
    };
  } catch (error) {
    console.error('[MESSAGE_SERVICE] Archive old messages error:', error);
    return {
      success: false,
      archivedCount: 0,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to archive messages',
    };
  }
}
