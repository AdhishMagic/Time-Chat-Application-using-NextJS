import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { registerUserService } from '@/services/auth';
import { registerSchema } from '@/schemas/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const result = await registerUserService(parsed.data);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.includes('already')
        ? 409
        : 500;
      return NextResponse.json(
        { success: false, error: error.message },
        { status }
      );
    }

    console.error('[API] POST /api/auth/register:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
