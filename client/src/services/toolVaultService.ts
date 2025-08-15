import retry from 'async-retry';
import type { ToolVaultIndex } from '../types/index';
import { parseToolVaultIndex } from '../utils/validators';
import { 
  NetworkError, 
  ValidationError, 
  NotFoundError, 
  TimeoutError,
  ToolVaultServiceError,
  isRetryableError,
  createErrorReport
} from './errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/data';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface RetryOptions {
  retries: number;
  factor: number;
  minTimeout: number;
  maxTimeout: number;
}

interface FetchOptions extends RequestInit {
  timeout?: number;
  retryOptions?: Partial<RetryOptions>;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 8000,
};

// Enhanced fetch with timeout support
async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new TimeoutError(`Request timeout after ${timeout}ms`, timeout);
      }
      throw NetworkError.fromFetchError(error, url);
    }
    
    throw new NetworkError('Unknown fetch error', undefined, url);
  }
}

// Enhanced retry wrapper with better error handling
async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retryOptions: customRetryOptions, ...fetchOptions } = options;
  const retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...customRetryOptions };

  return retry(
    async (bail) => {
      try {
        const response = await fetchWithTimeout(url, fetchOptions);

        // Handle different HTTP status codes
        if (response.status === 404) {
          bail(new NotFoundError('Resource not found', url));
          return response; // Won't be reached due to bail
        }

        // Don't retry on 4xx client errors (except specific retryable ones)
        if (response.status >= 400 && response.status < 500) {
          // These are retryable 4xx errors
          if (response.status === 408 || response.status === 429) {
            throw NetworkError.fromResponse(response, url);
          }
          
          // Other 4xx errors are not retryable
          bail(NetworkError.fromResponse(response, url));
          return response; // Won't be reached due to bail
        }

        if (!response.ok) {
          throw NetworkError.fromResponse(response, url);
        }

        return response;
      } catch (error) {
        // If error is not retryable, bail out
        if (!isRetryableError(error)) {
          bail(error instanceof Error ? error : new Error(String(error)));
        }
        throw error;
      }
    },
    retryOptions
  );
}

// Service method wrapper for consistent error handling
async function serviceMethod<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const serviceError = error instanceof Error 
      ? ToolVaultServiceError.fromError(error, operation)
      : new ToolVaultServiceError('Unknown error occurred', 'unknown', operation);
    
    // Report error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Service Error:', createErrorReport(serviceError));
    }
    
    throw serviceError;
  }
}

export async function fetchToolVaultIndex(options?: FetchOptions): Promise<ToolVaultIndex> {
  return serviceMethod('fetchToolVaultIndex', async () => {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/index.json`, options);
      const data = await response.json();
      
      // Validate and parse the data using our schema validator
      return parseToolVaultIndex(data);
    } catch (error) {
      // Re-throw our custom errors as-is
      if (error instanceof NetworkError || 
          error instanceof NotFoundError || 
          error instanceof TimeoutError) {
        throw error;
      }
      
      // Handle validation errors from parseToolVaultIndex
      if (error instanceof Error && error.message.includes('Invalid ToolVault index data')) {
        throw new ValidationError('Invalid tool data format', error.message);
      }
      
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new ValidationError('Invalid JSON format in tool data');
      }
      
      // Generic fallback
      throw new NetworkError('Failed to fetch tool data');
    }
  });
}

export async function refreshToolVaultIndex(options?: FetchOptions): Promise<ToolVaultIndex> {
  return serviceMethod('refreshToolVaultIndex', async () => {
    // Force a fresh fetch by adding a cache-busting parameter
    const timestamp = Date.now();
    const response = await fetchWithRetry(`${API_BASE_URL}/index.json?t=${timestamp}`, {
      cache: 'no-cache',
      ...options,
    });
    
    const data = await response.json();
    return parseToolVaultIndex(data);
  });
}

// New service methods with enhanced error handling
export async function validateToolData(data: unknown): Promise<ToolVaultIndex> {
  return serviceMethod('validateToolData', async () => {
    try {
      return parseToolVaultIndex(data);
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError('Tool data validation failed', error.message);
      }
      throw new ValidationError('Unknown validation error');
    }
  });
}

export async function checkApiHealth(options?: FetchOptions): Promise<boolean> {
  return serviceMethod('checkApiHealth', async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {
        method: 'HEAD',
        timeout: 5000, // Short timeout for health check
        ...options,
      });
      return response.ok;
    } catch {
      return false;
    }
  });
}

// Batch operations with individual error handling
export async function fetchMultipleResources<T>(
  urls: string[],
  options?: FetchOptions
): Promise<Array<{ url: string; data?: T; error?: ToolVaultServiceError }>> {
  return serviceMethod('fetchMultipleResources', async () => {
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const response = await fetchWithRetry(url, options);
          const data = await response.json();
          return { url, data };
        } catch (error) {
          return { 
            url, 
            error: error instanceof Error 
              ? ToolVaultServiceError.fromError(error, 'fetchResource')
              : new ToolVaultServiceError('Unknown error', 'unknown', 'fetchResource')
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return { 
          url: urls[index], 
          error: new ToolVaultServiceError(result.reason?.message || 'Request failed', 'unknown', 'fetchResource')
        };
      }
    });
  });
}

// Export service configuration
export const serviceConfig = {
  apiBaseUrl: API_BASE_URL,
  defaultTimeout: DEFAULT_TIMEOUT,
  retryOptions: DEFAULT_RETRY_OPTIONS,
};