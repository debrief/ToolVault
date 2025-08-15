import type { MockScenarios, ExecutionErrorCode } from '../../types/execution';
import { executionErrors } from './executionResults';

/**
 * Mock scenarios for testing various execution conditions
 */

export const mockScenarios: MockScenarios = {
  networkErrors: {
    probability: 0.05, // 5% chance of network errors
    delay: 0,
    types: ['timeout', 'connection_refused', 'dns_failure', 'server_error']
  },
  executionErrors: {
    probability: 0.1, // 10% chance of execution errors
    delay: 0,
    types: [
      { code: 'INVALID_INPUT', probability: 0.4 },
      { code: 'RESOURCE_EXHAUSTED', probability: 0.2 },
      { code: 'TOOL_UNAVAILABLE', probability: 0.15 },
      { code: 'TIMEOUT', probability: 0.1 },
      { code: 'INTERNAL_ERROR', probability: 0.08 },
      { code: 'RATE_LIMITED', probability: 0.05 },
      { code: 'PERMISSION_DENIED', probability: 0.01 },
      { code: 'VALIDATION_FAILED', probability: 0.01 }
    ]
  },
  slowExecution: {
    probability: 0.15, // 15% chance of slow execution
    multiplier: 3, // 3x longer than normal
    delay: 0
  },
  partialFailure: {
    probability: 0.05, // 5% chance of partial failure
    delay: 2000
  },
  resourceExhaustion: {
    probability: 0.03, // 3% chance of resource exhaustion
    delay: 1000
  }
};

// Environment-specific scenario overrides
export const developmentScenarios: Partial<MockScenarios> = {
  networkErrors: {
    ...mockScenarios.networkErrors,
    probability: 0.1 // Higher probability in development for testing
  },
  executionErrors: {
    ...mockScenarios.executionErrors,
    probability: 0.15 // Higher probability for better error testing
  }
};

export const testScenarios: Partial<MockScenarios> = {
  networkErrors: {
    ...mockScenarios.networkErrors,
    probability: 0.0 // Disable random errors in tests unless explicitly enabled
  },
  executionErrors: {
    ...mockScenarios.executionErrors,
    probability: 0.0
  },
  slowExecution: {
    ...mockScenarios.slowExecution,
    probability: 0.0
  }
};

// Tool-specific base execution durations (in milliseconds)
export const toolExecutionDurations: Record<string, number> = {
  'wordcount': 1200,
  'geospatial-analysis': 3500,
  'data-visualizer': 2100,
  'data-processor': 1800,
  'file-processor': 5300,
  'advanced-analyzer': 8750,
  'text-processor': 2400,
  'data-analyzer': 4200,
  'utility-helper': 800,
  // Default for unknown tools
  'default': 2000
};

export function getToolBaseDuration(toolId: string): number {
  return toolExecutionDurations[toolId] || toolExecutionDurations.default;
}

// Network error generators
export function generateNetworkError(type: string): Error {
  switch (type) {
    case 'timeout':
      const error = new Error('Request timeout');
      error.name = 'TimeoutError';
      return error;
    
    case 'connection_refused':
      const connError = new Error('Connection refused');
      connError.name = 'NetworkError';
      return connError;
    
    case 'dns_failure':
      const dnsError = new Error('DNS resolution failed');
      dnsError.name = 'DNSError';
      return dnsError;
    
    case 'server_error':
      const serverError = new Error('Internal server error');
      serverError.name = 'ServerError';
      return serverError;
    
    default:
      return new Error('Unknown network error');
  }
}

// Execution error generators
export function generateExecutionError(code: ExecutionErrorCode) {
  return executionErrors[code];
}

// Random error selection
export function getRandomNetworkError(): Error {
  const types = mockScenarios.networkErrors.types;
  const randomType = types[Math.floor(Math.random() * types.length)];
  return generateNetworkError(randomType);
}

export function getRandomExecutionError() {
  const errorTypes = mockScenarios.executionErrors.types;
  const random = Math.random();
  let cumulative = 0;
  
  for (const errorType of errorTypes) {
    cumulative += errorType.probability;
    if (random <= cumulative) {
      return generateExecutionError(errorType.code);
    }
  }
  
  // Fallback to internal error
  return generateExecutionError('INTERNAL_ERROR');
}

// Scenario application logic
export interface ScenarioResult {
  shouldFail: boolean;
  duration: number;
  error?: Error;
  delay?: number;
}

export function applyScenario(toolId: string, inputs: any, environment = 'development'): ScenarioResult {
  const scenarios = environment === 'test' ? testScenarios : 
                    environment === 'development' ? developmentScenarios : 
                    mockScenarios;

  const baseDuration = getToolBaseDuration(toolId);
  let result: ScenarioResult = {
    shouldFail: false,
    duration: baseDuration
  };

  // Check for network errors
  if (Math.random() < (scenarios.networkErrors?.probability || 0)) {
    return {
      shouldFail: true,
      duration: 0,
      error: getRandomNetworkError()
    };
  }

  // Check for execution errors
  if (Math.random() < (scenarios.executionErrors?.probability || 0)) {
    return {
      shouldFail: true,
      duration: Math.random() * baseDuration * 0.7, // Fail partway through
      error: new Error(getRandomExecutionError().message)
    };
  }

  // Check for slow execution
  if (Math.random() < (scenarios.slowExecution?.probability || 0)) {
    result.duration = baseDuration * (scenarios.slowExecution?.multiplier || 1);
  }

  // Check for partial failure (starts but fails later)
  if (Math.random() < (scenarios.partialFailure?.probability || 0)) {
    result.shouldFail = true;
    result.duration = baseDuration * 0.8; // Fail near the end
    result.error = new Error('Execution failed during final processing step');
  }

  // Check for resource exhaustion
  if (Math.random() < (scenarios.resourceExhaustion?.probability || 0)) {
    result.shouldFail = true;
    result.duration = baseDuration * 0.3; // Fail early due to resources
    result.error = new Error(generateExecutionError('RESOURCE_EXHAUSTED').message);
  }

  return result;
}

// Specific test scenario generators
export const testScenarioGenerators = {
  alwaysSucceed: (toolId: string): ScenarioResult => ({
    shouldFail: false,
    duration: getToolBaseDuration(toolId)
  }),
  
  alwaysFail: (toolId: string, errorCode: ExecutionErrorCode = 'INTERNAL_ERROR'): ScenarioResult => ({
    shouldFail: true,
    duration: getToolBaseDuration(toolId) * 0.1,
    error: new Error(generateExecutionError(errorCode).message)
  }),
  
  slowExecution: (toolId: string, multiplier = 5): ScenarioResult => ({
    shouldFail: false,
    duration: getToolBaseDuration(toolId) * multiplier
  }),
  
  timeoutError: (toolId: string): ScenarioResult => ({
    shouldFail: true,
    duration: 30000, // Timeout duration
    error: new Error(generateExecutionError('TIMEOUT').message)
  })
};

// Environment configuration
export function getScenarioConfig(environment: string): Partial<MockScenarios> {
  switch (environment) {
    case 'test':
      return testScenarios;
    case 'development':
      return developmentScenarios;
    case 'production':
      return {}; // No mock scenarios in production
    default:
      return mockScenarios;
  }
}