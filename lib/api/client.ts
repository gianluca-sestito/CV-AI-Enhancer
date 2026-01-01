// Centralized API client with error handling and retry logic
import { logger } from "@/lib/utils/logger";

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export class ApiClientError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestOptions = {},
  retryCount = 0
): Promise<Response> {
  const { retries = DEFAULT_RETRIES, retryDelay = DEFAULT_RETRY_DELAY, ...fetchOptions } = options;

  try {
    const response = await fetch(url, fetchOptions);

    // Retry on server errors (5xx) or network errors
    if (!response.ok && response.status >= 500 && retryCount < retries) {
      logger.warn(`API request failed, retrying...`, {
        url,
        status: response.status,
        attempt: retryCount + 1,
        maxRetries: retries,
      });

      await delay(retryDelay * (retryCount + 1)); // Exponential backoff
      return fetchWithRetry(url, options, retryCount + 1);
    }

    return response;
  } catch (error) {
    // Retry on network errors
    if (retryCount < retries) {
      logger.warn(`Network error, retrying...`, {
        url,
        attempt: retryCount + 1,
        maxRetries: retries,
        error,
      });

      await delay(retryDelay * (retryCount + 1));
      return fetchWithRetry(url, options, retryCount + 1);
    }

    throw error;
  }
}

export async function apiRequest<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, ...restOptions } = options;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  try {
    const response = await fetchWithRetry(url, {
      ...restOptions,
      headers: defaultHeaders,
    });

    // Parse response
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: unknown;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      const errorData = isJson && typeof data === "object" && data !== null
        ? (data as { error?: string; details?: unknown })
        : { error: String(data) };

      throw new ApiClientError(
        errorData.error || `Request failed with status ${response.status}`,
        response.status,
        errorData.details
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      logger.error("Network error", error, { url });
      throw new ApiClientError("Network error. Please check your connection.", 0);
    }

    // Handle unknown errors
    logger.error("Unexpected API error", error, { url });
    throw new ApiClientError(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}

// Convenience methods
export const api = {
  get: <T = unknown>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(url: string, options?: RequestOptions) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),

  patch: <T = unknown>(url: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
};

