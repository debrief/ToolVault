import retry from 'async-retry';
import type { ToolVaultIndex } from '../types/index';
import { parseToolVaultIndex } from '../utils/validators';
import { NetworkError, ValidationError, NotFoundError } from './errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/data';

interface RetryOptions {
  retries: number;
  factor: number;
  minTimeout: number;
  maxTimeout: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 8000,
};

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<Response> {
  return retry(
    async (bail) => {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        // Don't retry on 4xx client errors (except 404)
        if (response.status >= 400 && response.status < 500 && response.status !== 404) {
          bail(new NetworkError(`Client error: ${response.statusText}`, response.status));
          return response; // Won't be reached due to bail
        }

        if (response.status === 404) {
          bail(new NotFoundError('Tool data not found'));
          return response; // Won't be reached due to bail
        }

        if (!response.ok) {
          throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`, response.status);
        }

        return response;
      } catch (error) {
        if (error instanceof NetworkError && error.status && error.status < 500) {
          // Don't retry client errors
          bail(error);
        }
        throw error;
      }
    },
    retryOptions
  );
}

export async function fetchToolVaultIndex(): Promise<ToolVaultIndex> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/index.json`);
    const data = await response.json();
    
    // Validate and parse the data using our schema validator
    return parseToolVaultIndex(data);
  } catch (error) {
    if (error instanceof NetworkError || error instanceof NotFoundError) {
      throw error;
    }
    
    if (error instanceof Error && error.message.includes('Invalid ToolVault index data')) {
      throw new ValidationError('Invalid tool data format', error.message);
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON format in tool data');
    }
    
    // Generic network/fetch errors
    throw new NetworkError('Failed to fetch tool data', undefined);
  }
}

export async function refreshToolVaultIndex(): Promise<ToolVaultIndex> {
  // Force a fresh fetch by adding a cache-busting parameter
  const timestamp = Date.now();
  const response = await fetchWithRetry(`${API_BASE_URL}/index.json?t=${timestamp}`, {
    cache: 'no-cache',
  });
  
  const data = await response.json();
  return parseToolVaultIndex(data);
}