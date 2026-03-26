'use server';

import { headers } from 'next/headers';
import { connectDB } from '@/core/db';
import { sendMessageSchema } from '@/modules/chat/schemas';
import { sendMessageService } from '@/modules/chat/services';
import { handleError, createSuccessResponse } from '@/core/utils/error-handler';
import type { ActionResponse } from '@/core/utils/error-handler';

export async function sendMessageAction(
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

    const parsed = sendMessageSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid input format',
      };
    }

    await connectDB();
    const data = await sendMessageService(parsed.data, userId);

    return createSuccessResponse(data);
  } catch (error) {
    return handleError(error);
  }
}
