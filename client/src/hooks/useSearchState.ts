import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FilterOptions } from '../utils/searchUtils';

export interface SearchState {
  query: string;
  filters: FilterOptions;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  page: number;
}

const DEFAULT_SEARCH_STATE: SearchState = {
  query: '',
  filters: {
    categories: [],
    tags: [],
    complexity: null,
    lastUpdated: null,
    inputTypes: [],
    outputTypes: [],
    status: null,
  },
  sortBy: 'name',
  sortDirection: 'asc',
  viewMode: 'grid',
  page: 1,
};

/**
 * Custom hook for managing search and filter state in URL parameters
 * This enables shareable URLs for filtered views
 */
export function useSearchState() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current state from URL parameters
  const searchState = useMemo((): SearchState => {
    const query = searchParams.get('q') || DEFAULT_SEARCH_STATE.query;
    const categories = searchParams.getAll('category');
    const tags = searchParams.getAll('tag');
    const inputTypes = searchParams.getAll('input');
    const outputTypes = searchParams.getAll('output');
    const complexity = searchParams.get('complexity') as FilterOptions['complexity'];
    const lastUpdated = searchParams.get('updated') as FilterOptions['lastUpdated'];
    const status = searchParams.get('status') as FilterOptions['status'];
    const sortBy = searchParams.get('sort') || DEFAULT_SEARCH_STATE.sortBy;
    const sortDirection = (searchParams.get('dir') as 'asc' | 'desc') || DEFAULT_SEARCH_STATE.sortDirection;\n    const viewMode = (searchParams.get('view') as 'grid' | 'list') || DEFAULT_SEARCH_STATE.viewMode;\n    const page = parseInt(searchParams.get('page') || '1', 10) || DEFAULT_SEARCH_STATE.page;\n\n    return {\n      query,\n      filters: {\n        categories,\n        tags,\n        complexity,\n        lastUpdated,\n        inputTypes,\n        outputTypes,\n        status,\n      },\n      sortBy,\n      sortDirection,\n      viewMode,\n      page,\n    };\n  }, [searchParams]);\n\n  // Update search state in URL\n  const updateSearchState = useCallback((updates: Partial<SearchState>) => {\n    const newParams = new URLSearchParams();\n    \n    // Merge current state with updates\n    const newState = { ...searchState, ...updates };\n    \n    // Query\n    if (newState.query) {\n      newParams.set('q', newState.query);\n    }\n    \n    // Categories\n    newState.filters.categories.forEach(category => {\n      newParams.append('category', category);\n    });\n    \n    // Tags\n    newState.filters.tags.forEach(tag => {\n      newParams.append('tag', tag);\n    });\n    \n    // Input types\n    newState.filters.inputTypes.forEach(inputType => {\n      newParams.append('input', inputType);\n    });\n    \n    // Output types\n    newState.filters.outputTypes.forEach(outputType => {\n      newParams.append('output', outputType);\n    });\n    \n    // Complexity\n    if (newState.filters.complexity) {\n      newParams.set('complexity', newState.filters.complexity);\n    }\n    \n    // Last updated\n    if (newState.filters.lastUpdated) {\n      newParams.set('updated', newState.filters.lastUpdated);\n    }\n    \n    // Status\n    if (newState.filters.status) {\n      newParams.set('status', newState.filters.status);\n    }\n    \n    // Sort\n    if (newState.sortBy !== DEFAULT_SEARCH_STATE.sortBy) {\n      newParams.set('sort', newState.sortBy);\n    }\n    \n    if (newState.sortDirection !== DEFAULT_SEARCH_STATE.sortDirection) {\n      newParams.set('dir', newState.sortDirection);\n    }\n    \n    // View mode\n    if (newState.viewMode !== DEFAULT_SEARCH_STATE.viewMode) {\n      newParams.set('view', newState.viewMode);\n    }\n    \n    // Page\n    if (newState.page !== DEFAULT_SEARCH_STATE.page) {\n      newParams.set('page', newState.page.toString());\n    }\n    \n    setSearchParams(newParams, { replace: true });\n  }, [searchState, setSearchParams]);\n\n  // Update just the query\n  const updateQuery = useCallback((query: string) => {\n    updateSearchState({ query, page: 1 }); // Reset to page 1 when searching\n  }, [updateSearchState]);\n\n  // Update just the filters\n  const updateFilters = useCallback((filters: FilterOptions) => {\n    updateSearchState({ filters, page: 1 }); // Reset to page 1 when filtering\n  }, [updateSearchState]);\n\n  // Update sort options\n  const updateSort = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {\n    updateSearchState({ sortBy, sortDirection });\n  }, [updateSearchState]);\n\n  // Update view mode\n  const updateViewMode = useCallback((viewMode: 'grid' | 'list') => {\n    updateSearchState({ viewMode });\n  }, [updateSearchState]);\n\n  // Update page\n  const updatePage = useCallback((page: number) => {\n    updateSearchState({ page });\n  }, [updateSearchState]);\n\n  // Clear all filters\n  const clearFilters = useCallback(() => {\n    updateSearchState({\n      query: '',\n      filters: DEFAULT_SEARCH_STATE.filters,\n      page: 1,\n    });\n  }, [updateSearchState]);\n\n  // Clear a specific filter\n  const clearFilter = useCallback((filterKey: string, value?: string) => {\n    const newFilters = { ...searchState.filters };\n    \n    switch (filterKey) {\n      case 'complexity':\n        newFilters.complexity = null;\n        break;\n      case 'lastUpdated':\n        newFilters.lastUpdated = null;\n        break;\n      case 'status':\n        newFilters.status = null;\n        break;\n      default:\n        // Handle array filters with optional value\n        if (filterKey.startsWith('category-') && value) {\n          newFilters.categories = newFilters.categories.filter(c => c !== value);\n        } else if (filterKey.startsWith('tag-') && value) {\n          newFilters.tags = newFilters.tags.filter(t => t !== value);\n        } else if (filterKey.startsWith('inputType-') && value) {\n          newFilters.inputTypes = newFilters.inputTypes.filter(t => t !== value);\n        } else if (filterKey.startsWith('outputType-') && value) {\n          newFilters.outputTypes = newFilters.outputTypes.filter(t => t !== value);\n        }\n        break;\n    }\n    \n    updateFilters(newFilters);\n  }, [searchState.filters, updateFilters]);\n\n  // Generate shareable URL\n  const getShareableUrl = useCallback(() => {\n    return `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;\n  }, [searchParams]);\n\n  // Check if any filters are active\n  const hasActiveFilters = useMemo(() => {\n    const { filters } = searchState;\n    return (\n      searchState.query.length > 0 ||\n      filters.categories.length > 0 ||\n      filters.tags.length > 0 ||\n      filters.inputTypes.length > 0 ||\n      filters.outputTypes.length > 0 ||\n      filters.complexity !== null ||\n      filters.lastUpdated !== null ||\n      filters.status !== null\n    );\n  }, [searchState]);\n\n  // Check if state differs from default\n  const hasNonDefaultState = useMemo(() => {\n    return (\n      searchState.query !== DEFAULT_SEARCH_STATE.query ||\n      searchState.sortBy !== DEFAULT_SEARCH_STATE.sortBy ||\n      searchState.sortDirection !== DEFAULT_SEARCH_STATE.sortDirection ||\n      searchState.viewMode !== DEFAULT_SEARCH_STATE.viewMode ||\n      searchState.page !== DEFAULT_SEARCH_STATE.page ||\n      hasActiveFilters\n    );\n  }, [searchState, hasActiveFilters]);\n\n  return {\n    // Current state\n    searchState,\n    query: searchState.query,\n    filters: searchState.filters,\n    sortBy: searchState.sortBy,\n    sortDirection: searchState.sortDirection,\n    viewMode: searchState.viewMode,\n    page: searchState.page,\n    \n    // State checkers\n    hasActiveFilters,\n    hasNonDefaultState,\n    \n    // Update functions\n    updateSearchState,\n    updateQuery,\n    updateFilters,\n    updateSort,\n    updateViewMode,\n    updatePage,\n    clearFilters,\n    clearFilter,\n    \n    // Utility functions\n    getShareableUrl,\n  };\n}\n\n/**\n * Hook for managing custom preset state in URL\n */\nexport function usePresetState() {\n  const [searchParams, setSearchParams] = useSearchParams();\n  \n  const presetId = searchParams.get('preset');\n  \n  const setPreset = useCallback((presetId: string | null) => {\n    const newParams = new URLSearchParams(searchParams);\n    \n    if (presetId) {\n      newParams.set('preset', presetId);\n    } else {\n      newParams.delete('preset');\n    }\n    \n    setSearchParams(newParams, { replace: true });\n  }, [searchParams, setSearchParams]);\n  \n  return {\n    presetId,\n    setPreset,\n  };\n}\n\nexport default useSearchState;"