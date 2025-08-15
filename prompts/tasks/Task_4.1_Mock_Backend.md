# APM Task Assignment: Implement Mock Backend Service

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 4, Task 4.1** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Create REST mock server providing canned responses for tool execution to enable full UI functionality without real backend infrastructure.

**Prerequisites:** Phase 3 completed - Testing infrastructure, performance optimization, error handling, and accessibility should be fully implemented.

## 2. Detailed Action Steps

1. **Set up Mock Service Infrastructure:**
   - Configure MSW (Mock Service Worker) for comprehensive API mocking:
     ```typescript
     // src/mocks/browser.ts
     import { setupWorker } from 'msw/browser';
     import { toolExecutionHandlers } from './handlers/toolExecutionHandlers';
     import { metadataHandlers } from './handlers/metadataHandlers';
     
     export const worker = setupWorker(
       ...toolExecutionHandlers,
       ...metadataHandlers
     );
     
     // Enable in development
     if (process.env.NODE_ENV === 'development') {
       worker.start({
         onUnhandledRequest: 'warn',
         quiet: false,
       });
     }
     ```
   - Create mock service directory structure:
     ```
     src/mocks/
     ├── browser.ts
     ├── server.ts (for Node.js/testing)
     ├── handlers/
     │   ├── toolExecutionHandlers.ts
     │   ├── metadataHandlers.ts
     │   └── errorHandlers.ts
     ├── data/
     │   ├── executionResults/
     │   ├── mockData.ts
     │   └── scenarios.ts
     └── utils/
         ├── responseHelpers.ts
         └── executionSimulator.ts
     ```

2. **Create Mock Tool Execution Responses:**
   - Generate realistic execution results by tool type:
     ```typescript
     // src/mocks/data/executionResults.ts
     export const mockExecutionResults = {
       'wordcount': {
         success: {
           executionId: 'exec_wordcount_123',
           status: 'completed',
           duration: 1250,
           results: {
             wordCount: 1247,
             characterCount: 7832,
             paragraphCount: 12,
             averageWordsPerSentence: 15.2,
             readingTime: '5 minutes',
             wordFrequency: [
               { word: 'analysis', count: 23 },
               { word: 'data', count: 18 },
               { word: 'tool', count: 15 },
             ],
           },
         },
         error: {
           executionId: 'exec_wordcount_err',
           status: 'failed',
           error: {
             code: 'INVALID_INPUT',
             message: 'Input text is empty or contains invalid characters',
             details: 'The provided text input must contain at least 1 character',
           },
         },
       },
       'geospatial-analysis': {
         success: {
           executionId: 'exec_geo_456',
           status: 'completed',
           duration: 3450,
           results: {
             type: 'FeatureCollection',
             features: [
               {
                 type: 'Feature',
                 geometry: {
                   type: 'Point',
                   coordinates: [-122.4194, 37.7749],
                 },
                 properties: {
                   name: 'San Francisco',
                   population: 883305,
                   area: 121.4,
                 },
               },
             ],
             metadata: {
               totalFeatures: 1,
               boundingBox: [-122.5194, 37.6749, -122.3194, 37.8749],
               projection: 'EPSG:4326',
             },
           },
         },
       },
     };
     ```
   - Include various data formats (GeoJSON, CSV data, charts data, binary files)
   - Mock execution timing with realistic delays

