/**
 * Web Worker for executing tool modules
 * 
 * This worker handles the dynamic import and execution of tool modules
 * to prevent blocking the main UI thread.
 */

export interface ToolExecutionMessage {
  type: 'execute' | 'cancel';
  data: {
    toolId: string;
    modulePath: string;
    input: any;
    executionId: string;
  };
}

export interface ToolExecutionResponse {
  type: 'success' | 'error' | 'progress';
  executionId: string;
  data?: any;
  error?: string;
  progress?: number;
}

// Keep track of ongoing executions
const activeExecutions = new Map<string, AbortController>();

// Handle messages from the main thread
self.onmessage = async function(event: MessageEvent<ToolExecutionMessage>) {
  const { type, data } = event.data;
  
  if (type === 'cancel') {
    const controller = activeExecutions.get(data.executionId);
    if (controller) {
      controller.abort();
      activeExecutions.delete(data.executionId);
    }
    return;
  }

  if (type === 'execute') {
    const { toolId, modulePath, input, executionId } = data;
    
    // Create abort controller for this execution
    const controller = new AbortController();
    activeExecutions.set(executionId, controller);
    
    try {
      // Send progress update
      postMessage({
        type: 'progress',
        executionId,
        progress: 10
      } as ToolExecutionResponse);

      // Dynamic import of the tool module
      const module = await import(/* @vite-ignore */ modulePath);
      
      if (controller.signal.aborted) {
        return;
      }

      // Send progress update
      postMessage({
        type: 'progress',
        executionId,
        progress: 30
      } as ToolExecutionResponse);

      // Validate that the module has a default export (the run function)
      if (!module.default || typeof module.default !== 'function') {
        throw new Error(`Tool module "${toolId}" does not export a default function`);
      }

      const runFunction = module.default;

      // Send progress update
      postMessage({
        type: 'progress',
        executionId,
        progress: 50
      } as ToolExecutionResponse);

      // Execute the tool
      const startTime = performance.now();
      const result = await runFunction(input);
      const endTime = performance.now();

      if (controller.signal.aborted) {
        return;
      }

      // Send progress update
      postMessage({
        type: 'progress',
        executionId,
        progress: 90
      } as ToolExecutionResponse);

      // Send success response
      postMessage({
        type: 'success',
        executionId,
        data: {
          output: result,
          executionTime: endTime - startTime,
          toolId,
          timestamp: new Date().toISOString()
        }
      } as ToolExecutionResponse);

    } catch (error) {
      if (!controller.signal.aborted) {
        // Send error response
        postMessage({
          type: 'error',
          executionId,
          error: error instanceof Error ? error.message : 'Unknown execution error'
        } as ToolExecutionResponse);
      }
    } finally {
      // Clean up
      activeExecutions.delete(executionId);
    }
  }
};