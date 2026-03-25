/**
 * Middleware for Next.js App Router
 * 
 * Example: Extract user ID from JWT token and add to request headers
 * This ensures all routes have proper authentication context
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle authentication
 * In production, verify JWT token and extract user ID
 */
export function middleware(request: NextRequest) {
  // Example: Extract userId from JWT token
  // const token = request.headers.get('Authorization')?.split(' ')[1];
  // const userId = verifyJWT(token)?.userId;
  
  // For development, you might get it from query or header
  // const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');
  
  // Clone the response and add custom headers
  const response = NextResponse.next();
  
  // response.headers.set('x-user-id', userId || '');
  
  return response;
}

/**
 * Configure which routes the middleware applies to
 */
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // But exclude public routes if needed
    '/((?!_next|public).*)',
  ],
};
