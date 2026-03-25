'use server';

import { connectDB } from '@/lib/db';
import { registerUserService } from '@/services/auth';
import { registerSchema } from '@/schemas/auth';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

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
