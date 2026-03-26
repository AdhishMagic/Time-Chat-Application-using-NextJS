import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/core/db';
import { getMessagesService } from '@/modules/chat/services';
import { getMessagesSchema } from '@/modules/chat/schemas';
import { hasPermission } from '@/services/permission.service';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parseLimit(rawLimit: string | null): number {
  if (!rawLimit) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(rawLimit, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function parseCursor(rawCursor: string | null): string | undefined {
  if (!rawCursor) {
    return undefined;
  }

  const trimmed = rawCursor.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);

      if (typeof parsed === 'string') {
        return parsed;
      }

      if (parsed && typeof parsed === 'object') {
        const maybeCursor = (parsed as { cursor?: unknown }).cursor;
        if (typeof maybeCursor === 'string') {
          return maybeCursor;
        }
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  return trimmed;
}



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await connectDB();

    const { conversationId } = await params;

    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission to read conversations
    const canReadConversations = await hasPermission(userId, 'conversation:read');
    if (!canReadConversations) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation id' },
        { status: 400 }
      );
    }

    const cursor = parseCursor(request.nextUrl.searchParams.get('cursor'));
    const limit = parseLimit(request.nextUrl.searchParams.get('limit'));
    const parsed = getMessagesSchema.safeParse({
      conversationId,
      cursor,
      limit,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const data = await getMessagesService(
      parsed.data.conversationId,
      userId,
      parsed.data.cursor,
      parsed.data.limit
    );

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      const status =
        error.message === 'Conversation not found'
          ? 404
          : error.message === 'Not a member of this conversation'
            ? 403
            : 500;
      return NextResponse.json(
        { success: false, error: error.message },
        { status }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
