# APM Task Assignment: Implement Data Service Layer

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 2, Task 2.1** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Create service layer for fetching and managing index.json data with React Query integration.

**Prerequisites:** Phase 1 tasks completed successfully. The React TypeScript project should have MUI configured, testing infrastructure set up, and TypeScript interfaces generated from the schema.

## 2. Detailed Action Steps

1. **Create data fetching service:**
   - Create `src/services/toolVaultService.ts` with the following functions:
     ```typescript
     export async function fetchToolVaultIndex(): Promise<ToolVaultIndex> {
       // Fetch from /data/index.json endpoint
       // Add error handling for network failures
       // Implement retry logic with exponential backoff
     }
     ```
   - Add proper error handling for network failures (404, 500, timeout)
   - Implement retry logic with exponential backoff using a utility like `async-retry`:
     ```bash
     pnpm add async-retry
     pnpm add -D @types/async-retry
     ```
   - Use the `parseToolVaultIndex` validator from `utils/validators.ts` to ensure type safety
   - Create custom error classes for different failure types (NetworkError, ValidationError, etc.)

2. **Install and configure React Query:**
   - Install React Query (TanStack Query):
     ```bash
     pnpm add @tanstack/react-query
     ```
   - Create `src/contexts/QueryClientProvider.tsx`:
     ```typescript
     import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
     import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
     ```
   - Configure QueryClient with optimal settings:
     - Default staleTime: 5 minutes
     - Default cacheTime: 10 minutes
     - Retry failed requests 3 times
     - Enable devtools in development
   - Update `src/main.tsx` to wrap the app with QueryClientProvider

3. **Create React hooks for data access:**
   - Create `src/hooks/useToolVaultData.ts`:
     ```typescript
     export function useToolVaultData() {
       return useQuery({
         queryKey: ['toolVaultIndex'],
         queryFn: fetchToolVaultIndex,
         // Add loading and error states
         // Include data transformation if needed
       });
     }
     ```
   - Create `src/hooks/useToolById.ts`:
     ```typescript
     export function useToolById(toolId: string) {
       // Derived from useToolVaultData
       // Return specific tool by ID
       // Handle case when tool is not found
     }
     ```
   - Add proper TypeScript typing for all hooks
   - Include JSDoc comments explaining hook usage

4. **Implement caching and data management:**
   - Configure React Query cache invalidation strategies
   - Add `refetch` functionality for manual data refresh
   - Implement optimistic updates support (for future use)
   - Create cache utilities in `src/utils/cache.ts` if needed
   - Add query invalidation patterns for data updates

## 3. Expected Output & Deliverables

**Success Criteria:**
- Data service successfully fetches and validates index.json
- React Query properly integrated with QueryClient configuration
- Custom hooks provide clean data access API
- Error handling covers all failure scenarios
- Type safety maintained throughout the service layer

**Deliverables:**
1. `services/toolVaultService.ts` with fetch functions and error handling
2. `contexts/QueryClientProvider.tsx` with QueryClient setup
3. `hooks/useToolVaultData.ts` and `hooks/useToolById.ts` 
4. Updated `main.tsx` with QueryClientProvider
5. Custom error classes and utilities
6. Comprehensive tests for all service functions

## 4. Testing Requirements

Create tests for:
- **Service Layer Tests** (`services/toolVaultService.test.ts`):
  - Test successful data fetching
  - Test network error handling
  - Test data validation failures
  - Test retry logic behavior
  - Mock fetch responses using MSW

- **Hook Tests** (`hooks/useToolVaultData.test.ts`):
  - Test loading states
  - Test successful data loading
  - Test error states
  - Test data transformation
  - Use React Testing Library's `renderHook`

- **Integration Tests**:
  - Test complete data flow from service to components
  - Verify React Query cache behavior
  - Test query invalidation

## 5. Implementation Notes

**Error Handling Strategy:**
```typescript
export class ToolVaultError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'ToolVaultError';
  }
}

export class NetworkError extends ToolVaultError {
  constructor(message: string, public status?: number) {
    super(message, 'NETWORK_ERROR', { status });
    this.name = 'NetworkError';
  }
}
```

**Retry Configuration:**
- Use exponential backoff: 1s, 2s, 4s delays
- Only retry on 5xx errors and network failures
- Don't retry on 4xx client errors

**React Query Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

## 6. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_2_Core_UI_Implementation/Task_2.1_Data_Service_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_Frontend_Dev)
- Task reference (Phase 2 / Task 2.1)
- Summary of service architecture implemented
- React Query configuration choices
- Error handling strategy
- Test coverage achieved
- Any performance considerations

## 7. Clarification Instruction

If any part of this task is unclear, please ask before proceeding. Key areas:
- React Query version preferences
- Specific error handling requirements
- Cache invalidation strategies
- Testing approach preferences

Please acknowledge receipt and proceed with implementation.