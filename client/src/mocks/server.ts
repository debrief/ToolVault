import { setupServer } from 'msw/node';
import { toolExecutionHandlers } from './handlers/toolExecutionHandlers';
import { metadataHandlers } from './handlers/metadataHandlers';

/**
 * MSW server setup for Node.js testing environments
 */

// Combine all handlers
const handlers = [
  ...toolExecutionHandlers,
  ...metadataHandlers
];

// Create the server
export const server = setupServer(...handlers);

// Enhanced server configuration
export interface MSWServerConfig {
  quiet?: boolean;
  onUnhandledRequest?: 'error' | 'warn' | 'bypass';
}

// Start server with configuration
export function startMockServer(config: MSWServerConfig = {}): void {
  const {
    quiet = false,
    onUnhandledRequest = 'error'
  } = config;

  try {
    server.listen({
      onUnhandledRequest
    });

    if (!quiet) {
      console.log('🚀 Mock Server started for Node.js environment');
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

// Reset handlers
export function resetMockServer(): void {
  server.resetHandlers();
  console.log('🔄 Mock Server handlers reset');
}

// Add runtime handlers
export function addServerHandlers(...newHandlers: Parameters<typeof server.use>): void {
  server.use(...newHandlers);
}

// Environment-specific configuration for Node.js
export function getNodeEnvironmentConfig(): MSWServerConfig {
  const isTest = process.env.NODE_ENV === 'test';
  const isCI = process.env.CI === 'true';
  
  if (isTest || isCI) {
    return {
      quiet: true,
      onUnhandledRequest: 'error' // Strict mode for tests
    };
  }
  
  return {
    quiet: false,
    onUnhandledRequest: 'warn'
  };
}

// Test setup helpers
export const testSetup = {
  // Setup before all tests
  beforeAll: (config?: MSWServerConfig) => {
    const finalConfig = { ...getNodeEnvironmentConfig(), ...config };
    server.listen({
      onUnhandledRequest: finalConfig.onUnhandledRequest
    });
  },

  // Cleanup after each test
  afterEach: () => {
    server.resetHandlers();
  },

  // Cleanup after all tests
  afterAll: () => {
    server.close();
  }
};

// Helper for specific test scenarios
export const mockScenarios = {
  // Force all executions to succeed immediately
  allSuccess: () => {
    server.use(...handlers.map(handler => {
      // This would need to be implemented based on specific test needs
      return handler;
    }));
  },

  // Force all executions to fail
  allFailure: () => {
    server.use(...handlers.map(handler => {
      // This would need to be implemented based on specific test needs
      return handler;
    }));
  },

  // Simulate network delays
  slowNetwork: (delayMs: number = 2000) => {
    // Implementation would add delay to all handlers
    console.log(`Simulating ${delayMs}ms network delay`);
  }
};

export default server;