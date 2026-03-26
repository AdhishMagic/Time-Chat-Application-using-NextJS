import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/core/db';
import { registerUserService } from '@/modules/auth/services';
import { registerApiSchema } from '@/modules/auth/schemas';

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

    const parsed = registerApiSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { 
          success: false, 
          error: firstError?.message || 'Validation failed' 
        },
        { status: 400 }
      );
    }

    const result = await registerUserService(parsed.data);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('already') ? 409 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
