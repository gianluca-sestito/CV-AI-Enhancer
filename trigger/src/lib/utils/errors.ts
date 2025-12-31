/**
 * Error handling utilities for workflows and tasks
 */

export interface WorkflowError {
  message: string;
  stack?: string;
  step?: string;
  context?: Record<string, unknown>;
}

/**
 * Formats an error with full context for logging and storage
 */
export function formatError(error: unknown, step?: string, context?: Record<string, unknown>): WorkflowError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  return {
    message: errorMessage,
    stack: errorStack,
    step,
    context,
  };
}

/**
 * Creates a detailed error message string for database storage
 */
export function createErrorMessage(error: unknown, step?: string): string {
  const formatted = formatError(error, step);
  let message = formatted.message;
  
  if (formatted.step) {
    message = `[${formatted.step}] ${message}`;
  }
  
  if (formatted.stack) {
    message = `${message}\nStack: ${formatted.stack}`;
  }
  
  if (formatted.context && Object.keys(formatted.context).length > 0) {
    message = `${message}\nContext: ${JSON.stringify(formatted.context, null, 2)}`;
  }
  
  return message;
}

