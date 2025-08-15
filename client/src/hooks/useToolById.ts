import { useMemo } from 'react';
import { useToolVaultData } from './useToolVaultData';
import type { Tool } from '../types/index';

/**
 * Hook for fetching a specific tool by ID
 */
export function useToolById(toolId: string | undefined) {
  const { data, isLoading, isError, error, ...rest } = useToolVaultData();

  const tool = useMemo<Tool | undefined>(() => {
    if (!data?.tools || !toolId) return undefined;
    return data.tools.find(t => t.id === toolId);
  }, [data?.tools, toolId]);

  const isNotFound = !isLoading && !isError && !tool && toolId;

  return {
    tool,
    isLoading,
    isError,
    error,
    isNotFound,
    ...rest,
  };
}

/**
 * Hook for checking if a tool exists
 */
export function useToolExists(toolId: string | undefined): {
  exists: boolean;
  isLoading: boolean;
  isError: boolean;
} {
  const { tool, isLoading, isError } = useToolById(toolId);
  
  return {
    exists: !!tool,
    isLoading,
    isError,
  };
}