import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/core/db';
import { hasPermission } from '@/services/permission.service';
import { checkOwnership } from '@/core/auth';
import Message from '@/models/Message';

export async function DELETE(
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

    const canDelete = await hasPermission(userId, 'message:delete');
    if (!canDelete) {
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

    message.isDeleted = true;
    await message.save();

    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}