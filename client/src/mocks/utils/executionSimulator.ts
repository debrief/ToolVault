import type { 
  ExecutionState, 
  ExecutionResponse, 
  ExecutionResults, 
  ExecutionProgress,
  ExecutionStatus 
} from '../../types/execution';
import { mockExecutionResults, generateDynamicResult } from '../data/executionResults';
import { applyScenario, type ScenarioResult } from '../data/scenarios';

/**
 * Mock execution simulator with progress tracking and state management
 */

export class ExecutionSimulator {
  private executions: Map<string, ExecutionState> = new Map();
  private progressIntervals: Map<string, NodeJS.Timeout> = new Map();
  private completionTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private executionHistory: ExecutionState[] = [];
  private readonly maxHistorySize = 100;

  constructor(private environment: string = 'development') {}

  /**
   * Start a new tool execution
   */
  async startExecution(
    toolId: string, 
    inputs: Record<string, any>,
    options?: { timeout?: number; priority?: string; metadata?: Record<string, any> }
  ): Promise<ExecutionResponse> {
    const executionId = `exec_${toolId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Apply scenario to determine execution behavior
    const scenario = applyScenario(toolId, inputs, this.environment);
    
    const execution: ExecutionState = {
      id: executionId,
      toolId,
      inputs,
      status: 'running',
      startTime: new Date(),
      progress: 0,
      progressMessage: 'Initializing execution...',
      metadata: {
        priority: options?.priority || 'normal',
        estimatedDuration: scenario.duration,
        ...options?.metadata
      }
    };

    this.executions.set(executionId, execution);

    // Handle immediate failures (network errors, etc.)
    if (scenario.shouldFail && scenario.duration === 0) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = {
        code: 'NETWORK_ERROR',
        message: scenario.error?.message || 'Network error occurred',
        retryable: true,
        timestamp: new Date()
      };
      this.addToHistory(execution);
      return {
        executionId,
        status: 'failed',
        message: 'Execution failed immediately',
        startTime: execution.startTime
      };
    }

    // Start progress simulation
    this.simulateProgress(executionId, scenario);

    return {
      executionId,
      status: 'running',
      message: 'Tool execution started successfully',
      startTime: execution.startTime
    };
  }

  /**
   * Get execution status and progress
   */
  getExecutionStatus(executionId: string): ExecutionState | null {
    return this.executions.get(executionId) || null;
  }

  /**
   * Get execution progress information
   */
  getExecutionProgress(executionId: string): ExecutionProgress | null {
    const execution = this.executions.get(executionId);
    if (!execution) return null;

    const estimatedTimeRemaining = this.calculateTimeRemaining(execution);

    return {
      executionId,
      progress: execution.progress,
      progressMessage: execution.progressMessage,
      status: execution.status,
      estimatedTimeRemaining
    };
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    if (execution.status === 'completed' || execution.status === 'failed') {
      throw new Error('Cannot cancel completed execution');
    }

    // Clear any running intervals/timeouts
    this.clearExecutionTimers(executionId);

    // Update execution state
    execution.status = 'cancelled';
    execution.endTime = new Date();
    execution.error = {
      code: 'EXECUTION_CANCELLED',
      message: 'Execution was cancelled by user request',
      retryable: false,
      timestamp: new Date()
    };

    this.addToHistory(execution);
  }

  /**
   * Get execution results
   */
  getExecutionResults(executionId: string): ExecutionResults | null {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'completed' || !execution.results) {
      return null;
    }

    return execution.results;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit?: number): ExecutionState[] {
    const historyLimit = limit || this.maxHistorySize;
    return this.executionHistory
      .slice(-historyLimit)
      .reverse(); // Most recent first
  }

  /**
   * Clean up completed executions
   */
  cleanupCompletedExecutions(olderThanMs: number = 5 * 60 * 1000): void {
    const cutoffTime = Date.now() - olderThanMs;
    
    for (const [executionId, execution] of this.executions.entries()) {
      if (execution.endTime && execution.endTime.getTime() < cutoffTime) {
        this.executions.delete(executionId);
        this.clearExecutionTimers(executionId);
      }
    }
  }

  /**
   * Force complete an execution (for testing)
   */
  forceCompleteExecution(executionId: string, success: boolean = true): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    this.clearExecutionTimers(executionId);
    
    if (success) {
      this.completeExecution(executionId);
    } else {
      this.failExecution(executionId, {
        code: 'INTERNAL_ERROR',
        message: 'Execution force-failed for testing',
        retryable: true,
        timestamp: new Date()
      });
    }
  }

  /**
   * Simulate execution progress with realistic progress curves
   */
  private simulateProgress(executionId: string, scenario: ScenarioResult): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const duration = scenario.duration;
    const updateInterval = Math.max(100, duration / 20); // Update 20 times during execution
    let progressSteps = 0;
    const maxSteps = Math.floor(duration / updateInterval);

    const progressMessages = [
      'Initializing execution...',
      'Loading tool configuration...',
      'Validating inputs...',
      'Processing data...',
      'Analyzing results...',
      'Generating output...',
      'Finalizing execution...'
    ];

    const progressInterval = setInterval(() => {
      const execution = this.executions.get(executionId);
      if (!execution || execution.status !== 'running') {
        clearInterval(progressInterval);
        return;
      }

      progressSteps++;
      
      // Simulate realistic progress curve (fast start, slow middle, fast end)
      const normalizedStep = progressSteps / maxSteps;
      let progress: number;
      
      if (normalizedStep < 0.1) {
        // Fast initial progress
        progress = normalizedStep * 200; // 0 to 20% quickly
      } else if (normalizedStep < 0.8) {
        // Slow middle progress
        progress = 20 + (normalizedStep - 0.1) * 60; // 20% to 80% slowly
      } else {
        // Fast final progress
        progress = 80 + (normalizedStep - 0.8) * 100; // 80% to 100% quickly
      }

      execution.progress = Math.min(95, progress); // Cap at 95% until completion
      
      // Update progress message
      const messageIndex = Math.min(
        progressMessages.length - 1,
        Math.floor(execution.progress / 100 * progressMessages.length)
      );
      execution.progressMessage = progressMessages[messageIndex];

      // Add some randomness to make it feel more realistic
      execution.progress += (Math.random() - 0.5) * 2;
      execution.progress = Math.max(0, Math.min(95, execution.progress));

    }, updateInterval);

    this.progressIntervals.set(executionId, progressInterval);

    // Schedule completion
    const completionTimeout = setTimeout(() => {
      if (scenario.shouldFail) {
        this.failExecution(executionId, {
          code: 'INTERNAL_ERROR',
          message: scenario.error?.message || 'Execution failed during processing',
          retryable: true,
          timestamp: new Date()
        });
      } else {
        this.completeExecution(executionId);
      }
    }, duration);

    this.completionTimeouts.set(executionId, completionTimeout);
  }

  /**
   * Complete an execution successfully
   */
  private completeExecution(executionId: string): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    this.clearExecutionTimers(executionId);

    execution.status = 'completed';
    execution.progress = 100;
    execution.progressMessage = 'Execution completed successfully';
    execution.endTime = new Date();
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

    // Generate results
    const mockResult = mockExecutionResults[execution.toolId]?.success;
    const dynamicResults = generateDynamicResult(execution.toolId, execution.inputs);

    execution.results = {
      executionId,
      toolId: execution.toolId,
      status: 'completed',
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.duration,
      results: dynamicResults,
      metadata: {
        ...mockResult?.metadata,
        performanceMetrics: {
          cpuUsage: Math.random() * 50 + 10,
          memoryUsage: Math.random() * 100 + 20,
          networkLatency: Math.random() * 100 + 5
        }
      }
    };

    this.addToHistory(execution);
  }

  /**
   * Fail an execution with error
   */
  private failExecution(executionId: string, error: ExecutionState['error']): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    this.clearExecutionTimers(executionId);

    execution.status = 'failed';
    execution.endTime = new Date();
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
    execution.error = error;
    execution.progressMessage = `Execution failed: ${error?.message}`;

    this.addToHistory(execution);
  }

  /**
   * Calculate estimated time remaining for execution
   */
  private calculateTimeRemaining(execution: ExecutionState): number | undefined {
    if (execution.status !== 'running' || !execution.metadata?.estimatedDuration) {
      return undefined;
    }

    const elapsed = Date.now() - execution.startTime.getTime();
    const estimated = execution.metadata.estimatedDuration;
    const progressRatio = execution.progress / 100;

    if (progressRatio <= 0) return estimated;

    const estimatedTotal = elapsed / progressRatio;
    return Math.max(0, estimatedTotal - elapsed);
  }

  /**
   * Clear timers for an execution
   */
  private clearExecutionTimers(executionId: string): void {
    const progressInterval = this.progressIntervals.get(executionId);
    if (progressInterval) {
      clearInterval(progressInterval);
      this.progressIntervals.delete(executionId);
    }

    const completionTimeout = this.completionTimeouts.get(executionId);
    if (completionTimeout) {
      clearTimeout(completionTimeout);
      this.completionTimeouts.delete(executionId);
    }
  }

  /**
   * Add execution to history
   */
  private addToHistory(execution: ExecutionState): void {
    this.executionHistory.push({ ...execution });
    
    // Maintain history size limit
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get current execution statistics
   */
  getExecutionStats() {
    return {
      activeExecutions: Array.from(this.executions.values()).filter(e => e.status === 'running').length,
      totalExecutions: this.executions.size,
      historySize: this.executionHistory.length,
      completedExecutions: this.executionHistory.filter(e => e.status === 'completed').length,
      failedExecutions: this.executionHistory.filter(e => e.status === 'failed').length,
      cancelledExecutions: this.executionHistory.filter(e => e.status === 'cancelled').length
    };
  }

  /**
   * Reset all executions (for testing)
   */
  reset(): void {
    // Clear all timers
    for (const executionId of this.executions.keys()) {
      this.clearExecutionTimers(executionId);
    }

    this.executions.clear();
    this.executionHistory = [];
  }
}

// Global singleton instance
export const executionSimulator = new ExecutionSimulator(
  typeof process !== 'undefined' ? process.env.NODE_ENV : 'development'
);