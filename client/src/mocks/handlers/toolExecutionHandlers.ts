import { http, HttpResponse } from 'msw';
import type { ExecutionRequest } from '../../types/execution';
import { executionSimulator } from '../utils/executionSimulator';
import { 
  responseCache, 
  responseMetrics,
  simulateNetworkDelay,
  createErrorResponse,
  createSuccessResponse
} from '../utils/responseHelpers';
import { validateToolInputs } from '../../utils/validators';

/**
 * MSW handlers for tool execution API endpoints
 */

// Helper function to extract execution ID from URL
function extractExecutionId(url: string): string | null {
  const match = url.match(/\/api\/executions\/([^\/]+)/);
  return match ? match[1] : null;
}

export const toolExecutionHandlers = [
  // Start tool execution
  http.post('/api/tools/execute', async ({ request }) => {
    const startTime = Date.now();
    
    try {
      await simulateNetworkDelay(50); // Simulate network latency

      const body = await request.json() as ExecutionRequest;
      const { toolId, inputs, options } = body;

      // Validate required fields
      if (!toolId) {
        const errorResponse = createErrorResponse(
          'INVALID_REQUEST',
          'Tool ID is required',
          { field: 'toolId', provided: toolId },
          400
        );
        return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
      }

      if (!inputs || typeof inputs !== 'object') {
        const errorResponse = createErrorResponse(
          'INVALID_REQUEST',
          'Inputs object is required',
          { field: 'inputs', provided: inputs },
          400
        );
        return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
      }

      // Validate tool inputs
      const validation = validateToolInputs(toolId, inputs);
      if (!validation.isValid) {
        const errorResponse = createErrorResponse(
          'INVALID_INPUT',
          'Input validation failed',
          {
            errors: validation.errors,
            toolId,
            inputs
          },
          400
        );
        return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
      }

      // Start execution
      const execution = await executionSimulator.startExecution(toolId, inputs, options);
      
      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(execution, responseTime);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/tools/execute', 'POST', responseTime, false, responseSize);

      return HttpResponse.json(response, { status: 202 });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'EXECUTION_ERROR',
        error instanceof Error ? error.message : 'Failed to start execution',
        { originalError: error },
        500
      );

      responseMetrics.record('/api/tools/execute', 'POST', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Get execution status and progress
  http.get('/api/executions/:executionId/status', async ({ request, params }) => {
    const startTime = Date.now();
    const executionId = params.executionId as string;
    
    try {
      await simulateNetworkDelay(20);

      // Check cache first
      const cacheKey = `status:${executionId}`;
      let cached = responseCache.get(cacheKey);
      let fromCache = false;

      if (!cached) {
        const status = executionSimulator.getExecutionStatus(executionId);
        
        if (!status) {
          const errorResponse = createErrorResponse(
            'NOT_FOUND',
            'Execution not found',
            { executionId },
            404
          );
          return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
        }

        cached = status;
        // Cache for shorter time if execution is still running
        const ttl = status.status === 'running' ? 1000 : 5 * 60 * 1000;
        responseCache.set(cacheKey, cached, ttl);
      } else {
        fromCache = true;
      }

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(cached, responseTime, fromCache);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/executions/*/status', 'GET', responseTime, fromCache, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'STATUS_ERROR',
        'Failed to get execution status',
        { executionId, error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/executions/*/status', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Get execution progress
  http.get('/api/executions/:executionId/progress', async ({ request, params }) => {
    const startTime = Date.now();
    const executionId = params.executionId as string;
    
    try {
      await simulateNetworkDelay(15);

      const progress = executionSimulator.getExecutionProgress(executionId);
      
      if (!progress) {
        const errorResponse = createErrorResponse(
          'NOT_FOUND',
          'Execution not found',
          { executionId },
          404
        );
        return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
      }

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(progress, responseTime);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/executions/*/progress', 'GET', responseTime, false, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'PROGRESS_ERROR',
        'Failed to get execution progress',
        { executionId, error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/executions/*/progress', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Get execution results
  http.get('/api/executions/:executionId/results', async ({ request, params }) => {
    const startTime = Date.now();
    const executionId = params.executionId as string;
    
    try {
      await simulateNetworkDelay(30); // Results might take longer

      // Check cache first
      const cacheKey = `results:${executionId}`;
      let cached = responseCache.get(cacheKey);
      let fromCache = false;

      if (!cached) {
        const results = executionSimulator.getExecutionResults(executionId);
        
        if (!results) {
          // Check if execution exists but is not completed
          const status = executionSimulator.getExecutionStatus(executionId);
          
          if (!status) {
            const errorResponse = createErrorResponse(
              'NOT_FOUND',
              'Execution not found',
              { executionId },
              404
            );
            return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
          }

          if (status.status === 'running' || status.status === 'pending') {
            const errorResponse = createErrorResponse(
              'NOT_READY',
              'Execution results not yet available',
              { executionId, currentStatus: status.status },
              202
            );
            return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
          }

          if (status.status === 'failed') {
            const errorResponse = createErrorResponse(
              'EXECUTION_FAILED',
              'Execution failed',
              { executionId, error: status.error },
              400
            );
            return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
          }

          const errorResponse = createErrorResponse(
            'NO_RESULTS',
            'No results available for this execution',
            { executionId, status: status.status },
            404
          );
          return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
        }

        cached = results;
        responseCache.set(cacheKey, cached, 10 * 60 * 1000); // Cache results for 10 minutes
      } else {
        fromCache = true;
      }

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(cached, responseTime, fromCache);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/executions/*/results', 'GET', responseTime, fromCache, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'RESULTS_ERROR',
        'Failed to get execution results',
        { executionId, error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/executions/*/results', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Cancel execution
  http.delete('/api/executions/:executionId', async ({ request, params }) => {
    const startTime = Date.now();
    const executionId = params.executionId as string;
    
    try {
      await simulateNetworkDelay(25);

      await executionSimulator.cancelExecution(executionId);

      // Clear related cache entries
      responseCache.set(`status:${executionId}`, null, 0);
      responseCache.set(`results:${executionId}`, null, 0);

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(
        { message: 'Execution cancelled successfully', executionId }, 
        responseTime
      );

      responseMetrics.record('/api/executions/*', 'DELETE', responseTime, false, JSON.stringify(response).length);

      return HttpResponse.json(response, { status: 204 });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      let status = 500;
      let code = 'CANCEL_ERROR';
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          status = 404;
          code = 'NOT_FOUND';
        } else if (error.message.includes('Cannot cancel')) {
          status = 400;
          code = 'CANNOT_CANCEL';
        }
      }

      const errorResponse = createErrorResponse(
        code,
        error instanceof Error ? error.message : 'Failed to cancel execution',
        { executionId },
        status
      );

      responseMetrics.record('/api/executions/*', 'DELETE', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Get execution history
  http.get('/api/executions/history', async ({ request }) => {
    const startTime = Date.now();
    
    try {
      await simulateNetworkDelay(40);

      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      
      const history = executionSimulator.getExecutionHistory(limit);

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(
        { executions: history, total: history.length }, 
        responseTime
      );
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/executions/history', 'GET', responseTime, false, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'HISTORY_ERROR',
        'Failed to get execution history',
        { error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/executions/history', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Get execution statistics
  http.get('/api/executions/stats', async ({ request }) => {
    const startTime = Date.now();
    
    try {
      await simulateNetworkDelay(30);

      const stats = executionSimulator.getExecutionStats();
      const responseStats = responseMetrics.getStats();

      const combinedStats = {
        execution: stats,
        api: responseStats,
        cache: responseCache.get('cache_stats') || { hitRate: 0, size: 0 }
      };

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(combinedStats, responseTime);
      const responseSize = JSON.stringify(response).length;

      responseMetrics.record('/api/executions/stats', 'GET', responseTime, false, responseSize);

      return HttpResponse.json(response);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResponse = createErrorResponse(
        'STATS_ERROR',
        'Failed to get execution statistics',
        { error: error instanceof Error ? error.message : error },
        500
      );

      responseMetrics.record('/api/executions/stats', 'GET', responseTime, false, 0);
      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  }),

  // Health check endpoint
  http.get('/api/health', async ({ request }) => {
    const startTime = Date.now();
    
    try {
      await simulateNetworkDelay(10);

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Date.now() - (Date.now() - 1000 * 60 * 60), // Mock 1 hour uptime
        services: {
          executionSimulator: 'healthy',
          responseCache: 'healthy',
          responseMetrics: 'healthy'
        }
      };

      const responseTime = Date.now() - startTime;
      const response = createSuccessResponse(health, responseTime);

      return HttpResponse.json(response);

    } catch (error) {
      const errorResponse = createErrorResponse(
        'HEALTH_CHECK_ERROR',
        'Health check failed',
        { error: error instanceof Error ? error.message : error },
        503
      );

      return HttpResponse.json(errorResponse.response, { status: errorResponse.status });
    }
  })
];