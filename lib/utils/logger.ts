// Structured logging utility
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
    };

    // In development, use console with colors
    if (this.isDevelopment) {
      const consoleMethod = level === "error" ? console.error : 
                           level === "warn" ? console.warn :
                           level === "debug" ? console.debug : 
                           console.log;
      
      consoleMethod(`[${level.toUpperCase()}] ${message}`, context || "");
      return;
    }

    // In production, use structured logging
    // You can integrate with services like Sentry, LogRocket, etc.
    if (this.isProduction) {
      // Only log errors and warnings in production
      if (level === "error" || level === "warn") {
        // TODO: Integrate with error tracking service
        // Example: Sentry.captureException(new Error(message), { extra: context });
        console.error(JSON.stringify(logEntry));
      }
      return;
    }

    // Default: log everything
    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
      ...(typeof error === "object" && error !== null && { error }),
    };

    this.log("error", message, errorContext);
  }
}

export const logger = new Logger();

