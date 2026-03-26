'use server';

import { connectDB } from '@/core/db';
import { loginUserService } from '@/modules/auth/services';
import { loginSchema } from '@/modules/auth/schemas';
import { signToken } from '@/core/auth';
import { handleError, createSuccessResponse } from '@/core/utils/error-handler';

export async function loginAction(input: unknown) {
  try {
    await connectDB();

    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation failed',
      };
    }

    const user = await loginUserService(parsed.data);

    const token = signToken({
      userId: user.userId,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    return createSuccessResponse({
      token,
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
