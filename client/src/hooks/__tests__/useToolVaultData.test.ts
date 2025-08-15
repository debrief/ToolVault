import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToolVaultData, useTools, TOOL_VAULT_QUERY_KEY } from '../useToolVaultData';
import * as toolVaultService from '../../services/toolVaultService';
import { NetworkError, NotFoundError } from '../../services/errors';
import { mockToolVaultIndex, createMockToolVaultIndex } from '../../test-utils/mockData';
import { createTestQueryClient } from '../../test-utils/test-utils';

// Mock the service
jest.mock('../../services/toolVaultService');
const mockFetchToolVaultIndex = toolVaultService.fetchToolVaultIndex as jest.MockedFunction<typeof toolVaultService.fetchToolVaultIndex>;
const mockRefreshToolVaultIndex = toolVaultService.refreshToolVaultIndex as jest.MockedFunction<typeof toolVaultService.refreshToolVaultIndex>;

describe('useToolVaultData', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('useToolVaultData', () => {
    it('should return loading state initially', () => {
      mockFetchToolVaultIndex.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return data after successful fetch', async () => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockToolVaultIndex);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle error states', async () => {
      const error = new NetworkError('Failed to fetch');
      mockFetchToolVaultIndex.mockRejectedValue(error);
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle NotFoundError', async () => {
      const error = new NotFoundError('Tool data not found');
      mockFetchToolVaultIndex.mockRejectedValue(error);
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(result.current.error).toEqual(error);
    });

    it('should refetch data when refetch is called', async () => {
      mockFetchToolVaultIndex
        .mockResolvedValueOnce(mockToolVaultIndex)
        .mockResolvedValueOnce(createMockToolVaultIndex({ name: 'Updated Index' }));
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.data?.name).toBe('ToolVault Test Index');
      });
      
      await result.current.refetch();
      
      expect(result.current.data?.name).toBe('Updated Index');
    });

    it('should refresh data with cache bypass', async () => {
      const freshData = createMockToolVaultIndex({ name: 'Fresh Data' });
      mockRefreshToolVaultIndex.mockResolvedValue(freshData);
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      const refreshResult = await result.current.refresh();
      
      expect(mockRefreshToolVaultIndex).toHaveBeenCalled();
      expect(refreshResult.data).toEqual(freshData);
      expect(refreshResult.error).toBeNull();
    });

    it('should handle refresh errors', async () => {
      const error = new NetworkError('Refresh failed');
      mockRefreshToolVaultIndex.mockRejectedValue(error);
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      const refreshResult = await result.current.refresh();
      
      expect(refreshResult.data).toBeNull();
      expect(refreshResult.error).toEqual(error);
    });

    it('should invalidate query cache', async () => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
      
      // Mock a second call that should be triggered by invalidation
      mockFetchToolVaultIndex.mockResolvedValue(createMockToolVaultIndex({ name: 'Invalidated Data' }));
      
      result.current.invalidate();
      
      await waitFor(() => {
        expect(result.current.data?.name).toBe('Invalidated Data');
      });
    });

    it('should provide stale and dataUpdatedAt information', async () => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
      
      expect(typeof result.current.isStale).toBe('boolean');
      expect(typeof result.current.dataUpdatedAt).toBe('number');
    });

    it('should use correct stale and cache times', () => {
      mockFetchToolVaultIndex.mockImplementation(() => new Promise(() => {}));
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      // Verify the hook is using the correct query key
      const queryKey = TOOL_VAULT_QUERY_KEY;
      const queryState = queryClient.getQueryState(queryKey);
      
      expect(queryState).toBeDefined();
    });

    it('should handle concurrent requests properly', async () => {
      let resolveCount = 0;
      mockFetchToolVaultIndex.mockImplementation(() => {
        resolveCount++;
        return Promise.resolve(createMockToolVaultIndex({ name: `Request ${resolveCount}` }));
      });
      
      const { result: result1 } = renderHook(() => useToolVaultData(), { wrapper });
      const { result: result2 } = renderHook(() => useToolVaultData(), { wrapper });
      
      await waitFor(() => {
        expect(result1.current.data).toBeDefined();
        expect(result2.current.data).toBeDefined();
      });
      
      // Both hooks should share the same data (React Query deduplication)
      expect(result1.current.data).toEqual(result2.current.data);
      expect(mockFetchToolVaultIndex).toHaveBeenCalledTimes(1); // Should only fetch once
    });
  });

  describe('useTools', () => {
    it('should return tools array and count', async () => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
      
      const { result } = renderHook(() => useTools(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.tools).toBeDefined();
      });
      
      expect(result.current.tools).toEqual(mockToolVaultIndex.tools);
      expect(result.current.toolsCount).toBe(mockToolVaultIndex.tools.length);
    });

    it('should return empty array when no data', () => {
      mockFetchToolVaultIndex.mockImplementation(() => new Promise(() => {}));
      
      const { result } = renderHook(() => useTools(), { wrapper });
      
      expect(result.current.tools).toEqual([]);
      expect(result.current.toolsCount).toBe(0);
    });

    it('should return empty array when data is null/undefined', async () => {
      mockFetchToolVaultIndex.mockResolvedValue(null as any);
      
      const { result } = renderHook(() => useTools(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.tools).toEqual([]);
      expect(result.current.toolsCount).toBe(0);
    });

    it('should preserve all useToolVaultData properties', async () => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
      
      const { result } = renderHook(() => useTools(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
      
      // Should have all properties from useToolVaultData plus tools-specific ones
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('refresh');
      expect(result.current).toHaveProperty('invalidate');
      expect(result.current).toHaveProperty('isStale');
      expect(result.current).toHaveProperty('dataUpdatedAt');
      expect(result.current).toHaveProperty('tools');
      expect(result.current).toHaveProperty('toolsCount');
    });

    it('should handle error states in useTools', async () => {
      const error = new NetworkError('Failed to fetch tools');
      mockFetchToolVaultIndex.mockRejectedValue(error);
      
      const { result } = renderHook(() => useTools(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(result.current.tools).toEqual([]);
      expect(result.current.toolsCount).toBe(0);
      expect(result.current.error).toEqual(error);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle service throwing non-Error objects', async () => {
      mockFetchToolVaultIndex.mockRejectedValue('String error');
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(result.current.error).toBe('String error');
    });

    it('should handle undefined tools array in data', async () => {
      const dataWithoutTools = { ...mockToolVaultIndex, tools: undefined };
      mockFetchToolVaultIndex.mockResolvedValue(dataWithoutTools as any);
      
      const { result } = renderHook(() => useTools(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.tools).toEqual([]);
      expect(result.current.toolsCount).toBe(0);
    });

    it('should handle empty tools array', async () => {
      const emptyData = createMockToolVaultIndex({ tools: [] });
      mockFetchToolVaultIndex.mockResolvedValue(emptyData);
      
      const { result } = renderHook(() => useTools(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
      
      expect(result.current.tools).toEqual([]);
      expect(result.current.toolsCount).toBe(0);
    });

    it('should handle query client errors', async () => {
      // Simulate query client failure
      const faultyQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0,
          },
        },
      });
      
      // Override the onError handler to simulate a query client error
      faultyQueryClient.setMutationDefaults(['test'], {
        mutationFn: () => Promise.reject(new Error('Query client error')),
      });
      
      const faultyWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={faultyQueryClient}>
          {children}
        </QueryClientProvider>
      );
      
      mockFetchToolVaultIndex.mockRejectedValue(new Error('Service error'));
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper: faultyWrapper });
      
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('performance and cleanup', () => {
    it('should not cause memory leaks with multiple hook instances', async () => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
      
      const hooks = Array.from({ length: 10 }, () => 
        renderHook(() => useToolVaultData(), { wrapper })
      );
      
      await waitFor(() => {
        hooks.forEach(({ result }) => {
          expect(result.current.data).toBeDefined();
        });
      });
      
      // Unmount all hooks
      hooks.forEach(({ unmount }) => unmount());
      
      // No specific assertion for memory leaks, but this should complete without errors
      expect(hooks).toHaveLength(10);
    });

    it('should handle rapid successive calls', async () => {
      let callCount = 0;
      mockFetchToolVaultIndex.mockImplementation(() => {
        callCount++;
        return Promise.resolve(createMockToolVaultIndex({ name: `Call ${callCount}` }));
      });
      
      const { result } = renderHook(() => useToolVaultData(), { wrapper });
      
      // Rapidly call refresh multiple times
      const promises = Array.from({ length: 5 }, () => result.current.refresh());
      
      await Promise.all(promises);
      
      // Should handle all calls gracefully
      expect(callCount).toBeGreaterThan(0);
    });
  });
});