import { useState, useCallback, useEffect } from 'react';
import { toolExecutionService } from '../services/toolExecutionService';
import type { 
  ExecutionState, 
  ExecutionResponse, 
  ExecutionResults,
  ExecutionError,
  ExecutionProgress 
} from '../types/execution';
import { ToolVaultServiceError } from '../services/errors';

export interface ExecutionHookState {
  execution: ExecutionState | null;
  isExecuting: boolean;
  error: ExecutionError | null;
  progress: ExecutionProgress | null;
  results: ExecutionResults | null;
}

export interface ExecutionHookActions {
  executeTool: (toolId: string, inputs: Record<string, any>) => Promise<ExecutionResponse>;
  cancelExecution: () => Promise<void>;
  clearExecution: () => void;
  retryExecution: () => Promise<void>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionState>;
}

export interface UseToolExecutionReturn extends ExecutionHookState, ExecutionHookActions {}

export function useToolExecution(): UseToolExecutionReturn {
  const [execution, setExecution] = useState<ExecutionState | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<ExecutionError | null>(null);
  const [progress, setProgress] = useState<ExecutionProgress | null>(null);
  const [results, setResults] = useState<ExecutionResults | null>(null);
  const [lastExecutionParams, setLastExecutionParams] = useState<{
    toolId: string;
    inputs: Record<string, any>;
  } | null>(null);

  // Poll for execution status updates
  useEffect(() => {
    if (!execution || execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await toolExecutionService.getExecutionStatus(execution.id);
        setExecution(status);
        
        // Update progress
        try {
          const progressInfo = await toolExecutionService.getExecutionProgress(execution.id);
          setProgress(progressInfo);
        } catch (progressError) {
          // Progress endpoint may not be available for all executions
          console.debug('Progress not available:', progressError);
        }
        
        // Handle completion
        if (status.status === 'completed') {
          setIsExecuting(false);
          if (status.results) {
            setResults(status.results);
          } else {
            try {
              const executionResults = await toolExecutionService.getExecutionResults(execution.id);
              setResults(executionResults);
            } catch (resultsError) {
              console.error('Failed to fetch results:', resultsError);
            }
          }
        } else if (status.status === 'failed') {
          setIsExecuting(false);
          setError(status.error || {
            code: 'EXECUTION_FAILED',
            message: 'Execution failed with unknown error',
            retryable: true
          });
        } else if (status.status === 'cancelled') {
          setIsExecuting(false);
        }
      } catch (pollError) {
        console.error('Failed to poll execution status:', pollError);
        
        // If we can't poll, assume something went wrong
        if (pollError instanceof ToolVaultServiceError && !pollError.isRetryable) {
          setIsExecuting(false);
          setError({
            code: 'POLLING_FAILED',
            message: 'Lost connection to execution service',
            retryable: true
          });
        }
      }
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  }, [execution?.id, execution?.status]);

  const executeTool = useCallback(async (toolId: string, inputs: Record<string, any>) => {
    try {
      // Clear previous state
      setError(null);
      setResults(null);
      setProgress(null);
      setIsExecuting(true);
      
      // Store execution parameters for retry
      setLastExecutionParams({ toolId, inputs });
      
      // Start execution
      const response = await toolExecutionService.executeTool(toolId, inputs);
      
      // Create initial execution state
      const initialState: ExecutionState = {
        id: response.executionId,
        toolId,
        inputs,
        status: response.status,
        startTime: response.startTime || new Date(),
        progress: 0,
      };
      
      setExecution(initialState);
      return response;
    } catch (executionError) {
      setIsExecuting(false);
      
      if (executionError instanceof ToolVaultServiceError) {
        setError({
          code: executionError.code as any,
          message: executionError.message,
          details: executionError.details,
          retryable: executionError.isRetryable
        });
      } else {
        setError({
          code: 'EXECUTION_START_FAILED',
          message: executionError instanceof Error ? executionError.message : 'Unknown error',
          retryable: true
        });
      }
      
      throw executionError;
    }
  }, []);

  const cancelExecution = useCallback(async () => {
    if (!execution || execution.status !== 'running') {
      return;
    }

    try {
      await toolExecutionService.cancelExecution(execution.id);
      
      setExecution(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setIsExecuting(false);
    } catch (cancelError) {
      console.error('Failed to cancel execution:', cancelError);
      
      if (cancelError instanceof ToolVaultServiceError) {
        setError({
          code: cancelError.code as any,
          message: `Failed to cancel execution: ${cancelError.message}`,
          retryable: false
        });
      }
      
      throw cancelError;
    }
  }, [execution]);

  const clearExecution = useCallback(() => {
    setExecution(null);
    setError(null);
    setResults(null);
    setProgress(null);
    setIsExecuting(false);
    setLastExecutionParams(null);
  }, []);

  const retryExecution = useCallback(async () => {
    if (!lastExecutionParams) {
      throw new Error('No previous execution to retry');
    }

    return executeTool(lastExecutionParams.toolId, lastExecutionParams.inputs);
  }, [lastExecutionParams, executeTool]);

  const getExecutionStatus = useCallback(async (executionId: string) => {
    return toolExecutionService.getExecutionStatus(executionId);
  }, []);

  return {
    // State
    execution,
    isExecuting,
    error,
    progress,
    results,
    
    // Actions
    executeTool,
    cancelExecution,
    clearExecution,
    retryExecution,
    getExecutionStatus
  };
}

export default useToolExecution;