/**
 * Types for tool execution workflow and mock backend responses
 */

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionRequest {
  toolId: string;
  inputs: Record<string, any>;
  options?: {
    timeout?: number;
    priority?: 'low' | 'normal' | 'high';
    metadata?: Record<string, any>;
  };
}

export interface ExecutionResponse {
  executionId: string;
  status: ExecutionStatus;
  message: string;
  startTime?: Date;
}

export interface ExecutionState {
  id: string;
  toolId: string;
  inputs: Record<string, any>;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  progress: number;
  progressMessage?: string;
  results?: ExecutionResults;
  error?: ExecutionError;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ExecutionResults {
  executionId: string;
  toolId: string;
  status: 'completed';
  startTime: Date;
  endTime: Date;
  duration: number;
  results: any;
  metadata?: {
    version?: string;
    environment?: string;
    performanceMetrics?: {
      cpuUsage?: number;
      memoryUsage?: number;
      networkLatency?: number;
    };
  };
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
  timestamp?: Date;
}

export interface ExecutionProgress {
  executionId: string;
  progress: number;
  progressMessage?: string;
  status: ExecutionStatus;
  estimatedTimeRemaining?: number;
}

// Different types of execution results
export interface TextAnalysisResult {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  readingTime: string;
  wordFrequency?: Array<{ word: string; count: number }>;
  sentiment?: {
    score: number;
    magnitude: number;
    label: 'positive' | 'negative' | 'neutral';
  };
}

export interface GeoSpatialResult {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: string;
      coordinates: number[] | number[][] | number[][][];
    };
    properties: Record<string, any>;
  }>;
  metadata: {
    totalFeatures: number;
    boundingBox: [number, number, number, number];
    projection: string;
    dataSource?: string;
  };
}

export interface ChartDataResult {
  type: 'chart';
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'histogram';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }>;
  };
  options?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    legend?: boolean;
  };
}

export interface TableDataResult {
  type: 'table';
  columns: Array<{
    key: string;
    title: string;
    dataType: 'string' | 'number' | 'boolean' | 'date';
    sortable?: boolean;
  }>;
  rows: Array<Record<string, any>>;
  metadata: {
    totalRows: number;
    totalColumns: number;
    summary?: Record<string, any>;
  };
}

export interface BinaryFileResult {
  type: 'file';
  filename: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
  preview?: {
    thumbnail?: string;
    description?: string;
  };
}

// Error types specific to execution
export type ExecutionErrorCode = 
  | 'INVALID_INPUT'
  | 'RESOURCE_EXHAUSTED' 
  | 'TOOL_UNAVAILABLE'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'VALIDATION_FAILED'
  | 'EXECUTION_CANCELLED';

// Mock scenario configurations
export interface MockScenario {
  probability: number;
  delay?: number;
  responseModifier?: (response: any) => any;
}

export interface MockScenarios {
  networkErrors: MockScenario & {
    types: Array<'timeout' | 'connection_refused' | 'dns_failure' | 'server_error'>;
  };
  executionErrors: MockScenario & {
    types: Array<{
      code: ExecutionErrorCode;
      probability: number;
    }>;
  };
  slowExecution: MockScenario & {
    multiplier: number;
  };
  partialFailure: MockScenario;
  resourceExhaustion: MockScenario;
}

// Service interfaces
export interface ToolExecutionService {
  executeTool(toolId: string, inputs: Record<string, any>): Promise<ExecutionResponse>;
  getExecutionStatus(executionId: string): Promise<ExecutionState>;
  getExecutionProgress(executionId: string): Promise<ExecutionProgress>;
  cancelExecution(executionId: string): Promise<void>;
  getExecutionResults(executionId: string): Promise<ExecutionResults>;
  getExecutionHistory(limit?: number): Promise<ExecutionState[]>;
}

// Utility types
export type MockResultType = 
  | TextAnalysisResult 
  | GeoSpatialResult 
  | ChartDataResult 
  | TableDataResult 
  | BinaryFileResult;