/**
 * Error handling utilities for tasks
 * 
 * Note: Trigger.dev handles retries and error recovery automatically.
 * These utilities are for logging and formatting errors only.
 */

/**
 * Formats an error for logging purposes
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Formats an error with stack trace for detailed logging
 */
export function formatErrorWithStack(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message}${error.stack ? `\nStack: ${error.stack}` : ""}`;
  }
  return String(error);
}
