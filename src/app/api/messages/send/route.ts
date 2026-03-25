import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { sendMessageService } from '@/services/message';
import { sendMessageSchema } from '@/schemas/message';

function mapSendMessageErrorToStatus(error: string): number {
  switch (error) {
    case 'User not found':
    case 'Conversation not found':
      return 404;
    case 'Not a member of this conversation':
      return 403;
    default:
      return 500;
  }
}

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
    if (error instanceof Error) {
      const status = mapSendMessageErrorToStatus(error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status }
      );
    }

    console.error('[API] POST /api/messages/send:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
