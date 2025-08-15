import { setupServer } from 'msw/node';
import { toolExecutionHandlers } from '../mocks/handlers/toolExecutionHandlers';
import { metadataHandlers } from '../mocks/handlers/metadataHandlers';
import { testScenarioGenerators } from '../mocks/data/scenarios';
import { executionSimulator } from '../mocks/utils/executionSimulator';
import { responseCache, responseMetrics } from '../mocks/utils/responseHelpers';
import { http, HttpResponse } from 'msw';

/**
 * MSW testing setup with comprehensive test utilities
 */

// Combine all handlers
const handlers = [
  ...toolExecutionHandlers,
  ...metadataHandlers
];

// Create the server
export const server = setupServer(...handlers);

// Enhanced server configuration for testing
export interface MSWTestConfig {
  quiet?: boolean;
  onUnhandledRequest?: 'error' | 'warn' | 'bypass';
  resetBetweenTests?: boolean;
}

// Start server with configuration
export function startMockServer(config: MSWTestConfig = {}): void {
  const {
    quiet = true,
    onUnhandledRequest = 'error',
    resetBetweenTests = true
  } = config;

  try {
    server.listen({
      onUnhandledRequest
    });

    if (!quiet) {
      console.log('🚀 Mock Server started for testing environment');
      console.log('📡 Mock API endpoints available for testing');
    }
  } catch (error) {
    console.error('Failed to start Mock Server:', error);
    throw error;
  }
}

// Stop server
export function stopMockServer(): void {
  try {
    server.close();
    console.log('🛑 Mock Server stopped');
  } catch (error) {
    console.error('Failed to stop Mock Server:', error);
    throw error;
  }
}

// Reset handlers and clear state
export function resetMockServer(): void {
  server.resetHandlers();
  executionSimulator.reset();
  responseCache.clear();
  console.log('🔄 Mock Server handlers and state reset');
}

// Add runtime handlers
export function addServerHandlers(...newHandlers: Parameters<typeof server.use>): void {
  server.use(...newHandlers);
}

// Enhanced test setup helpers
export const testSetup = {
  // Setup before all tests
  beforeAll: (config?: MSWTestConfig) => {
    const finalConfig = { quiet: true, onUnhandledRequest: 'error' as const, ...config };
    server.listen({
      onUnhandledRequest: finalConfig.onUnhandledRequest
    });
  },

  // Cleanup after each test
  afterEach: () => {
    server.resetHandlers();
    executionSimulator.reset();
    responseCache.clear();
  },

  // Cleanup after all tests
  afterAll: () => {
    server.close();
  }
};

// Test scenario utilities
export const mockTestScenarios = {
  // Force all executions to succeed immediately
  allSuccess: () => {
    server.use(
      http.post('/api/tools/execute', ({ request }) => {
        return HttpResponse.json({
          data: {
            executionId: 'test_success_immediate',
            status: 'completed',
            message: 'Test execution completed immediately'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: 'test_req_001'
          }
        }, { status: 202 });
      })
    );
  },

  // Force all executions to fail
  allFailure: (errorCode: string = 'INTERNAL_ERROR') => {
    server.use(
      http.post('/api/tools/execute', ({ request }) => {
        return HttpResponse.json({
          error: {
            code: errorCode,
            message: 'Test execution failed as configured',
            timestamp: new Date().toISOString(),
            requestId: 'test_req_002'
          }
        }, { status: 500 });
      })
    );
  },

  // Simulate network delays
  slowNetwork: (delayMs: number = 2000) => {
    const originalHandlers = [...toolExecutionHandlers];
    const delayedHandlers = originalHandlers.map(handler => 
      http.post('/api/tools/execute', async ({ request }) => {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return HttpResponse.json({
          data: {
            executionId: 'test_slow_network',
            status: 'running',
            message: 'Test execution with network delay'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: 'test_req_003'
          }
        }, { status: 202 });
      })
    );
    
    server.use(...delayedHandlers);
  },

  // Mock specific tool responses
  mockToolResponse: (toolId: string, response: any, status: number = 200) => {
    server.use(
      http.post('/api/tools/execute', async ({ request }) => {
        const body = await request.json() as any;
        if (body.toolId === toolId) {
          return HttpResponse.json(response, { status });
        }
        // Pass through to original handlers for other tools
        return HttpResponse.passthrough();
      })
    );
  },

  // Mock execution status responses
  mockExecutionStatus: (executionId: string, status: any) => {
    server.use(
      http.get(`/api/executions/${executionId}/status`, () => {
        return HttpResponse.json({
          data: status,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: 'test_status_req'
          }
        });
      })
    );
  },

  // Mock execution results
  mockExecutionResults: (executionId: string, results: any) => {
    server.use(
      http.get(`/api/executions/${executionId}/results`, () => {
        return HttpResponse.json({
          data: results,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: 'test_results_req'
          }
        });
      })
    );
  }
};

