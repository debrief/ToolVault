/**
 * Dynamic Tool Execution Service
 * 
 * Handles dynamic loading and execution of tool modules with validation
 */

import type { Tool, ToolInput } from '../types';
import type { ToolExecutionMessage, ToolExecutionResponse } from '../workers/toolExecutionWorker';
import { ToolValidationError, ToolExecutionError, type ToolExecutionResult } from '../tools/types';

export interface DynamicExecutionOptions {
  timeout?: number;
  validateInput?: boolean;
  validateOutput?: boolean;
}

export interface ExecutionProgress {
  executionId: string;
  progress: number;
  status: 'initializing' | 'loading' | 'executing' | 'completed' | 'error';
  startTime: number;
  endTime?: number;
}

export class DynamicToolExecutionService {
  private worker: Worker | null = null;
  private activeExecutions = new Map<string, ExecutionProgress>();
  private executionPromises = new Map<string, {
    resolve: (result: ToolExecutionResult) => void;
    reject: (error: Error) => void;
  }>();

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    try {
      // Initialize the web worker
      this.worker = new Worker(
        new URL('../workers/toolExecutionWorker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent<ToolExecutionResponse>) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Tool execution worker error:', error);
        // Reject all pending executions
        this.executionPromises.forEach(({ reject }) => {
          reject(new ToolExecutionError('Worker error', 'unknown'));
        });
        this.cleanup();
      };

    } catch (error) {
      console.error('Failed to initialize tool execution worker:', error);
    }
  }

  private handleWorkerMessage(response: ToolExecutionResponse) {
    const { executionId, type } = response;
    const execution = this.activeExecutions.get(executionId);
    const promise = this.executionPromises.get(executionId);

    if (!execution) return;

    switch (type) {
      case 'progress':
        if (response.progress !== undefined) {
          execution.progress = response.progress;
          if (response.progress < 50) {
            execution.status = 'loading';
          } else {
            execution.status = 'executing';
          }
        }
        break;

      case 'success':
        execution.status = 'completed';
        execution.endTime = Date.now();
        execution.progress = 100;
        
        if (promise && response.data) {
          promise.resolve({
            success: true,
            output: response.data.output,
            executionTime: response.data.executionTime,
            metadata: {
              toolId: response.data.toolId,
              timestamp: response.data.timestamp
            }
          });
        }
        
        this.cleanup(executionId);
        break;

      case 'error':
        execution.status = 'error';
        execution.endTime = Date.now();
        
        if (promise) {
          promise.reject(new ToolExecutionError(
            response.error || 'Tool execution failed',
            execution.executionId
          ));
        }
        
        this.cleanup(executionId);
        break;
    }
  }

  /**
   * Execute a tool dynamically
   */
  async executeTool(
    tool: Tool, 
    input: Record<string, any>, 
    options: DynamicExecutionOptions = {}
  ): Promise<ToolExecutionResult> {
    if (!this.worker) {
      throw new ToolExecutionError('Worker not available', tool.id);
    }

    const executionId = this.generateExecutionId();
    const {
      timeout = 30000,
      validateInput = true,
      validateOutput = true
    } = options;

    // Validate that the tool has a module path
    if (!tool.module) {
      throw new ToolExecutionError(
        `Tool "${tool.id}" does not have a module path defined`,
        tool.id
      );
    }

    // Validate inputs if requested
    if (validateInput) {
      this.validateToolInput(tool, input);
    }

    // Create execution tracking
    const execution: ExecutionProgress = {
      executionId,
      progress: 0,
      status: 'initializing',
      startTime: Date.now()
    };
    
    this.activeExecutions.set(executionId, execution);

    // Create promise for execution result
    const executionPromise = new Promise<ToolExecutionResult>((resolve, reject) => {
      this.executionPromises.set(executionId, { resolve, reject });
      
      // Set timeout
      setTimeout(() => {
        if (this.activeExecutions.has(executionId)) {
          this.cancelExecution(executionId);
          reject(new ToolExecutionError(
            `Tool execution timed out after ${timeout}ms`,
            tool.id
          ));
        }
      }, timeout);
    });

    // Send execution message to worker
    const message: ToolExecutionMessage = {
      type: 'execute',
      data: {
        toolId: tool.id,
        modulePath: tool.module,
        input,
        executionId
      }
    };

    this.worker.postMessage(message);
    execution.status = 'loading';

    try {
      const result = await executionPromise;
      
      // Validate output if requested
      if (validateOutput && result.output) {
        this.validateToolOutput(tool, result.output);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ToolValidationError || error instanceof ToolExecutionError) {
        throw error;
      }
      throw new ToolExecutionError(
        `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tool.id,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Cancel a tool execution
   */
  cancelExecution(executionId: string): void {
    if (this.worker && this.activeExecutions.has(executionId)) {
      const message: ToolExecutionMessage = {
        type: 'cancel',
        data: {
          toolId: '',
          modulePath: '',
          input: {},
          executionId
        }
      };
      this.worker.postMessage(message);
      this.cleanup(executionId);
    }
  }

  /**
   * Get execution progress
   */
  getExecutionProgress(executionId: string): ExecutionProgress | null {
    return this.activeExecutions.get(executionId) || null;
  }

  /**
   * Get all active executions
   */
  getActiveExecutions(): ExecutionProgress[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Validate tool input against schema
   */
  private validateToolInput(tool: Tool, input: Record<string, any>): void {
    if (!tool.inputs) return;

    for (const inputDef of tool.inputs) {
      const value = input[inputDef.name];
      
      // Check required fields
      if (inputDef.required && (value === undefined || value === null)) {
        throw new ToolValidationError(
          `Required input "${inputDef.name}" is missing`,
          inputDef.name,
          value
        );
      }

      // Basic type validation
      if (value !== undefined && value !== null) {
        if (!this.validateInputType(value, inputDef.type)) {
          throw new ToolValidationError(
            `Input "${inputDef.name}" has invalid type. Expected ${inputDef.type}, got ${typeof value}`,
            inputDef.name,
            value
          );
        }
      }
    }
  }

  /**
   * Validate tool output against schema
   */
  private validateToolOutput(tool: Tool, output: any): void {
    if (!tool.outputs || typeof output !== 'object') return;

    // Basic validation - ensure all declared outputs exist
    for (const outputDef of tool.outputs) {
      if (outputDef.name && !(outputDef.name in output)) {
        console.warn(`Tool output missing declared field: ${outputDef.name}`);
      }
    }
  }

  /**
   * Basic type validation
   */
  private validateInputType(value: any, expectedType: string): boolean {
    switch (expectedType.toLowerCase()) {
      case 'string':
        return typeof value === 'string';
      case 'number':
      case 'integer':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
      case 'geojson':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true; // Allow unknown types
    }
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up execution resources
   */
  private cleanup(executionId?: string): void {
    if (executionId) {
      this.activeExecutions.delete(executionId);
      this.executionPromises.delete(executionId);
    } else {
      // Clean up all
      this.activeExecutions.clear();
      this.executionPromises.clear();
    }
  }

  /**
   * Dispose of the service
   */
  dispose(): void {
    this.cleanup();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Singleton instance
export const dynamicToolExecutionService = new DynamicToolExecutionService();