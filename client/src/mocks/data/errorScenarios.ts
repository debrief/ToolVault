import { http, HttpResponse } from 'msw';
import { createErrorResponse, simulateNetworkDelay } from '../utils/responseHelpers';
import type { ExecutionErrorCode } from '../../types/execution';

/**
 * Advanced error scenarios for comprehensive testing
 */

// Network error simulation handlers
export const networkErrorHandlers = {
  // Simulate network timeout
  timeout: (endpoint: string) => {
    return http.all(endpoint, async () => {
      await simulateNetworkDelay(35000); // Longer than typical timeout
      throw new Error('Request timeout');
    });
  },

  // Simulate connection refused
  connectionRefused: (endpoint: string) => {
    return http.all(endpoint, () => {
      throw new Error('Connection refused');
    });
  },

  // Simulate server error (500)
  serverError: (endpoint: string, message: string = 'Internal server error') => {
    return http.all(endpoint, async () => {
      await simulateNetworkDelay(100);
      const errorResponse = createErrorResponse('INTERNAL_ERROR', message, {}, 500);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    });
  },

  // Simulate rate limiting (429)
  rateLimited: (endpoint: string) => {
    return http.all(endpoint, async () => {
      await simulateNetworkDelay(50);
      const errorResponse = createErrorResponse(
        'RATE_LIMITED', 
        'Too many requests', 
        {
          retryAfter: 60,
          limit: 100,
          windowSize: '1 hour'
        },
        429
      );
      return HttpResponse.json(errorResponse.response, { 
        status: errorResponse.status,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 60000)
        }
      });
    });
  },

  // Simulate bad gateway (502)
  badGateway: (endpoint: string) => {
    return http.all(endpoint, async () => {
      await simulateNetworkDelay(200);
      const errorResponse = createErrorResponse('BAD_GATEWAY', 'Bad gateway', {}, 502);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    });
  },

  // Simulate service unavailable (503)
  serviceUnavailable: (endpoint: string) => {
    return http.all(endpoint, async () => {
      await simulateNetworkDelay(100);
      const errorResponse = createErrorResponse(
        'SERVICE_UNAVAILABLE', 
        'Service temporarily unavailable', 
        { estimatedRecovery: '5 minutes' },
        503
      );
      return HttpResponse.json(errorResponse.response, { 
        status: errorResponse.status,
        headers: {
          'Retry-After': '300'
        }
      });
    });
  }
};

// Execution error scenarios
export const executionErrorScenarios = {
  // Input validation errors
  invalidInput: (toolId: string, field: string, message: string) => {
    return http.post('/api/tools/execute', async ({ request }) => {
      await simulateNetworkDelay(50);
      const errorResponse = createErrorResponse(
        'INVALID_INPUT',
        `Input validation failed for field '${field}'`,
        {
          field,
          message,
          toolId,
          validationErrors: [{ field, message, code: 'INVALID_VALUE' }]
        },
        400
      );
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    });
  },

  // Resource exhaustion
  resourceExhausted: (executionId?: string) => {
    return http.get(`/api/executions/${executionId || ':executionId'}/status`, async () => {
      await simulateNetworkDelay(100);
      
      return HttpResponse.json({
        data: {
          id: executionId || 'exec_resource_exhausted',
          status: 'failed',
          progress: 45,
          error: {
            code: 'RESOURCE_EXHAUSTED',
            message: 'Insufficient system resources to complete execution',
            details: {
              memoryUsage: '95%',
              cpuUsage: '98%',
              recommendation: 'Try again later when resources are available'
            },
            retryable: true,
            timestamp: new Date().toISOString()
          }
        }
      });
    });
  },

  // Tool unavailable
  toolUnavailable: (toolId: string) => {
    return http.post('/api/tools/execute', async ({ request }) => {
      const body = await request.json() as { toolId: string };
      
      if (body.toolId === toolId) {
        await simulateNetworkDelay(75);
        const errorResponse = createErrorResponse(
          'TOOL_UNAVAILABLE',
          `Tool '${toolId}' is temporarily unavailable`,
          {
            toolId,
            maintenanceWindow: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            estimatedReturnTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
          },
          503
        );
        return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
      }

      return HttpResponse.json({ data: { executionId: 'test', status: 'running' } });
    });
  },

  // Execution timeout
  executionTimeout: (executionId: string) => {
    return http.get(`/api/executions/${executionId}/status`, async () => {
      await simulateNetworkDelay(150);
      
      return HttpResponse.json({
        data: {
          id: executionId,
          status: 'failed',
          progress: 75,
          error: {
            code: 'TIMEOUT',
            message: 'Execution timed out after 30 seconds',
            details: {
              timeoutDuration: 30000,
              progress: 0.75,
              lastStep: 'processing-analysis-step-3'
            },
            retryable: true,
            timestamp: new Date().toISOString()
          }
        }
      });
    });
  },

  // Permission denied
  permissionDenied: (toolId: string) => {
    return http.post('/api/tools/execute', async ({ request }) => {
      const body = await request.json() as { toolId: string };
      
      if (body.toolId === toolId) {
        await simulateNetworkDelay(25);
        const errorResponse = createErrorResponse(
          'PERMISSION_DENIED',
          `Permission denied for tool '${toolId}'`,
          {
            requiredPermission: `tool:execute:${toolId}`,
            userPermissions: ['tool:execute:basic', 'tool:view:all']
          },
          403
        );
        return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
      }

      return HttpResponse.json({ data: { executionId: 'test', status: 'running' } });
    });
  }
};

