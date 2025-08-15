import { setupWorker } from 'msw/browser';
import { toolExecutionHandlers } from './handlers/toolExecutionHandlers';
import { metadataHandlers } from './handlers/metadataHandlers';

/**
 * MSW browser setup for development and testing
 */

// Combine all handlers
const handlers = [
  ...toolExecutionHandlers,
  ...metadataHandlers
];

// Create the worker
export const worker = setupWorker(...handlers);

// Enhanced startup with configuration
export interface MSWConfig {
  quiet?: boolean;
  onUnhandledRequest?: 'error' | 'warn' | 'bypass';
  serviceWorker?: {
    url?: string;
    options?: RegistrationOptions;
  };
}

export async function startMockServiceWorker(config: MSWConfig = {}): Promise<void> {
  const {
    quiet = false,
    onUnhandledRequest = 'warn',
    serviceWorker
  } = config;

  try {
    await worker.start({
      quiet,
      onUnhandledRequest,
      serviceWorker: serviceWorker ? {
        url: serviceWorker.url || '/mockServiceWorker.js',
        options: serviceWorker.options
      } : undefined
    });

    if (!quiet) {
      console.log('🚀 Mock Service Worker started successfully');
      console.log('📡 Mock API endpoints available:');
      console.log('  - POST /api/tools/execute');
      console.log('  - GET  /api/executions/:id/status');
      console.log('  - GET  /api/executions/:id/progress');
      console.log('  - GET  /api/executions/:id/results');
      console.log('  - DELETE /api/executions/:id');
      console.log('  - GET  /api/executions/history');
      console.log('  - GET  /api/executions/stats');
      console.log('  - GET  /api/health');
      console.log('  - GET  /api/tools/:id/metadata');
      console.log('  - GET  /api/tools/metadata');
      console.log('  - GET  /api/system/info');
      console.log('  - GET  /api/docs');
    }
  } catch (error) {
    console.error('Failed to start Mock Service Worker:', error);
    throw error;
  }
}

// Stop the worker
export async function stopMockServiceWorker(): Promise<void> {
  try {
    worker.stop();
    console.log('🛑 Mock Service Worker stopped');
  } catch (error) {
    console.error('Failed to stop Mock Service Worker:', error);
    throw error;
  }
}

// Reset handlers (useful for testing)
export function resetMockServiceWorker(): void {
  worker.resetHandlers();
  console.log('🔄 Mock Service Worker handlers reset');
}

// Add runtime handlers
export function addMockHandlers(...newHandlers: Parameters<typeof worker.use>): void {
  worker.use(...newHandlers);
}

// Environment-specific configuration
export function getEnvironmentConfig(): MSWConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  
  if (isTest) {
    return {
      quiet: true,
      onUnhandledRequest: 'error' // Strict mode for tests
    };
  }
  
  if (isDevelopment) {
    return {
      quiet: false,
      onUnhandledRequest: 'warn' // Warn about unhandled requests in development
    };
  }
  
  return {
    quiet: true,
    onUnhandledRequest: 'bypass' // Production mode (though MSW shouldn't run in production)
  };
}

// Auto-start based on environment
if (typeof window !== 'undefined') {
  const shouldStart = 
    process.env.NODE_ENV === 'development' || 
    process.env.VITE_USE_MOCK_API === 'true' ||
    window.location.search.includes('mock=true');

  if (shouldStart) {
    const config = getEnvironmentConfig();
    startMockServiceWorker(config).catch(error => {
      console.error('Auto-start of Mock Service Worker failed:', error);
    });
  }
}

export default worker;