import React from 'react';
import type { Tool } from './index';

// Enhanced search and filtering types
export interface SearchResult<T = Tool> {
  item: T;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: string;
  value: string;
  indices: [number, number][];
}

export interface SearchOptions {
  query: string;
  fields: SearchField[];
  fuzzy: boolean;
  highlightMatches: boolean;
  maxResults: number;
}

export interface SearchField {
  name: string;
  weight: number;
}

export interface FilterOptions {
  categories: string[];
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced' | null;
  lastUpdated: 'week' | 'month' | 'year' | null;
  inputTypes: string[];
  outputTypes: string[];
  status: 'new' | 'updated' | 'stable' | 'deprecated' | null;
}

export interface SortOption {
  field: 'name' | 'category' | 'updated' | 'popularity' | 'relevance';
  direction: 'asc' | 'desc';
}

export interface ToolMetadata {
  created?: string;
  updated?: string;
  status?: 'new' | 'beta' | 'stable' | 'deprecated';
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  usage?: {
    executions: number;
    lastUsed?: string;
  };
}

export interface BadgeConfig {
  type: 'new' | 'updated' | 'popular' | 'beta' | 'stable' | 'deprecated' | 'beginner' | 'intermediate' | 'advanced';
  label: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  icon?: React.ReactNode;
  tooltip?: string;
  condition: (tool: Tool, metadata?: ToolMetadata) => boolean;
  priority: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  icon: React.ReactNode;
  filters: FilterOptions;
  isCustom?: boolean;
  tags?: string[];
}

export interface SearchSuggestion {
  type: 'tool' | 'category' | 'tag' | 'history' | 'popular';
  value: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  count?: number;
}

export interface SearchState {
  query: string;
  filters: FilterOptions;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  page: number;
}

export interface ActiveFilter {
  key: string;
  type: 'category' | 'tag' | 'complexity' | 'lastUpdated' | 'inputType' | 'outputType' | 'status';
  label: string;
  value: string;
  icon: React.ReactNode;
}

export interface AvailableFilterOptions {
  categories: Array<{ id: string; name: string; count: number }>;
  tags: Array<{ id: string; name: string; count: number }>;
  inputTypes: string[];
  outputTypes: string[];
  complexityLevels: Array<{ value: string; label: string; count: number }>;
  statusOptions: Array<{ value: string; label: string; count: number }>;
}

export interface SearchPerformanceMetrics {
  indexBuildTime?: number;
  lastSearchTime?: number;
  toolsPerSecond?: number;
  averageTimePerTool?: number;
  indexedToolCount?: number;
}

// Worker message types
export interface IndexWorkerMessage {
  type: 'BUILD_INDEX' | 'SEARCH' | 'ADD_TOOL' | 'REMOVE_TOOL' | 'UPDATE_METADATA';
  payload: any;
  id?: string;
}

export interface IndexWorkerResponse {
  type: 'INDEX_BUILT' | 'SEARCH_RESULTS' | 'TOOL_ADDED' | 'TOOL_REMOVED' | 'METADATA_UPDATED' | 'ERROR';
  payload: any;
  id?: string;
}

// Badge statistics for analytics
export interface BadgeStatistics {
  total: number;
  new: number;
  updated: number;
  popular: number;
  beta: number;
  stable: number;
  deprecated: number;
  beginner: number;
  intermediate: number;
  advanced: number;
}

// Enhanced Tool List props
export interface EnhancedToolListProps {
  onViewDetails: (tool: Tool) => void;
  initialFilters?: FilterOptions;
  enabledFeatures?: {
    advancedSearch?: boolean;
    filters?: boolean;
    presets?: boolean;
    badges?: boolean;
    virtualization?: boolean;
    sharing?: boolean;
  };
}

// Filter section for advanced filters
export interface FilterSection {
  title: string;
  children: React.ReactNode;
}

// Search with suggestions props
export interface SearchWithSuggestionsProps {
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  tools: Tool[];
  metadata?: Map<string, ToolMetadata>;
  placeholder?: string;
  maxSuggestions?: number;
  showSearchHistory?: boolean;
  searchHistory?: string[];
  onSearchHistoryUpdate?: (history: string[]) => void;
}

// Tool badges props
export interface ToolBadgesProps {
  tool: Tool;
  metadata?: ToolMetadata;
  maxBadges?: number;
  size?: 'small' | 'medium';
  showTooltips?: boolean;
  variant?: 'filled' | 'outlined';
}

// Advanced filters props
export interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableOptions: AvailableFilterOptions;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

// Filter summary props
export interface FilterSummaryProps {
  filters: FilterOptions;
  onClearFilter: (filterKey: string, value?: string) => void;
  onClearAll: () => void;
  resultCount: number;
  totalCount: number;
  compact?: boolean;
}

// Filter presets props
export interface FilterPresetsProps {
  onApplyPreset: (filters: FilterOptions) => void;
  currentFilters?: FilterOptions;
  customPresets?: FilterPreset[];
  onSaveCustomPreset?: (preset: Omit<FilterPreset, 'id' | 'isCustom'>) => void;
  onDeleteCustomPreset?: (presetId: string) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

// Enhanced tool card props
export interface EnhancedToolCardProps {
  tool: Tool;
  onViewDetails: (tool: Tool) => void;
  elevation?: number;
  variant?: 'default' | 'compact';
  metadata?: ToolMetadata;
  searchMatches?: SearchMatch[];
  showBadges?: boolean;
}

// Search state hook return type
export interface UseSearchStateReturn {
  // Current state
  searchState: SearchState;
  query: string;
  filters: FilterOptions;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  page: number;
  
  // State checkers
  hasActiveFilters: boolean;
  hasNonDefaultState: boolean;
  
  // Update functions
  updateSearchState: (updates: Partial<SearchState>) => void;
  updateQuery: (query: string) => void;
  updateFilters: (filters: FilterOptions) => void;
  updateSort: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  updateViewMode: (viewMode: 'grid' | 'list') => void;
  updatePage: (page: number) => void;
  clearFilters: () => void;
  clearFilter: (filterKey: string, value?: string) => void;
  
  // Utility functions
  getShareableUrl: () => string;
}

// Optimized search hook return type
export interface UseOptimizedSearchReturn {
  // Search functionality
  search: (query: string, options?: Partial<SearchOptions>) => Promise<SearchResult<Tool>[]>;
  
  // Index management
  buildIndex: (tools: Tool[], metadata?: Map<string, ToolMetadata>) => Promise<void>;
  addTool: (tool: Tool, metadata?: ToolMetadata) => Promise<void>;
  removeTool: (toolId: string) => Promise<void>;
  updateMetadata: (toolId: string, metadata: ToolMetadata) => Promise<void>;
  
  // State
  isIndexing: boolean;
  isIndexBuilt: boolean;
  isSearching: boolean;
  indexingProgress: number;
  searchError: string | null;
  
  // Performance metrics
  performanceMetrics: SearchPerformanceMetrics;
  
  // Fallback search (for when worker is not available)
  fallbackSearch: (query: string, tools: Tool[]) => Tool[];
}