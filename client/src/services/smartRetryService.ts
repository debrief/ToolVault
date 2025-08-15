import type { 
  ExecutionError, 
  ExecutionErrorCode,
  ToolExecutionService 
} from '../types/execution';
import { toolExecutionService } from './toolExecutionService';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // in milliseconds
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: Set<ExecutionErrorCode>;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number; // in milliseconds
  monitoringPeriod: number; // in milliseconds
}

export interface RetryAttempt {
  attemptNumber: number;
  timestamp: Date;
  delay: number;
  error?: ExecutionError;
  success?: boolean;
}

export interface RetryHistory {
  toolId: string;
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  attempts: RetryAttempt[];
  lastAttempt?: Date;
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStatus {
  state: CircuitState;
  failureCount: number;
  nextAttemptTime?: Date;
  lastFailureTime?: Date;
  successCount: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: new Set([
    'TIMEOUT',
    'RESOURCE_EXHAUSTED',
    'TOOL_UNAVAILABLE',
    'RATE_LIMITED',
    'INTERNAL_ERROR'
  ]),
};

const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 300000, // 5 minutes
};

export class SmartRetryService {
  private retryHistory: Map<string, RetryHistory> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerStatus> = new Map();
  private retryConfig: RetryConfig;
  private circuitBreakerConfig: CircuitBreakerConfig;
  private activeRetries: Map<string, Promise<any>> = new Map();

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    circuitBreakerConfig: Partial<CircuitBreakerConfig> = {}
  ) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.circuitBreakerConfig = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...circuitBreakerConfig };
  }

  /**
   * Execute a tool with smart retry logic and circuit breaker
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: {
      toolId: string;
      operationType: string;
      inputs?: Record<string, any>;
    },
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customConfig };
    const { toolId, operationType } = context;
    const operationKey = `${toolId}:${operationType}`;

    // Check if there's already an active retry for this operation
    if (this.activeRetries.has(operationKey)) {
      return this.activeRetries.get(operationKey)!;
    }

    // Check circuit breaker
    const circuitStatus = this.getCircuitBreakerStatus(toolId);
    if (circuitStatus.state === 'OPEN') {
      const error: ExecutionError = {
        code: 'TOOL_UNAVAILABLE',
        message: `Circuit breaker is OPEN for tool ${toolId}. Next attempt allowed at ${circuitStatus.nextAttemptTime?.toISOString()}`,
        retryable: false,
      };
      throw error;
    }

    // Create retry promise
    const retryPromise = this.performRetryWithBackoff(operation, context, config);
    this.activeRetries.set(operationKey, retryPromise);

    try {
      const result = await retryPromise;
      this.recordSuccess(toolId);
      return result;
    } catch (error) {
      this.recordFailure(toolId, error as ExecutionError);
      throw error;
    } finally {
      this.activeRetries.delete(operationKey);
    }
  }

  /**
   * Perform retry with exponential backoff
   */
  private async performRetryWithBackoff<T>(
    operation: () => Promise<T>,
    context: { toolId: string; operationType: string; inputs?: Record<string, any> },
    config: RetryConfig
  ): Promise<T> {
    const { toolId } = context;
    let lastError: ExecutionError;
    let delay = config.initialDelay;

    const history: RetryHistory = this.getOrCreateRetryHistory(toolId);

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      const attemptRecord: RetryAttempt = {
        attemptNumber: attempt + 1,
        timestamp: new Date(),
        delay: attempt > 0 ? delay : 0,
      };

      try {
        // Wait for the calculated delay (except on first attempt)
        if (attempt > 0) {
          await this.sleep(delay);
        }

        const result = await operation();
        
        // Success
        attemptRecord.success = true;
        history.attempts.push(attemptRecord);
        history.successfulRetries++;
        history.lastAttempt = new Date();

        return result;

      } catch (error) {
        const executionError = this.normalizeError(error);
        lastError = executionError;
        
        attemptRecord.error = executionError;
        history.attempts.push(attemptRecord);
        history.failedRetries++;
        history.totalRetries++;
        history.lastAttempt = new Date();

        // Check if error is retryable
        if (!this.isRetryableError(executionError, config) || attempt >= config.maxRetries) {
          break;
        }

        // Calculate next delay with exponential backoff
        delay = this.calculateNextDelay(delay, config, attempt);
      }
    }

    // All retries exhausted
    throw lastError!;
  }

  /**
   * Calculate next delay with exponential backoff and jitter
   */
  private calculateNextDelay(currentDelay: number, config: RetryConfig, attempt: number): number {
    let nextDelay = Math.min(currentDelay * config.backoffMultiplier, config.maxDelay);
    
    if (config.jitter) {
      // Add random jitter (up to 25% of the delay)
      const jitterAmount = nextDelay * 0.25 * Math.random();
      nextDelay += jitterAmount;
    }

    return Math.floor(nextDelay);
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: ExecutionError, config: RetryConfig): boolean {
    return config.retryableErrors.has(error.code as ExecutionErrorCode) && 
           (error.retryable !== false);
  }

  /**
   * Normalize different error types to ExecutionError
   */
  private normalizeError(error: any): ExecutionError {
    if (error && typeof error === 'object' && 'code' in error) {
      return error as ExecutionError;
    }

    return {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      retryable: true,
    };
  }

  /**
   * Get or create retry history for a tool
   */
  private getOrCreateRetryHistory(toolId: string): RetryHistory {
    if (!this.retryHistory.has(toolId)) {
      this.retryHistory.set(toolId, {
        toolId,
        totalRetries: 0,
        successfulRetries: 0,
        failedRetries: 0,
        attempts: [],
      });
    }
    return this.retryHistory.get(toolId)!;
  }

  /**
   * Record a successful operation
   */
  private recordSuccess(toolId: string): void {
    const circuitStatus = this.getOrCreateCircuitBreakerStatus(toolId);
    
    if (circuitStatus.state === 'HALF_OPEN') {
      // Success in half-open state closes the circuit
      circuitStatus.state = 'CLOSED';
      circuitStatus.failureCount = 0;
      circuitStatus.successCount++;
    } else if (circuitStatus.state === 'CLOSED') {
      circuitStatus.successCount++;
    }
  }

  /**
   * Record a failed operation
   */
  private recordFailure(toolId: string, error: ExecutionError): void {
    const circuitStatus = this.getOrCreateCircuitBreakerStatus(toolId);
    circuitStatus.failureCount++;
    circuitStatus.lastFailureTime = new Date();

    if (circuitStatus.state === 'HALF_OPEN') {
      // Failure in half-open state opens the circuit again
      circuitStatus.state = 'OPEN';
      circuitStatus.nextAttemptTime = new Date(Date.now() + this.circuitBreakerConfig.resetTimeout);
    } else if (circuitStatus.state === 'CLOSED') {
      // Check if we should open the circuit
      if (circuitStatus.failureCount >= this.circuitBreakerConfig.failureThreshold) {
        circuitStatus.state = 'OPEN';
        circuitStatus.nextAttemptTime = new Date(Date.now() + this.circuitBreakerConfig.resetTimeout);
      }
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(toolId: string): CircuitBreakerStatus {
    const status = this.getOrCreateCircuitBreakerStatus(toolId);
    
    // Check if we should transition from OPEN to HALF_OPEN
    if (status.state === 'OPEN' && status.nextAttemptTime && new Date() >= status.nextAttemptTime) {
      status.state = 'HALF_OPEN';
      status.nextAttemptTime = undefined;
    }

    return { ...status };
  }

  /**
   * Get or create circuit breaker status
   */
  private getOrCreateCircuitBreakerStatus(toolId: string): CircuitBreakerStatus {
    if (!this.circuitBreakers.has(toolId)) {
      this.circuitBreakers.set(toolId, {
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
      });
    }
    return this.circuitBreakers.get(toolId)!;
  }

  /**
   * Reset circuit breaker for a tool
   */
  resetCircuitBreaker(toolId: string): void {
    this.circuitBreakers.set(toolId, {
      state: 'CLOSED',
      failureCount: 0,
      successCount: 0,
    });
  }

  /**
   * Get retry statistics for a tool
   */
  getRetryStatistics(toolId: string): RetryHistory | undefined {
    return this.retryHistory.get(toolId);
  }

  /**
   * Get retry statistics for all tools
   */
  getAllRetryStatistics(): Array<RetryHistory> {
    return Array.from(this.retryHistory.values());
  }

  /**
   * Clear retry history for a tool
   */
  clearRetryHistory(toolId: string): void {
    this.retryHistory.delete(toolId);
    this.circuitBreakers.delete(toolId);
  }

  /**
   * Configure retry settings for specific error types
   */
  updateRetryConfig(updates: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...updates };
  }

  /**
   * Configure circuit breaker settings
   */
  updateCircuitBreakerConfig(updates: Partial<CircuitBreakerConfig>): void {
    this.circuitBreakerConfig = { ...this.circuitBreakerConfig, ...updates };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get recommended retry settings based on historical data
   */
  getRecommendedRetryConfig(toolId: string): Partial<RetryConfig> {
    const history = this.retryHistory.get(toolId);
    if (!history || history.attempts.length < 5) {
      return {}; // Not enough data
    }

    const recentAttempts = history.attempts.slice(-10);
    const averageSuccessAttempt = recentAttempts
      .filter(a => a.success)
      .reduce((sum, a) => sum + a.attemptNumber, 0) / recentAttempts.filter(a => a.success).length;

    const commonErrors = new Map<string, number>();
    recentAttempts.forEach(attempt => {
      if (attempt.error) {
        const count = commonErrors.get(attempt.error.code) || 0;
        commonErrors.set(attempt.error.code, count + 1);
      }
    });

    const recommendations: Partial<RetryConfig> = {};

    // Adjust max retries based on success patterns
    if (averageSuccessAttempt > 1 && averageSuccessAttempt < 3) {
      recommendations.maxRetries = Math.ceil(averageSuccessAttempt * 1.5);
    }

    // Adjust initial delay for timeout errors
    const timeoutErrors = commonErrors.get('TIMEOUT') || 0;
    if (timeoutErrors > 3) {
      recommendations.initialDelay = 2000; // Longer initial delay
    }

    // Adjust retryable errors based on success patterns
    const nonRetryableErrors = new Set<ExecutionErrorCode>();
    commonErrors.forEach((count, errorCode) => {
      const errorAttempts = recentAttempts.filter(a => a.error?.code === errorCode);
      const errorSuccesses = errorAttempts.filter(a => a.success).length;
      if (errorSuccesses / errorAttempts.length < 0.1) {
        // If success rate for this error type is very low, make it non-retryable
        nonRetryableErrors.add(errorCode as ExecutionErrorCode);
      }
    });

    if (nonRetryableErrors.size > 0) {
      const retryableErrors = new Set(this.retryConfig.retryableErrors);
      nonRetryableErrors.forEach(errorCode => retryableErrors.delete(errorCode));
      recommendations.retryableErrors = retryableErrors;
    }

    return recommendations;
  }

  /**
   * Analyze retry patterns and generate insights
   */
  generateRetryInsights(): {
    toolsWithHighFailureRate: Array<{ toolId: string; failureRate: number }>;
    commonFailurePatterns: Array<{ errorCode: string; frequency: number; avgRetries: number }>;
    efficiencyMetrics: {
      totalRetries: number;
      successfulRetries: number;
      wastedRetries: number;
      averageRetriesUntilSuccess: number;
    };
    recommendations: string[];
  } {
    const allHistories = Array.from(this.retryHistory.values());
    
    // Tools with high failure rate
    const toolsWithHighFailureRate = allHistories
      .filter(h => h.totalRetries > 5)
      .map(h => ({
        toolId: h.toolId,
        failureRate: h.failedRetries / (h.failedRetries + h.successfulRetries),
      }))
      .filter(t => t.failureRate > 0.3)
      .sort((a, b) => b.failureRate - a.failureRate);

    // Common failure patterns
    const errorPatterns = new Map<string, { count: number; totalRetries: number }>();
    allHistories.forEach(history => {
      history.attempts.forEach(attempt => {
        if (attempt.error) {
          const pattern = errorPatterns.get(attempt.error.code) || { count: 0, totalRetries: 0 };
          pattern.count++;
          pattern.totalRetries += attempt.attemptNumber;
          errorPatterns.set(attempt.error.code, pattern);
        }
      });
    });

    const commonFailurePatterns = Array.from(errorPatterns.entries())
      .map(([errorCode, data]) => ({
        errorCode,
        frequency: data.count,
        avgRetries: data.totalRetries / data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Efficiency metrics
    const totalRetries = allHistories.reduce((sum, h) => sum + h.totalRetries, 0);
    const successfulRetries = allHistories.reduce((sum, h) => sum + h.successfulRetries, 0);
    const wastedRetries = totalRetries - successfulRetries;
    
    const successfulAttempts = allHistories.flatMap(h => h.attempts.filter(a => a.success));
    const averageRetriesUntilSuccess = successfulAttempts.length > 0
      ? successfulAttempts.reduce((sum, a) => sum + a.attemptNumber, 0) / successfulAttempts.length
      : 0;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (toolsWithHighFailureRate.length > 0) {
      recommendations.push(`Consider investigating tools with high failure rates: ${toolsWithHighFailureRate.slice(0, 3).map(t => t.toolId).join(', ')}`);
    }
    
    if (wastedRetries > totalRetries * 0.3) {
      recommendations.push('High number of wasted retries detected. Consider tuning retry policies.');
    }
    
    const topErrors = commonFailurePatterns.slice(0, 2);
    if (topErrors.length > 0 && topErrors[0].avgRetries > 2) {
      recommendations.push(`Most common error ${topErrors[0].errorCode} typically requires ${topErrors[0].avgRetries.toFixed(1)} retries. Consider adjusting retry configuration.`);
    }

    return {
      toolsWithHighFailureRate,
      commonFailurePatterns,
      efficiencyMetrics: {
        totalRetries,
        successfulRetries,
        wastedRetries,
        averageRetriesUntilSuccess,
      },
      recommendations,
    };
  }
}

// Singleton instance
export const smartRetryService = new SmartRetryService();