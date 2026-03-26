import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/core/db';
import { sendMessageService } from '@/modules/chat/services';
import { sendMessageSchema } from '@/modules/chat/schemas';
import { hasPermission } from '@/services/permission.service';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const canCreate = await hasPermission(userId, 'message:create');
    if (!canCreate) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid request body' },
        { status: 400 }
      );
    }

    const data = await sendMessageService(parsed.data, userId);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const status =
      error instanceof Error
        ? error.message === 'User not found' ||
          error.message === 'Conversation not found'
          ? 404
          : error.message === 'Not a member of this conversation'
          ? 403
          : 500
        : 500;

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status }
    );
  }
}