3. **Implement Execution State Management:**
   - Create execution status tracking system:
     ```typescript
     // src/mocks/utils/executionSimulator.ts
     export class ExecutionSimulator {
       private executions: Map<string, ExecutionState> = new Map();
       
       async startExecution(
         toolId: string, 
         inputs: Record<string, any>
       ): Promise<ExecutionResponse> {
         const executionId = `exec_${toolId}_${Date.now()}`;
         const execution: ExecutionState = {
           id: executionId,
           toolId,
           inputs,
           status: 'running',
           startTime: new Date(),
           progress: 0,
         };
         
         this.executions.set(executionId, execution);
         
         // Simulate execution with progress updates
         this.simulateProgress(executionId);
         
         return {
           executionId,
           status: 'running',
           message: 'Tool execution started successfully',
         };
       }
       
       private async simulateProgress(executionId: string) {
         const execution = this.executions.get(executionId)!;
         const duration = this.getExecutionDuration(execution.toolId);
         
         const progressInterval = setInterval(() => {
           execution.progress += Math.random() * 20;
           
           if (execution.progress >= 100) {
             clearInterval(progressInterval);
             this.completeExecution(executionId);
           }
         }, duration / 10);
       }
       
       private completeExecution(executionId: string) {
         const execution = this.executions.get(executionId)!;
         execution.status = Math.random() > 0.1 ? 'completed' : 'failed';
         execution.endTime = new Date();
         
         if (execution.status === 'completed') {
           execution.results = this.generateResults(execution.toolId, execution.inputs);
         } else {
           execution.error = this.generateError(execution.toolId);
         }
       }
     }
     ```
   - Add execution progress indicators with realistic progress curves
   - Implement cancellation capability with cleanup

4. **Wire Mock Service to Frontend:**
   - Update toolVaultService to use mock endpoints:
     ```typescript
     // src/services/toolExecutionService.ts
     export interface ToolExecutionService {
       executeToool(toolId: string, inputs: Record<string, any>): Promise<ExecutionResponse>;
       getExecutionStatus(executionId: string): Promise<ExecutionStatus>;
       cancelExecution(executionId: string): Promise<void>;
       getExecutionResults(executionId: string): Promise<ExecutionResults>;
     }
     
     class MockToolExecutionService implements ToolExecutionService {
       async executeTool(toolId: string, inputs: Record<string, any>): Promise<ExecutionResponse> {
         const response = await fetch('/api/tools/execute', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ toolId, inputs }),
         });
         
         if (!response.ok) {
           throw new ToolExecutionError(`Execution failed: ${response.statusText}`, {
             type: 'execution_failed',
             code: response.status.toString(),
             retryable: response.status >= 500,
           });
         }
         
         return response.json();
       }
       
       async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
         const response = await fetch(`/api/executions/${executionId}/status`);
         return response.json();
       }
     }
     
     export const toolExecutionService = new MockToolExecutionService();
     ```
   - Handle authentication and error responses appropriately
   - Configure development vs production service switching

## 3. Mock API Endpoints Design

**RESTful API Structure:**
```typescript
// src/mocks/handlers/toolExecutionHandlers.ts
export const toolExecutionHandlers = [
  // Start tool execution
  rest.post('/api/tools/execute', async (req, res, ctx) => {
    const { toolId, inputs } = await req.json();
    
    // Validate inputs
    const validation = validateToolInputs(toolId, inputs);
    if (!validation.isValid) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'INVALID_INPUT',
          message: 'Input validation failed',
          details: validation.errors,
        })
      );
    }
    
    const execution = await executionSimulator.startExecution(toolId, inputs);
    return res(ctx.status(202), ctx.json(execution));
  }),
  
  // Get execution status and progress
  rest.get('/api/executions/:executionId/status', (req, res, ctx) => {
    const { executionId } = req.params;
    const status = executionSimulator.getStatus(executionId);
    
    if (!status) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Execution not found' })
      );
    }
    
    return res(ctx.json(status));
  }),
  
  // Get execution results
  rest.get('/api/executions/:executionId/results', (req, res, ctx) => {
    const { executionId } = req.params;
    const results = executionSimulator.getResults(executionId);
    
    if (!results) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Results not found' })
      );
    }
    
    return res(ctx.json(results));
  }),
  
  // Cancel execution
  rest.delete('/api/executions/:executionId', (req, res, ctx) => {
    const { executionId } = req.params;
    executionSimulator.cancelExecution(executionId);
    
    return res(ctx.status(204));
  }),
];
```

## 4. Advanced Mock Scenarios