// Progressive failure scenarios
export const progressiveFailureScenarios = {
  // Starts successfully, then fails mid-execution
  midExecutionFailure: (executionId: string, failurePoint: number = 0.6) => {
    let progressChecks = 0;

    return http.get(`/api/executions/${executionId}/status`, async () => {
      progressChecks++;
      await simulateNetworkDelay(100);

      // Progress normally for first few checks
      if (progressChecks <= 3) {
        return HttpResponse.json({
          data: {
            id: executionId,
            status: 'running',
            progress: progressChecks * 25,
            progressMessage: `Step ${progressChecks} of processing...`
          }
        });
      }

      // Then fail
      return HttpResponse.json({
        data: {
          id: executionId,
          status: 'failed',
          progress: failurePoint * 100,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Execution failed during processing step 4',
            details: {
              step: 4,
              phase: 'data-analysis',
              errorDetails: 'Unexpected data format encountered'
            },
            retryable: false,
            timestamp: new Date().toISOString()
          }
        }
      });
    });
  },

  // Intermittent network issues
  intermittentFailure: (endpoint: string, failureRate: number = 0.3) => {
    let requestCount = 0;

    return http.all(endpoint, async (info) => {
      requestCount++;
      
      // Fail randomly based on failure rate
      if (Math.random() < failureRate) {
        if (requestCount % 3 === 0) {
          // Timeout occasionally
          await simulateNetworkDelay(35000);
          throw new Error('Timeout');
        } else {
          // Server error more commonly
          await simulateNetworkDelay(200);
          const errorResponse = createErrorResponse(
            'INTERMITTENT_ERROR',
            'Temporary server error',
            { attempt: requestCount },
            503
          );
          return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
        }
      }

      // Success case - forward to original handler
      // This would need to be implemented based on the original handler logic
      await simulateNetworkDelay(50);
      return HttpResponse.json({ data: { success: true, attempt: requestCount } });
    });
  }
};

// Slow response scenarios
export const slowResponseScenarios = {
  // Extremely slow execution
  slowExecution: (executionId: string, delayMs: number = 10000) => {
    let statusChecks = 0;

    return http.get(`/api/executions/${executionId}/status`, async () => {
      statusChecks++;
      await simulateNetworkDelay(delayMs / 10); // Each check takes long

      const progress = Math.min(95, statusChecks * 10);
      
      if (statusChecks >= 10) {
        return HttpResponse.json({
          data: {
            id: executionId,
            status: 'completed',
            progress: 100,
            results: { message: 'Slow execution completed' }
          }
        });
      }

      return HttpResponse.json({
        data: {
          id: executionId,
          status: 'running',
          progress,
          progressMessage: `Slow processing... step ${statusChecks}`,
          estimatedTimeRemaining: (10 - statusChecks) * (delayMs / 10)
        }
      });
    });
  },

  // Variable response times
  variableDelay: (endpoint: string, minDelay: number = 100, maxDelay: number = 5000) => {
    return http.all(endpoint, async (info) => {
      const delay = minDelay + Math.random() * (maxDelay - minDelay);
      await simulateNetworkDelay(delay);
      
      // Return success response
      return HttpResponse.json({
        data: { 
          message: 'Variable delay response', 
          delay: Math.round(delay) 
        }
      });
    });
  }
};

// Composite scenarios for comprehensive testing
export const compositeScenarios = {
  // Realistic production-like issues
  productionLike: {
    handlers: [
      networkErrorHandlers.serverError('/api/health'), // Health check fails occasionally
      executionErrorScenarios.resourceExhausted(), // Some executions fail due to resources
      progressiveFailureScenarios.intermittentFailure('/api/executions/*/progress', 0.1), // 10% intermittent failures
      slowResponseScenarios.variableDelay('/api/tools/*/metadata', 200, 2000) // Variable metadata loading
    ]
  },

  // High load scenario
  highLoad: {
    handlers: [
      networkErrorHandlers.rateLimited('/api/tools/execute'),
      networkErrorHandlers.serviceUnavailable('/api/executions/*/results'),
      slowResponseScenarios.slowExecution('*', 8000)
    ]
  },

  // Infrastructure problems
  infrastructureIssues: {
    handlers: [
      networkErrorHandlers.timeout('/api/executions/*/status'),
      networkErrorHandlers.badGateway('/api/tools/execute'),
      networkErrorHandlers.connectionRefused('/api/health')
    ]
  }
};

// Test scenario activators
export const activateScenario = {
  networkTimeout: () => [networkErrorHandlers.timeout('/api/*')],
  allServerErrors: () => [networkErrorHandlers.serverError('/api/*')],
  rateLimitEverything: () => [networkErrorHandlers.rateLimited('/api/*')],
  slowEverything: (delay: number = 3000) => [slowResponseScenarios.variableDelay('/api/*', delay, delay * 1.5)],
  intermittentIssues: (failureRate: number = 0.2) => [progressiveFailureScenarios.intermittentFailure('/api/*', failureRate)]
};