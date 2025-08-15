import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchToolVaultIndex, refreshToolVaultIndex } from '../services/toolVaultService';

export const TOOL_VAULT_QUERY_KEY = ['toolVaultIndex'] as const;

/**
 * Hook for fetching and managing the main ToolVault index data
 */
export function useToolVaultData() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TOOL_VAULT_QUERY_KEY,
    queryFn: fetchToolVaultIndex,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const refetch = async () => {
    return query.refetch();
  };

  const refresh = async () => {
    try {
      const freshData = await refreshToolVaultIndex();
      queryClient.setQueryData(TOOL_VAULT_QUERY_KEY, freshData);
      return { data: freshData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: TOOL_VAULT_QUERY_KEY });
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch,
    refresh,
    invalidate,
    isStale: query.isStale,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}

/**
 * Hook for getting tools array with additional utilities
 */
export function useTools() {
  const { data, ...rest } = useToolVaultData();
  
  return {
    tools: data?.tools || [],
    toolsCount: data?.tools.length || 0,
    ...rest,
  };
}