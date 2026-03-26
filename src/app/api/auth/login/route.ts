import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/core/db';
import { loginUserService } from '@/modules/auth/services';
import { loginSchema } from '@/modules/auth/schemas';
import { signToken } from '@/core/auth';
import {
  checkLoginAttempts,
  recordFailedLogin,
  clearLoginAttempts,
} from '@/core/utils/rate-limit';

export async function POST(request: NextRequest) {
  let body: unknown;
  let email: string | null = null;

  try {
    await connectDB();

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    email = parsed.data.email.toLowerCase();

    if (!checkLoginAttempts(email)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Try again later.' },
        { status: 429 }
      );
    }

    const user = await loginUserService(parsed.data);

    const token = signToken({
      userId: user.userId,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    clearLoginAttempts(email);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            userId: user.userId,
            email: user.email,
            username: user.username,
          },
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    if (!email) {
      try {
        const parsed = loginSchema.safeParse(body);
        if (parsed.success) {
          email = parsed.data.email.toLowerCase();
        }
      } catch {
        // Ignore
      }
    }

    if (email) {
      recordFailedLogin(email);
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

