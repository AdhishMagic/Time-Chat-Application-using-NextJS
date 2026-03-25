import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { verifyTokenVersion } from '@/lib/verify-token-version';

export interface ProxyAuthResult {
  userId: string;
  email: string;
  tokenVersion: number;
}

export interface ProxyErrorResponse {
  response: NextResponse;
}

const PROTECTED_ROUTES = ['/api/messages', '/chat'];
const PUBLIC_ROUTES = ['/api/auth/', '/login', '/register', '/api/auth/register', '/api/auth/login'];

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export function extractAuthFromRequest(request: NextRequest): ProxyErrorResponse | ProxyAuthResult {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return {
    userId: payload.userId,
    email: payload.email,
    tokenVersion: payload.tokenVersion,
  };
}

export function injectAuthHeaders(
  request: NextRequest,
  auth: ProxyAuthResult
): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', auth.userId);
  requestHeaders.set('x-user-email', auth.email);
  requestHeaders.set('x-token-version', auth.tokenVersion.toString());
  return requestHeaders;
}

export async function authenticateRequest(request: NextRequest): Promise<ProxyAuthResult> {
  const auth = extractAuthFromRequest(request);

  if ('response' in auth) {
    throw auth.response;
  }

  const isTokenValid = await verifyTokenVersion(auth.userId, auth.tokenVersion);
  if (!isTokenValid) {
    const response = NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
    throw response;
  }

  return auth;
}

export function getAuthFromHeaders(
  request: NextRequest
): { userId: string; tokenVersion: number } | null {
  const userId = request.headers.get('x-user-id');
  const tokenVersion = request.headers.get('x-token-version');

  if (!userId || !tokenVersion) {
    return null;
  }

  return {
    userId,
    tokenVersion: Number.parseInt(tokenVersion, 10),
  };
}