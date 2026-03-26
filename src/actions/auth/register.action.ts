'use server';

import { connectDB } from '@/core/db';
import { registerUserService } from '@/modules/auth/services';
import { registerSchema } from '@/modules/auth/schemas';
import { handleError, createSuccessResponse } from '@/core/utils/error-handler';

export async function registerAction(input: unknown) {
  try {
    await connectDB();

    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation failed',
      };
    }

    const result = await registerUserService(parsed.data);

    return createSuccessResponse(result);
  } catch (error) {
    return handleError(error);
  }
}
