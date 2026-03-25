'use server';

import { connectDB } from '@/lib/db';
import { loginUserService } from '@/services/auth';
import { loginSchema } from '@/schemas/auth';
import { signToken } from '@/lib/jwt';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

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
