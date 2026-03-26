import { z } from 'zod';
import { Types } from 'mongoose';
import { MAX_PAGINATION_LIMIT } from '@/core/utils';

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ID format',
});

export const getMessagesSchema = z.object({
  conversationId: objectId,
  cursor: z.string().max(128).optional(),
  limit: z.number().min(1).max(MAX_PAGINATION_LIMIT).default(20),
});

export const getMessagesWithUserSchema = getMessagesSchema.extend({
  userId: objectId,
});

export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type GetMessagesWithUserInput = z.infer<typeof getMessagesWithUserSchema>;
