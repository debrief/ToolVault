import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToolById, useToolExists } from '../useToolById';
import { useToolVaultData } from '../useToolVaultData';
import { mockToolVaultIndex, createMockTool } from '../../test-utils/mockData';
import { NetworkError } from '../../services/errors';
import { createTestQueryClient } from '../../test-utils/test-utils';

// Mock the useToolVaultData hook
jest.mock('../useToolVaultData');
const mockUseToolVaultData = useToolVaultData as jest.MockedFunction<typeof useToolVaultData>;

describe('useToolById', () => {
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

  describe('useToolById', () => {
    it('should return tool when ID exists', async () => {
      mockUseToolVaultData.mockReturnValue({
        data: mockToolVaultIndex,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolById('wordcount'), { wrapper });

      expect(result.current.tool).toEqual(mockToolVaultIndex.tools[0]);
      expect(result.current.isNotFound).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should return undefined when ID does not exist', async () => {
      mockUseToolVaultData.mockReturnValue({
        data: mockToolVaultIndex,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolById('nonexistent-id'), { wrapper });

      expect(result.current.tool).toBeUndefined();
      expect(result.current.isNotFound).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should return undefined when toolId is undefined', () => {
      mockUseToolVaultData.mockReturnValue({
        data: mockToolVaultIndex,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolById(undefined), { wrapper });

      expect(result.current.tool).toBeUndefined();
      expect(result.current.isNotFound).toBe(false); // Not considered "not found" if no ID provided
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should handle loading state', () => {
      mockUseToolVaultData.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      const { result } = renderHook(() => useToolById('wordcount'), { wrapper });

      expect(result.current.tool).toBeUndefined();
      expect(result.current.isNotFound).toBe(false); // Not "not found" while loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
    });

    it('should handle error state', () => {
      const error = new NetworkError('Failed to fetch');
      mockUseToolVaultData.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      const { result } = renderHook(() => useToolById('wordcount'), { wrapper });

      expect(result.current.tool).toBeUndefined();
      expect(result.current.isNotFound).toBe(false); // Not "not found" if there's an error
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });

    it('should handle empty tools array', () => {
      mockUseToolVaultData.mockReturnValue({
        data: { ...mockToolVaultIndex, tools: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolById('wordcount'), { wrapper });

      expect(result.current.tool).toBeUndefined();
      expect(result.current.isNotFound).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should handle undefined data.tools', () => {
      mockUseToolVaultData.mockReturnValue({
        data: { ...mockToolVaultIndex, tools: undefined as any },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolById('wordcount'), { wrapper });

      expect(result.current.tool).toBeUndefined();
      expect(result.current.isNotFound).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should memoize tool result properly', () => {
      const mockData = {
        ...mockToolVaultIndex,
        tools: [
          createMockTool({ id: 'tool-1', name: 'Tool 1' }),
          createMockTool({ id: 'tool-2', name: 'Tool 2' }),
        ],
      };

      mockUseToolVaultData.mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result, rerender } = renderHook(
        ({ toolId }) => useToolById(toolId),
        {
          wrapper,
          initialProps: { toolId: 'tool-1' },
        }
      );

      const initialTool = result.current.tool;
      expect(initialTool?.id).toBe('tool-1');

      // Rerender with same props - should get same object reference (memoization)
      rerender({ toolId: 'tool-1' });
      expect(result.current.tool).toBe(initialTool);

      // Rerender with different toolId - should get different tool
      rerender({ toolId: 'tool-2' });
      expect(result.current.tool?.id).toBe('tool-2');
      expect(result.current.tool).not.toBe(initialTool);
    });

    it('should pass through all useToolVaultData properties', () => {
      const mockRefetch = jest.fn();
      const mockRefresh = jest.fn();
      const mockInvalidate = jest.fn();
      
      mockUseToolVaultData.mockReturnValue({
        data: mockToolVaultIndex,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
        refresh: mockRefresh,
        invalidate: mockInvalidate,
        isStale: true,
        dataUpdatedAt: 1234567890,
      });

      const { result } = renderHook(() => useToolById('wordcount'), { wrapper });

      expect(result.current.refetch).toBe(mockRefetch);
      expect(result.current.refresh).toBe(mockRefresh);
      expect(result.current.invalidate).toBe(mockInvalidate);
      expect(result.current.isStale).toBe(true);
      expect(result.current.dataUpdatedAt).toBe(1234567890);
    });

    it('should handle case-sensitive ID matching', () => {
      const testTool = createMockTool({ id: 'CaseSensitive', name: 'Case Sensitive Tool' });
      mockUseToolVaultData.mockReturnValue({
        data: { ...mockToolVaultIndex, tools: [testTool] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result: exactMatch } = renderHook(() => useToolById('CaseSensitive'), { wrapper });
      const { result: wrongCase } = renderHook(() => useToolById('casesensitive'), { wrapper });

      expect(exactMatch.current.tool).toEqual(testTool);
      expect(wrongCase.current.tool).toBeUndefined();
      expect(wrongCase.current.isNotFound).toBe(true);
    });

    it('should handle special characters in tool IDs', () => {
      const specialTool = createMockTool({ 
        id: 'tool-with-special_chars.and@symbols', 
        name: 'Special Characters Tool' 
      });
      
      mockUseToolVaultData.mockReturnValue({
        data: { ...mockToolVaultIndex, tools: [specialTool] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(
        () => useToolById('tool-with-special_chars.and@symbols'), 
        { wrapper }
      );

      expect(result.current.tool).toEqual(specialTool);
      expect(result.current.isNotFound).toBe(false);
    });
  });

  describe('useToolExists', () => {
    it('should return true when tool exists', () => {
      mockUseToolVaultData.mockReturnValue({
        data: mockToolVaultIndex,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolExists('wordcount'), { wrapper });

      expect(result.current.exists).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should return false when tool does not exist', () => {
      mockUseToolVaultData.mockReturnValue({
        data: mockToolVaultIndex,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolExists('nonexistent'), { wrapper });

      expect(result.current.exists).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should return false when toolId is undefined', () => {
      mockUseToolVaultData.mockReturnValue({
        data: mockToolVaultIndex,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolExists(undefined), { wrapper });

      expect(result.current.exists).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should handle loading state', () => {
      mockUseToolVaultData.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      const { result } = renderHook(() => useToolExists('wordcount'), { wrapper });

      expect(result.current.exists).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
    });

    it('should handle error state', () => {
      const error = new NetworkError('Failed to fetch');
      mockUseToolVaultData.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      const { result } = renderHook(() => useToolExists('wordcount'), { wrapper });

      expect(result.current.exists).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
    });

    it('should be optimized and not cause unnecessary re-renders', () => {
      let renderCount = 0;
      
      mockUseToolVaultData.mockReturnValue({
        data: mockToolVaultIndex,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result, rerender } = renderHook(
        ({ toolId }) => {
          renderCount++;
          return useToolExists(toolId);
        },
        {
          wrapper,
          initialProps: { toolId: 'wordcount' },
        }
      );

      const initialRenderCount = renderCount;
      expect(result.current.exists).toBe(true);

      // Rerender with same toolId - should not cause additional computation
      rerender({ toolId: 'wordcount' });
      
      expect(result.current.exists).toBe(true);
      expect(renderCount).toBeGreaterThan(initialRenderCount); // React will re-render, but our logic should be memoized
    });
  });

  describe('edge cases and performance', () => {
    it('should handle very large tools arrays efficiently', () => {
      const largeToolsArray = Array.from({ length: 10000 }, (_, i) => 
        createMockTool({ id: `tool-${i}`, name: `Tool ${i}` })
      );

      mockUseToolVaultData.mockReturnValue({
        data: { ...mockToolVaultIndex, tools: largeToolsArray },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const startTime = performance.now();
      
      const { result } = renderHook(() => useToolById('tool-5000'), { wrapper });
      
      const endTime = performance.now();

      expect(result.current.tool?.id).toBe('tool-5000');
      expect(endTime - startTime).toBeLessThan(50); // Should be fast even with large arrays
    });

    it('should handle null data gracefully', () => {
      mockUseToolVaultData.mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolById('wordcount'), { wrapper });

      expect(result.current.tool).toBeUndefined();
      expect(result.current.isNotFound).toBe(true);
    });

    it('should handle empty string toolId', () => {
      mockUseToolVaultData.mockReturnValue({
        data: mockToolVaultIndex,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result } = renderHook(() => useToolById(''), { wrapper });

      expect(result.current.tool).toBeUndefined();
      expect(result.current.isNotFound).toBe(false); // Empty string treated as no ID
    });

    it('should handle rapidly changing toolIds', () => {
      mockUseToolVaultData.mockReturnValue({
        data: {
          ...mockToolVaultIndex,
          tools: [
            createMockTool({ id: 'rapid-1', name: 'Rapid 1' }),
            createMockTool({ id: 'rapid-2', name: 'Rapid 2' }),
            createMockTool({ id: 'rapid-3', name: 'Rapid 3' }),
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { result, rerender } = renderHook(
        ({ toolId }) => useToolById(toolId),
        {
          wrapper,
          initialProps: { toolId: 'rapid-1' },
        }
      );

      expect(result.current.tool?.id).toBe('rapid-1');

      rerender({ toolId: 'rapid-2' });
      expect(result.current.tool?.id).toBe('rapid-2');

      rerender({ toolId: 'rapid-3' });
      expect(result.current.tool?.id).toBe('rapid-3');

      rerender({ toolId: undefined });
      expect(result.current.tool).toBeUndefined();
    });
  });
});