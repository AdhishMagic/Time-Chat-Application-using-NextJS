import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import { Types } from 'mongoose';
import type { SendMessageInput } from '@/schemas/message';

export interface MessageData {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  messageType: string;
  clientMessageId?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function formatMessageData(doc: any): MessageData {
  const obj = doc.toObject?.() || doc;
  return {
    ...obj,
    _id: obj._id?.toString() || obj._id,
    conversationId: obj.conversationId?.toString() || obj.conversationId,
    senderId: obj.senderId?.toString() || obj.senderId,
  };
}

export async function sendMessageService(
  input: SendMessageInput,
  userId: string
): Promise<MessageData> {
  const { conversationId, text, clientMessageId, messageType } = input;
  
  let userIdObj: Types.ObjectId;
  let convIdObj: Types.ObjectId;
  
  try {
    userIdObj = new Types.ObjectId(userId);
    convIdObj = new Types.ObjectId(conversationId);
  } catch {
    throw new Error('Invalid ID format');
  }

  const user = await User.findById(userIdObj);
  if (!user) {
    throw new Error('User not found');
  }

  const conversation = await Conversation.findById(convIdObj);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (!conversation.members.includes(userIdObj)) {
    throw new Error('Not a member of this conversation');
  }

  if (clientMessageId) {
    const existing = await Message.findOne({
      senderId: userIdObj,
      conversationId: convIdObj,
      clientMessageId,
    });
    if (existing) {
      return formatMessageData(existing);
    }
  }

  const message = await Message.create({
    conversationId: convIdObj,
    senderId: userIdObj,
    text,
    messageType,
    clientMessageId,
    isDeleted: false,
  });

  await Conversation.findByIdAndUpdate(convIdObj, {
    lastMessageAt: new Date(),
    lastMessagePreview: text.substring(0, 100),
  });

  return formatMessageData(message);
}
