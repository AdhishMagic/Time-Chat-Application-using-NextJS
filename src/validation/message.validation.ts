import { z } from 'zod';
import { Types } from 'mongoose';

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ID format',
});

export const SendMessageSchema = z.object({
  conversationId: objectId,
  text: z.string().min(1).max(5000),
  clientMessageId: z.string().max(128).optional(),
  messageType: z.enum(['text', 'image', 'file']).default('text'),
});

export const GetMessagesSchema = z.object({
  conversationId: objectId,
  cursor: z.string().max(128).optional(),
  limit: z.number().min(1).max(100).default(20),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type GetMessagesInput = z.infer<typeof GetMessagesSchema>;
