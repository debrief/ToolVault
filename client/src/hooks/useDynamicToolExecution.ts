/**
 * Hook for dynamic tool execution using real JavaScript/TypeScript modules
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { dynamicToolExecutionService, type ExecutionProgress } from '../services/dynamicToolExecutionService';
import { ToolValidationError, ToolExecutionError, type ToolExecutionResult } from '../tools/types';
import type { Tool } from '../types';

export interface DynamicExecutionState {
  executionId: string | null;
  isExecuting: boolean;
  progress: number;
  status: 'idle' | 'initializing' | 'loading' | 'executing' | 'completed' | 'error' | 'cancelled';
  results: ToolExecutionResult | null;
  error: string | null;
  executionTime?: number;
  startTime?: number;
}

export interface DynamicExecutionActions {
  executeTool: (tool: Tool, input: Record<string, any>) => Promise<ToolExecutionResult>;
  cancelExecution: () => void;
  clearExecution: () => void;
  getExecutionProgress: () => ExecutionProgress | null;
}

export interface UseDynamicToolExecutionReturn extends DynamicExecutionState, DynamicExecutionActions {}

const INITIAL_STATE: DynamicExecutionState = {
  executionId: null,
  isExecuting: false,
  progress: 0,
  status: 'idle',
  results: null,
  error: null,
};

export function useDynamicToolExecution(): UseDynamicToolExecutionReturn {
  const [state, setState] = useState<DynamicExecutionState>(INITIAL_STATE);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start progress monitoring when execution begins
  useEffect(() => {
    if (state.isExecuting && state.executionId) {
      progressIntervalRef.current = setInterval(() => {
        const progress = dynamicToolExecutionService.getExecutionProgress(state.executionId!);
        if (progress) {
          setState(prev => ({
            ...prev,
            progress: progress.progress,
            status: progress.status,
          }));
        }
      }, 100); // Update every 100ms for smooth progress

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };
    }
  }, [state.isExecuting, state.executionId]);

  const executeTool = useCallback(async (tool: Tool, input: Record<string, any>): Promise<ToolExecutionResult> => {
    // Clear previous state
    setState(prev => ({
      ...INITIAL_STATE,
      isExecuting: true,
      status: 'initializing',
      startTime: Date.now(),
    }));

    try {
      // Execute the tool
      const result = await dynamicToolExecutionService.executeTool(tool, input, {
        validateInput: true,
        validateOutput: true,
        timeout: 30000, // 30 seconds
      });

      // Update state with success
      setState(prev => ({
        ...prev,
        isExecuting: false,
        status: 'completed',
        progress: 100,
        results: result,
        executionTime: result.executionTime,
      }));

      return result;

    } catch (error) {
      // Update state with error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isExecuting: false,
        status: 'error',
        error: errorMessage,
      }));

      throw error;
    }
  }, []);

  const cancelExecution = useCallback(() => {
    if (state.executionId && state.isExecuting) {
      dynamicToolExecutionService.cancelExecution(state.executionId);
      setState(prev => ({
        ...prev,
        isExecuting: false,
        status: 'cancelled',
      }));
    }
  }, [state.executionId, state.isExecuting]);

  const clearExecution = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setState(INITIAL_STATE);
  }, []);

  const getExecutionProgress = useCallback((): ExecutionProgress | null => {
    if (!state.executionId) return null;
    return dynamicToolExecutionService.getExecutionProgress(state.executionId);
  }, [state.executionId]);

  return {
    // State
    executionId: state.executionId,
    isExecuting: state.isExecuting,
    progress: state.progress,
    status: state.status,
    results: state.results,
    error: state.error,
    executionTime: state.executionTime,
    startTime: state.startTime,

    // Actions
    executeTool,
    cancelExecution,
    clearExecution,
    getExecutionProgress,
  };
}

export default useDynamicToolExecution;