import type { 
  ToolExecutionService,
  ExecutionRequest,
  ExecutionResponse,
  ExecutionState,
  ExecutionProgress,
  ExecutionResults
} from '../types/execution';
import { 
  NetworkError, 
  ValidationError, 
  NotFoundError, 
  TimeoutError,
  ToolVaultServiceError,
  isRetryableError,
  createErrorReport
} from './errors';

/**
 * Tool Execution Service Implementation with Mock Backend Integration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface FetchOptions extends RequestInit {
  timeout?: number;
}

// Enhanced fetch with timeout and error handling
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
      console.error('Tool Execution Service Error:', createErrorReport(serviceError));
    }
    
    throw serviceError;
  }
}

// Response wrapper type
interface APIResponse<T> {
  data: T;
  metadata?: {
    timestamp: string;
    requestId: string;
    executionTime?: number;
    cached?: boolean;
  };
}

// Mock Tool Execution Service Implementation
export class MockToolExecutionService implements ToolExecutionService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Execute a tool with given inputs
   */
  async executeTool(toolId: string, inputs: Record<string, any>, options?: ExecutionRequest['options']): Promise<ExecutionResponse> {
    return serviceMethod('executeTool', async () => {
      const request: ExecutionRequest = {
        toolId,
        inputs,
        options
      };

      const response = await fetchWithTimeout(`${this.baseUrl}/api/tools/execute`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new ValidationError('Input validation failed', errorData.error?.details);
        }
        throw NetworkError.fromResponse(response);
      }

      const data: APIResponse<ExecutionResponse> = await response.json();
      return data.data;
    });
  }

  /**
   * Get execution status and current state
   */
  async getExecutionStatus(executionId: string): Promise<ExecutionState> {
    return serviceMethod('getExecutionStatus', async () => {
      const response = await fetchWithTimeout(`${this.baseUrl}/api/executions/${executionId}/status`);

      if (response.status === 404) {
        throw new NotFoundError('Execution not found', executionId);
      }

      if (!response.ok) {
        throw NetworkError.fromResponse(response);
      }

      const data: APIResponse<ExecutionState> = await response.json();
      return data.data;
    });
  }

  /**
   * Get execution progress information
   */
  async getExecutionProgress(executionId: string): Promise<ExecutionProgress> {
    return serviceMethod('getExecutionProgress', async () => {
      const response = await fetchWithTimeout(`${this.baseUrl}/api/executions/${executionId}/progress`);

      if (response.status === 404) {
        throw new NotFoundError('Execution not found', executionId);
      }

      if (!response.ok) {
        throw NetworkError.fromResponse(response);
      }

      const data: APIResponse<ExecutionProgress> = await response.json();
      return data.data;
    });
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    return serviceMethod('cancelExecution', async () => {
      const response = await fetchWithTimeout(`${this.baseUrl}/api/executions/${executionId}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        throw new NotFoundError('Execution not found', executionId);
      }

      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new ValidationError('Cannot cancel execution', errorData.error?.message);
      }

      if (!response.ok && response.status !== 204) {
        throw NetworkError.fromResponse(response);
      }
    });
  }

  /**
   * Get execution results
   */
  async getExecutionResults(executionId: string): Promise<ExecutionResults> {
    return serviceMethod('getExecutionResults', async () => {
      const response = await fetchWithTimeout(`${this.baseUrl}/api/executions/${executionId}/results`);

      if (response.status === 404) {
        throw new NotFoundError('Execution results not found', executionId);
      }

      if (response.status === 202) {
        const errorData = await response.json().catch(() => ({}));
        throw new ValidationError('Execution not yet completed', errorData.error?.details);
      }

      if (!response.ok) {
        throw NetworkError.fromResponse(response);
      }

      const data: APIResponse<ExecutionResults> = await response.json();
      return data.data;
    });
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(limit?: number): Promise<ExecutionState[]> {
    return serviceMethod('getExecutionHistory', async () => {
      const params = new URLSearchParams();
      if (limit) {
        params.append('limit', limit.toString());
      }

      const url = `${this.baseUrl}/api/executions/history${params.toString() ? `?${params}` : ''}`;
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw NetworkError.fromResponse(response);
      }

      const data: APIResponse<{ executions: ExecutionState[]; total: number }> = await response.json();
      return data.data.executions;
    });
  }

  /**
   * Poll for execution completion with automatic retry
   */
  async pollForCompletion(
    executionId: string, 
    options: {
      maxAttempts?: number;
      intervalMs?: number;
      onProgress?: (progress: ExecutionProgress) => void;
    } = {}
  ): Promise<ExecutionResults> {
    const {
      maxAttempts = 60, // 5 minutes with 5s intervals
      intervalMs = 5000,
      onProgress
    } = options;

    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const poll = async () => {
        try {
          attempts++;
          
          const status = await this.getExecutionStatus(executionId);
          
          if (onProgress) {
            const progress = await this.getExecutionProgress(executionId).catch(() => null);
            if (progress) {
              onProgress(progress);
            }
          }

          switch (status.status) {
            case 'completed':
              try {
                const results = await this.getExecutionResults(executionId);
                resolve(results);
              } catch (error) {
                reject(error);
              }
              return;

            case 'failed':
              reject(new ToolVaultServiceError(
                `Execution failed: ${status.error?.message || 'Unknown error'}`,
                'server',
                'pollForCompletion',
                status.error?.details
              ));
              return;

            case 'cancelled':
              reject(new ToolVaultServiceError(
                'Execution was cancelled',
                'validation',
                'pollForCompletion'
              ));
              return;

            case 'running':
            case 'pending':
              if (attempts >= maxAttempts) {
                reject(new TimeoutError(
                  `Execution did not complete within ${maxAttempts} attempts`,
                  maxAttempts * intervalMs
                ));
                return;
              }
              
              setTimeout(poll, intervalMs);
              break;

            default:
              reject(new ToolVaultServiceError(
                `Unknown execution status: ${status.status}`,
                'unknown',
                'pollForCompletion'
              ));
              return;
          }
        } catch (error) {
          if (attempts >= maxAttempts || !isRetryableError(error)) {
            reject(error);
          } else {
            setTimeout(poll, intervalMs);
          }
        }
      };

      poll();
    });
  }

  /**
   * Execute tool and wait for completion (convenience method)
   */
  async executeAndWait(
    toolId: string,
    inputs: Record<string, any>,
    options: {
      executionOptions?: ExecutionRequest['options'];
      pollOptions?: Parameters<typeof this.pollForCompletion>[1];
    } = {}
  ): Promise<ExecutionResults> {
    const executionResponse = await this.executeTool(
      toolId, 
      inputs, 
      options.executionOptions
    );

    return this.pollForCompletion(
      executionResponse.executionId,
      options.pollOptions
    );
  }

  /**
   * Get tool metadata
   */
  async getToolMetadata(toolId: string): Promise<any> {
    return serviceMethod('getToolMetadata', async () => {
      const response = await fetchWithTimeout(`${this.baseUrl}/api/tools/${toolId}/metadata`);

      if (response.status === 404) {
        throw new NotFoundError('Tool not found', toolId);
      }

      if (!response.ok) {
        throw NetworkError.fromResponse(response);
      }

      const data: APIResponse<any> = await response.json();
      return data.data;
    });
  }

  /**
   * Get system health status
   */
  async getHealth(): Promise<any> {
    return serviceMethod('getHealth', async () => {
      const response = await fetchWithTimeout(`${this.baseUrl}/api/health`, {
        timeout: 5000 // Short timeout for health checks
      });

      if (!response.ok) {
        throw NetworkError.fromResponse(response);
      }

      const data: APIResponse<any> = await response.json();
      return data.data;
    });
  }
}

// Production Tool Execution Service (placeholder)
export class ProductionToolExecutionService implements ToolExecutionService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async executeTool(toolId: string, inputs: Record<string, any>): Promise<ExecutionResponse> {
    throw new Error('Production service not implemented yet');
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionState> {
    throw new Error('Production service not implemented yet');
  }

  async getExecutionProgress(executionId: string): Promise<ExecutionProgress> {
    throw new Error('Production service not implemented yet');
  }

  async cancelExecution(executionId: string): Promise<void> {
    throw new Error('Production service not implemented yet');
  }

  async getExecutionResults(executionId: string): Promise<ExecutionResults> {
    throw new Error('Production service not implemented yet');
  }

  async getExecutionHistory(limit?: number): Promise<ExecutionState[]> {
    throw new Error('Production service not implemented yet');
  }
}

// Service factory for environment-based selection
export function createToolExecutionService(): ToolExecutionService {
  const useMockService = 
    process.env.NODE_ENV === 'development' || 
    process.env.VITE_USE_MOCK_API === 'true' ||
    (typeof window !== 'undefined' && window.location.search.includes('mock=true'));

  if (useMockService) {
    return new MockToolExecutionService();
  } else {
    return new ProductionToolExecutionService();
  }
}

// Default service instance
export const toolExecutionService = createToolExecutionService();