// Test data generators
export const testDataGenerators = {
  // Generate realistic execution response
  createExecutionResponse: (toolId: string, overrides: Partial<any> = {}) => ({
    executionId: `test_${toolId}_${Date.now()}`,
    status: 'running',
    message: 'Test execution started',
    startTime: new Date(),
    ...overrides
  }),

  // Generate realistic execution state
  createExecutionState: (executionId: string, overrides: Partial<any> = {}) => ({
    id: executionId,
    toolId: 'test-tool',
    inputs: { test: 'input' },
    status: 'running',
    startTime: new Date(),
    progress: 50,
    progressMessage: 'Processing test data...',
    ...overrides
  }),

  // Generate realistic execution results
  createExecutionResults: (executionId: string, toolId: string, overrides: Partial<any> = {}) => ({
    executionId,
    toolId,
    status: 'completed',
    startTime: new Date(Date.now() - 5000),
    endTime: new Date(),
    duration: 5000,
    results: {
      testOutput: 'Generated test results',
      value: 42,
      success: true
    },
    metadata: {
      version: '1.0.0',
      environment: 'test'
    },
    ...overrides
  })
};

// Performance testing utilities
export const performanceTestUtils = {
  // Measure response times
  measureResponseTime: async (fn: () => Promise<any>): Promise<{ result: any; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  // Generate load test scenarios
  createLoadTest: (concurrency: number, duration: number) => {
    const requests: Promise<any>[] = [];
    const startTime = Date.now();
    
    for (let i = 0; i < concurrency; i++) {
      const request = new Promise(async (resolve) => {
        while (Date.now() - startTime < duration) {
          const start = performance.now();
          try {
            await fetch('/api/tools/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                toolId: 'test-tool',
                inputs: { test: `load-test-${i}` }
              })
            });
          } catch (error) {
            // Track errors
          }
          const responseTime = performance.now() - start;
          await new Promise(r => setTimeout(r, Math.max(0, 100 - responseTime))); // Throttle
        }
        resolve(i);
      });
      requests.push(request);
    }
    
    return Promise.all(requests);
  },

  // Get performance metrics
  getPerformanceMetrics: () => {
    return responseMetrics.getStats();
  }
};

// Accessibility testing helpers
export const accessibilityTestUtils = {
  // Mock ARIA announcements for testing
  mockAriaAnnouncements: () => {
    const announcements: string[] = [];
    
    // Mock live region updates
    const originalSetTextContent = Text.prototype.textContent!;
    Object.defineProperty(Text.prototype, 'textContent', {
      set(value: string) {
        if (this.parentElement?.getAttribute('aria-live')) {
          announcements.push(value);
        }
        originalSetTextContent.call(this, value);
      },
      get() {
        return originalSetTextContent.call(this);
      }
    });
    
    return {
      getAnnouncements: () => announcements,
      clearAnnouncements: () => announcements.length = 0
    };
  },

  // Mock screen reader testing
  mockScreenReader: () => {
    const interactions: Array<{ element: Element; action: string }> = [];
    
    const trackInteraction = (element: Element, action: string) => {
      interactions.push({ element, action });
    };
    
    return {
      getInteractions: () => interactions,
      clearInteractions: () => interactions.length = 0,
      trackInteraction
    };
  }
};

// Error simulation utilities
export const errorSimulationUtils = {
  // Simulate various network conditions
  simulateNetworkConditions: (condition: 'slow' | 'offline' | 'unstable') => {
    switch (condition) {
      case 'slow':
        mockTestScenarios.slowNetwork(3000);
        break;
      case 'offline':
        server.use(
          http.all('*', () => {
            return HttpResponse.error();
          })
        );
        break;
      case 'unstable':
        server.use(
          http.all('*', () => {
            // 30% chance of failure
            if (Math.random() < 0.3) {
              return HttpResponse.error();
            }
            return HttpResponse.passthrough();
          })
        );
        break;
    }
  },

  // Simulate server errors
  simulateServerError: (statusCode: number, message: string) => {
    server.use(
      http.all('*', () => {
        return HttpResponse.json({
          error: {
            code: 'SIMULATED_ERROR',
            message,
            timestamp: new Date().toISOString()
          }
        }, { status: statusCode });
      })
    );
  },

  // Simulate authentication errors
  simulateAuthError: () => {
    server.use(
      http.all('*', () => {
        return HttpResponse.json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString()
          }
        }, { status: 401 });
      })
    );
  }
};

// Export all utilities
export default {
  server,
  testSetup,
  mockTestScenarios,
  testDataGenerators,
  performanceTestUtils,
  accessibilityTestUtils,
  errorSimulationUtils,
  startMockServer,
  stopMockServer,
  resetMockServer,
  addServerHandlers
};