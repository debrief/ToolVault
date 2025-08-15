/**
 * Common types and interfaces for ToolVault tool modules
 */

/**
 * Base interface for all tool run functions
 */
export interface ToolRunFunction<TInput = any, TOutput = any> {
  (input: TInput): Promise<TOutput> | TOutput;
}

/**
 * Tool execution context with metadata
 */
export interface ToolExecutionContext {
  toolId: string;
  startTime: number;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Tool execution result wrapper
 */
export interface ToolExecutionResult<TOutput = any> {
  success: boolean;
  output?: TOutput;
  error?: string;
  executionTime: number;
  metadata?: Record<string, any>;
}

/**
 * Tool validation error
 */
export class ToolValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ToolValidationError';
  }
}

/**
 * Tool execution error
 */
export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public toolId: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ToolExecutionError';
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Base tool module interface
 */
export interface ToolModule<TInput = any, TOutput = any> {
  run: ToolRunFunction<TInput, TOutput>;
  validate?: (input: any) => input is TInput;
  metadata?: {
    version?: string;
    author?: string;
    dependencies?: string[];
  };
}

/**
 * Dynamic import result for tool modules
 */
export interface DynamicToolModule<TInput = any, TOutput = any> {
  default: ToolRunFunction<TInput, TOutput>;
  validate?: (input: any) => input is TInput;
  metadata?: ToolModule<TInput, TOutput>['metadata'];
}