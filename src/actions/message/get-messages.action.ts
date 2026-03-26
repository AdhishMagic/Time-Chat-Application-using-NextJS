'use server';

import { headers } from 'next/headers';
import { connectDB } from '@/core/db';
import { getMessagesSchema } from '@/modules/chat/schemas';
import { getMessagesService } from '@/modules/chat/services';
import { handleError, createSuccessResponse } from '@/core/utils/error-handler';
import { DEFAULT_PAGINATION_LIMIT } from '@/core/utils';
import type { ActionResponse } from '@/core/utils/error-handler';

export async function getMessagesAction(
  input: unknown
): Promise<ActionResponse<any>> {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

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
