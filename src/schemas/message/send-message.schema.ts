import { z } from 'zod';
import { Types } from 'mongoose';

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ID format',
});

export const sendMessageSchema = z.object({
  conversationId: objectId,
  text: z.string().min(1).max(5000),
  clientMessageId: z.string().max(128).optional(),
  messageType: z.enum(['text', 'image', 'file']).default('text'),
});

export const sendMessageWithUserSchema = sendMessageSchema.extend({
  userId: objectId,
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SendMessageWithUserInput = z.infer<typeof sendMessageWithUserSchema>;
