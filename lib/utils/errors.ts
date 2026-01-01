// Centralized error handling utilities
import { NextResponse } from "next/server";
import { z } from "zod";

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Standardized error handler for API routes
 * Converts errors to consistent NextResponse format
 */
export function handleApiError(error: unknown, defaultMessage = "Internal server error"): NextResponse<ApiErrorResponse> {
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Invalid request data",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === "development" 
      ? error.message 
      : defaultMessage;

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  // Handle unknown error types
  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown, fallback = "An error occurred"): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}

/**
 * Type guard to check if error is a ZodError
 */
export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

