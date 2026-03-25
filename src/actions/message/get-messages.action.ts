'use server';

import { connectDB } from '@/lib/db';
import { getMessagesSchema } from '@/schemas/message';
import { getMessagesService } from '@/services/message';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import { DEFAULT_PAGINATION_LIMIT } from '@/lib/constants';
import type { ActionResponse } from '@/lib/error-handler';

export async function getMessagesAction(
  input: unknown,
  userId: string
): Promise<ActionResponse<any>> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const parsed = getMessagesSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid input format',
      };
    }

    await connectDB();
    const { conversationId, cursor, limit } = parsed.data;

    const data = await getMessagesService(
      conversationId,
      userId,
      cursor,
      limit ?? DEFAULT_PAGINATION_LIMIT
    );

    return createSuccessResponse(data);
  } catch (error) {
    return handleError(error);
  }
}
