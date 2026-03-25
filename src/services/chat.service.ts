import mongoose, { type ClientSession, type Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message, { type IMessage, type MessageType } from "@/models/Message";
import User from "@/models/User";

type CreateMessageInput = {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  clientMessageId: string;
  text?: string;
  mediaUrl?: string;
  messageType?: MessageType;
};

type DeleteMessageInput = {
  messageId: Types.ObjectId;
  conversationId: Types.ObjectId;
};

function getPreviewFromMessage(message: Pick<IMessage, "isDeleted" | "text" | "messageType">): string {
  if (message.isDeleted) {
    return "Message deleted";
  }

  if (message.text?.trim()) {
    return message.text.trim().slice(0, 500);
  }

  if (message.messageType === "image") {
    return "Image";
  }

  if (message.messageType === "file") {
    return "File";
  }

  return "Message";
}

async function upsertMessageIdempotent(
  input: CreateMessageInput,
  session: ClientSession,
): Promise<IMessage> {
  const now = new Date();

  const message = await Message.findOneAndUpdate(
    {
      senderId: input.senderId,
      clientMessageId: input.clientMessageId,
    },
    {
      $setOnInsert: {
        conversationId: input.conversationId,
        senderId: input.senderId,
        clientMessageId: input.clientMessageId,
        text: input.text ?? null,
        mediaUrl: input.mediaUrl ?? null,
        messageType: input.messageType ?? "text",
        isDeleted: false,
        editedAt: null,
      },
    },
    {
      new: true,
      upsert: true,
      session,
    },
  );

  if (!message) {
    throw new Error("Failed to create or fetch idempotent message");
  }

  await User.updateOne(
    { _id: input.senderId },
    {
      $set: { lastMessageSentAt: now },
    },
    { session },
  );

  return message;
}

export async function createMessageWithConsistency(input: CreateMessageInput): Promise<IMessage> {
  await connectToDatabase();
  const mongoSession = await mongoose.startSession();

  try {
    let messageDoc: IMessage | null = null;

    await mongoSession.withTransaction(async () => {
      messageDoc = await upsertMessageIdempotent(input, mongoSession);

      await Conversation.updateOne(
        { _id: input.conversationId },
        {
          $set: {
            lastMessagePreview: getPreviewFromMessage(messageDoc as IMessage),
            lastMessageAt: (messageDoc as IMessage).createdAt,
          },
        },
        { session: mongoSession },
      );
    });

    if (!messageDoc) {
      throw new Error("Message transaction completed without result");
    }

    return messageDoc;
  } catch (error) {
    const mongoError = error as { code?: number };

    if (mongoError.code === 11000) {
      const existing = await Message.findOne({
        senderId: input.senderId,
        clientMessageId: input.clientMessageId,
      });

      if (existing) {
        return existing;
      }
    }

    throw error;
  } finally {
    await mongoSession.endSession();
  }
}

export async function softDeleteMessageWithConsistency(
  input: DeleteMessageInput,
): Promise<void> {
  await connectToDatabase();
  const mongoSession = await mongoose.startSession();

  try {
    await mongoSession.withTransaction(async () => {
      await Message.updateOne(
        { _id: input.messageId, conversationId: input.conversationId, isDeleted: false },
        {
          $set: {
            isDeleted: true,
            editedAt: new Date(),
          },
        },
        { session: mongoSession },
      );

      const latestActiveMessage = await Message.findOne(
        { conversationId: input.conversationId, isDeleted: false },
        null,
        {
          session: mongoSession,
          sort: { createdAt: -1, _id: -1 },
        },
      ).lean<IMessage | null>();

      await Conversation.updateOne(
        { _id: input.conversationId },
        {
          $set: {
            lastMessagePreview: latestActiveMessage
              ? getPreviewFromMessage(latestActiveMessage)
              : null,
            lastMessageAt: latestActiveMessage?.createdAt ?? null,
          },
        },
        { session: mongoSession },
      );
    });
  } finally {
    await mongoSession.endSession();
  }
}

export async function editMessageWithOptimisticConcurrency(params: {
  messageId: Types.ObjectId;
  expectedVersion: number;
  newText: string;
}): Promise<IMessage> {
  await connectToDatabase();

  const updated = await Message.findOneAndUpdate(
    {
      _id: params.messageId,
      __v: params.expectedVersion,
      isDeleted: false,
    },
    {
      $set: {
        text: params.newText,
        editedAt: new Date(),
      },
      $inc: { __v: 1 },
    },
    {
      new: true,
    },
  );

  if (!updated) {
    throw new Error("Conflict detected. Message was modified by another request.");
  }

  return updated;
}
