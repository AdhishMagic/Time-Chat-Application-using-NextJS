'use server';

import { connectDB } from '@/lib/db';
import { sendMessageSchema } from '@/schemas/message';
import { sendMessageService } from '@/services/message';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import type { ActionResponse } from '@/lib/error-handler';

export async function sendMessageAction(
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
