import { ZodError } from 'zod';

export interface ErrorResponse {
  success: false;
  error: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type ActionResponse<T> = SuccessResponse<T> | ErrorResponse;

export function handleError(error: unknown): ErrorResponse {
  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.issues[0]?.message || 'Invalid input format',
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: 'Something went wrong',
  };
}

export function createErrorResponse(message: string): ErrorResponse {
  return {
    success: false,
    error: message,
  };
}

export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}