**Error Simulation:**
```typescript
// src/mocks/data/scenarios.ts
export const mockScenarios = {
  networkErrors: {
    probability: 0.05, // 5% chance of network errors
    types: ['timeout', 'connection_refused', 'dns_failure'],
  },
  executionErrors: {
    probability: 0.1, // 10% chance of execution errors
    types: [
      { code: 'INVALID_INPUT', probability: 0.4 },
      { code: 'RESOURCE_EXHAUSTED', probability: 0.3 },
      { code: 'TOOL_UNAVAILABLE', probability: 0.2 },
      { code: 'INTERNAL_ERROR', probability: 0.1 },
    ],
  },
  slowExecution: {
    probability: 0.15, // 15% chance of slow execution
    multiplier: 3, // 3x longer than normal
  },
};

// Dynamic scenario application
export function applyScenario(toolId: string, inputs: any) {
  if (Math.random() < mockScenarios.networkErrors.probability) {
    throw new NetworkError(getRandomNetworkError());
  }
  
  if (Math.random() < mockScenarios.executionErrors.probability) {
    throw new ExecutionError(getRandomExecutionError());
  }
  
  const baseDuration = getToolBaseDuration(toolId);
  const duration = Math.random() < mockScenarios.slowExecution.probability
    ? baseDuration * mockScenarios.slowExecution.multiplier
    : baseDuration;
    
  return { duration, shouldFail: false };
}
```

## 5. Testing Integration

**MSW Testing Setup:**
```typescript
// src/test-utils/mswSetup.ts
import { setupServer } from 'msw/node';
import { toolExecutionHandlers } from '../mocks/handlers/toolExecutionHandlers';

export const server = setupServer(...toolExecutionHandlers);

// Test setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test utilities
export const mockSuccessfulExecution = (toolId: string, results: any) => {
  server.use(
    rest.post('/api/tools/execute', (req, res, ctx) => {
      return res(ctx.json({ 
        executionId: `test_${toolId}`, 
        status: 'completed',
        results 
      }));
    })
  );
};
```

## 6. Performance Considerations

**Optimized Mock Responses:**
```typescript
// src/mocks/utils/responseHelpers.ts
export class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// Streaming mock responses for large datasets
export function createStreamingResponse(data: any[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      data.forEach((chunk, index) => {
        const json = JSON.stringify(chunk) + (index < data.length - 1 ? ',' : '');
        controller.enqueue(encoder.encode(json));
      });
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## 7. Expected Output & Deliverables

**Success Criteria:**
- Complete mock API covering all tool execution workflows
- Realistic execution timing and progress updates
- Comprehensive error scenario simulation
- Development/production environment switching
- Integration with existing service layer
- Performance optimized mock responses

**Deliverables:**
1. **Mock Service Infrastructure:**
   - `src/mocks/browser.ts` - MSW browser setup
   - `src/mocks/server.ts` - MSW Node.js setup
   - `src/mocks/handlers/toolExecutionHandlers.ts` - API handlers
   - `src/mocks/utils/executionSimulator.ts` - Execution simulation

2. **Mock Data and Scenarios:**
   - `src/mocks/data/executionResults.ts` - Sample results
   - `src/mocks/data/scenarios.ts` - Error scenarios
   - `src/mocks/utils/responseHelpers.ts` - Utilities

3. **Service Integration:**
   - `src/services/toolExecutionService.ts` - Execution service
   - Enhanced `src/services/toolVaultService.ts` - Integration
   - `src/types/execution.ts` - Type definitions

4. **Testing Support:**
   - `src/test-utils/mswSetup.ts` - Test configuration
   - Mock scenario utilities for testing
   - Performance testing helpers

## 8. Development vs Production Configuration

**Environment Switching:**
```typescript
// src/services/serviceFactory.ts
export function createToolExecutionService(): ToolExecutionService {
  if (process.env.NODE_ENV === 'development' || process.env.VITE_USE_MOCK_API === 'true') {
    return new MockToolExecutionService();
  } else {
    return new ProductionToolExecutionService();
  }
}

// src/main.tsx integration
if (process.env.NODE_ENV === 'development') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start();
  });
}
```

## 9. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_4_Full_UI_Mock_Execution/Task_4.1_Mock_Backend_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_Frontend_Dev)
- Task reference (Phase 4 / Task 4.1)
- Mock service architecture and API design
- Execution simulation strategies
- Error scenario implementation
- Performance optimization approaches
- Testing integration details
- Development/production configuration

Please acknowledge receipt and proceed with implementation.