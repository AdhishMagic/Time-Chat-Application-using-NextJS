import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/core/db';
import { hasPermission } from '@/services/permission.service';
import { checkOwnership } from '@/core/auth';
import Message from '@/models/Message';

const editMessageSchema = z.object({
  text: z.string().min(1).max(5000),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    await connectDB();

    const { messageId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!messageId || !Types.ObjectId.isValid(messageId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid message id format' },
        { status: 400 }
      );
    }

    const canEdit = await hasPermission(userId, 'message:edit');
    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    const owns = await checkOwnership(message.senderId.toString(), userId);
    if (!owns) {
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

    const parsed = editMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid request body' },
        { status: 400 }
      );
    }

    message.text = parsed.data.text;
    message.editedAt = new Date();
    await message.save();

    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error) {
    console.error('Edit message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
