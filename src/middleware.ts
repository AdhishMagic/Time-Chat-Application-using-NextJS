import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { verifyTokenVersion } from '@/lib/verify-token-version';

const PROTECTED_ROUTES = ['/api/messages', '/chat'];
const PUBLIC_ROUTES = ['/api/auth', '/login', '/register'];

interface AuthPayload {
  userId: string;
  email: string;
  tokenVersion: number;
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  return extractTokenFromHeader(authHeader);
}

async function authenticateRequest(request: NextRequest): Promise<AuthPayload> {
  const token = extractToken(request);

  if (!token) {
    throw NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const isTokenValid = await verifyTokenVersion(payload.userId, payload.tokenVersion);
  if (!isTokenValid) {
    throw NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return {
    userId: payload.userId,
    email: payload.email,
    tokenVersion: payload.tokenVersion,
  };
}

function injectAuthHeaders(request: NextRequest, auth: AuthPayload): Headers {
  const headers = new Headers(request.headers);
  headers.set('x-user-id', auth.userId);
  headers.set('x-user-email', auth.email);
  headers.set('x-token-version', auth.tokenVersion.toString());
  return headers;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  try {
    const auth = await authenticateRequest(request);
    const headers = injectAuthHeaders(request, auth);

    return NextResponse.next({
      request: { headers },
    });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/:path*', '/chat/:path*'],
};
