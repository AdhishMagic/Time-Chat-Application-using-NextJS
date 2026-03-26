import { NextRequest, NextResponse } from 'next/server';
import { hasPermission, isAdmin } from '@/services/permission.service';
import { connectDB } from '@/core/db';
import { verifyTokenVersion } from './verify-token-version';

export async function requirePermission(permission: string) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      await connectDB();

      const userId = request.headers.get('x-user-id');
      const tokenVersion = request.headers.get('x-token-version');

      if (!userId || !tokenVersion) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const isTokenValid = await verifyTokenVersion(
        userId,
        Number.parseInt(tokenVersion, 10)
      );

      if (!isTokenValid) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const adminStatus = await isAdmin(userId);
      if (adminStatus) {
        return null;
      }

      const hasPermissionFlag = await hasPermission(userId, permission);
      if (!hasPermissionFlag) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }

      return null;
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function getHeaderUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}
