import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Grid,
  CircularProgress,
  Alert,
  Fab,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Tune as TuneIcon,
  Sort as SortIcon,
  GridView,
  ViewList,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchToolVaultIndex } from '../../services/toolVaultService';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useScreenReaderAnnouncements } from '../common/LiveRegion';
import { useOptimizedSearch } from '../../hooks/useOptimizedSearch';
import { useSearchState } from '../../hooks/useSearchState';
import { 
  createMockMetadata,
  applyAdvancedFilters,
  sortToolsAdvanced,
  getUniqueCategories,
  getUniqueTags,
  getUniqueInputTypes,
  getUniqueOutputTypes,
  type FilterOptions,
  type SortOption,
} from '../../utils/searchUtils';
import { SearchWithSuggestions } from './SearchWithSuggestions';
import { AdvancedFilters } from './AdvancedFilters';
import { FilterSummary } from './FilterSummary';
import { FilterPresets } from './FilterPresets';
import { ToolCard } from './ToolCard';
import { VirtualizedToolList, VirtualizedToolCard } from '../common/VirtualizedList';
import type { Tool } from '../../types/index';

interface EnhancedToolListProps {
  onViewDetails: (tool: Tool) => void;
}

export const EnhancedToolList: React.FC<EnhancedToolListProps> = ({ onViewDetails }) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [presetsExpanded, setPresetsExpanded] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  
  const toolsGridRef = useRef<HTMLElement>(null);
  const { announceSearch, announceFilter } = useScreenReaderAnnouncements();

  // Search state management
  const {
    query,
    filters,
    sortBy,
    sortDirection,
    viewMode,
    updateQuery,
    updateFilters,
    updateSort,
    updateViewMode,
    clearFilters,
    clearFilter,
    getShareableUrl,
    hasActiveFilters,
  } = useSearchState();

  // Enhanced search
  const {
    search: performSearch,
    buildIndex,
    isIndexing,
    isIndexBuilt,
    isSearching,
    indexingProgress,
    searchError,
    performanceMetrics,
    fallbackSearch,
  } = useOptimizedSearch();

  const debouncedQuery = useDebouncedValue(query, 300);

  // Fetch tools data
  const { data: toolVaultData, isLoading, error } = useQuery({
    queryKey: ['toolVaultIndex'],
    queryFn: fetchToolVaultIndex,
  });

  const tools = toolVaultData?.tools || [];
  const metadata = useMemo(() => createMockMetadata(tools), [tools]);

  // Build search index when tools load
  useEffect(() => {
    if (tools.length > 0 && !isIndexBuilt && !isIndexing) {
      buildIndex(tools, metadata);
    }
  }, [tools, metadata, isIndexBuilt, isIndexing, buildIndex]);

  // Available filter options
  const availableOptions = useMemo(() => ({
    categories: getUniqueCategories(tools),
    tags: getUniqueTags(tools),
    inputTypes: getUniqueInputTypes(tools),
    outputTypes: getUniqueOutputTypes(tools),
    complexityLevels: [
      { value: 'beginner', label: 'Beginner', count: 0 },
      { value: 'intermediate', label: 'Intermediate', count: 0 },
      { value: 'advanced', label: 'Advanced', count: 0 },
    ],
    statusOptions: [
      { value: 'new', label: 'New', count: 0 },
      { value: 'updated', label: 'Updated', count: 0 },
      { value: 'stable', label: 'Stable', count: 0 },
      { value: 'deprecated', label: 'Deprecated', count: 0 },
    ],
  }), [tools]);

  // Perform search and filtering
  const { searchResults, filteredAndSortedTools } = useMemo(() => {
    let searchResults: any[] = [];
    let processedTools = tools;

    // Apply search if query exists
    if (debouncedQuery && isIndexBuilt) {
      // Use enhanced search with highlighting
      performSearch(debouncedQuery, {
        maxResults: 100,
        highlightMatches: true,
        fuzzy: true,
      }).then(results => {
        searchResults = results;
      });
      
      // For now, use fallback until search promise resolves
      if (searchResults.length === 0) {
        processedTools = fallbackSearch(debouncedQuery, tools);
      } else {
        processedTools = searchResults.map(result => result.item);
      }
    } else if (debouncedQuery) {
      // Fallback search
      processedTools = fallbackSearch(debouncedQuery, tools);
    }

    // Apply filters
    processedTools = applyAdvancedFilters(processedTools, filters, metadata);

    // Apply sorting
    const sortOption: SortOption = { field: sortBy as any, direction: sortDirection };
    processedTools = sortToolsAdvanced(processedTools, sortOption, metadata);

    return { searchResults, filteredAndSortedTools: processedTools };
  }, [tools, debouncedQuery, filters, sortBy, sortDirection, metadata, isIndexBuilt, performSearch, fallbackSearch]);

  // Event handlers
  const handleSearch = useCallback((searchQuery: string) => {
    updateQuery(searchQuery);
    announceSearch(searchQuery, filteredAndSortedTools.length);
  }, [updateQuery, announceSearch, filteredAndSortedTools.length]);

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    updateFilters(newFilters);
    announceFilter('multiple', 'filters updated', filteredAndSortedTools.length);
  }, [updateFilters, announceFilter, filteredAndSortedTools.length]);

  const handleSortMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  }, []);

  const handleSortMenuClose = useCallback(() => {
    setSortMenuAnchor(null);
  }, []);

  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    updateSort(field, direction);
    handleSortMenuClose();
  }, [updateSort, handleSortMenuClose]);

  const handleShare = useCallback(async () => {
    const url = getShareableUrl();
    try {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
    } catch (error) {
      console.warn('Failed to copy URL to clipboard:', error);
      // Fallback: open URL in new tab
      window.open(url, '_blank');
    }
  }, [getShareableUrl]);

  const handleSaveCustomPreset = useCallback((preset: any) => {
    const newPreset = {
      ...preset,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };
    setCustomPresets(prev => [...prev, newPreset]);
  }, []);

  const handleDeleteCustomPreset = useCallback((presetId: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== presetId));
  }, []);

  const renderVirtualizedToolCard = useCallback((props: any) => (
    <VirtualizedToolCard 
      {...props} 
      onClick={() => onViewDetails(props.item)}
      metadata={metadata.get(props.item.id)}
      showBadges={true}
    />
  ), [onViewDetails, metadata]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading tools...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading tools: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <SearchWithSuggestions
          onSearch={handleSearch}
          tools={tools}
          metadata={metadata}
          placeholder="Search tools, categories, or tags..."
        />
      </Paper>

      {/* Filter Presets */}
      <FilterPresets
        onApplyPreset={handleFiltersChange}
        currentFilters={hasActiveFilters ? filters : undefined}
        customPresets={customPresets}
        onSaveCustomPreset={handleSaveCustomPreset}
        onDeleteCustomPreset={handleDeleteCustomPreset}
        expanded={presetsExpanded}
        onExpandedChange={setPresetsExpanded}
      />

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableOptions={availableOptions}
        isExpanded={filtersExpanded}
        onExpandedChange={setFiltersExpanded}
      />

      {/* Filter Summary */}
      <FilterSummary
        filters={filters}
        onClearFilter={clearFilter}
        onClearAll={clearFilters}
        resultCount={filteredAndSortedTools.length}
        totalCount={tools.length}
      />

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredAndSortedTools.length} of {tools.length} tools
            </Typography>
            
            {isIndexing && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Indexing... {Math.round(indexingProgress)}%
                </Typography>
              </Box>
            )}
            
            {performanceMetrics.lastSearchTime && (
              <Typography variant="caption" color="text.secondary">
                Search: {performanceMetrics.lastSearchTime.toFixed(1)}ms
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useVirtualization}
                  onChange={(e) => setUseVirtualization(e.target.checked)}
                  size="small"
                />
              }
              label="Virtualization"
              sx={{ mr: 2 }}
            />

            <Tooltip title="Sort options">
              <IconButton onClick={handleSortMenuOpen}>
                <SortIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Grid view">
              <IconButton 
                onClick={() => updateViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <GridView />
              </IconButton>
            </Tooltip>

            <Tooltip title="List view">
              <IconButton 
                onClick={() => updateViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share filtered view">
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Search Error */}
      {searchError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {searchError}
        </Alert>
      )}

      {/* Tools Grid/List */}
      {filteredAndSortedTools.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tools match your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search terms or filters
          </Typography>
          {hasActiveFilters && (
            <Button variant="outlined" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </Box>
      ) : useVirtualization && filteredAndSortedTools.length > 50 ? (
        <VirtualizedToolList
          tools={filteredAndSortedTools}
          renderToolCard={renderVirtualizedToolCard}
          onToolClick={onViewDetails}
          cardHeight={viewMode === 'grid' ? 280 : 140}
          listHeight={600}
          metadata={metadata}
        />
      ) : (
        <Grid 
          container 
          spacing={3}
          ref={toolsGridRef}
        >
          {filteredAndSortedTools.map((tool) => (
            <Grid 
              item 
              xs={12} 
              sm={viewMode === 'list' ? 12 : 6} 
              md={viewMode === 'list' ? 12 : 4} 
              lg={viewMode === 'list' ? 12 : 3}
              key={tool.id}
            >
              <ToolCard
                tool={tool}
                onViewDetails={onViewDetails}
                variant={viewMode === 'list' ? 'compact' : 'default'}
                metadata={metadata.get(tool.id)}
                searchMatches={searchResults.find(r => r.item.id === tool.id)?.matches}
                showBadges={true}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={handleSortMenuClose}
      >
        <MenuItem onClick={() => handleSortChange('name', 'asc')}>
          Name (A-Z)
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('name', 'desc')}>
          Name (Z-A)
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('category', 'asc')}>
          Category (A-Z)
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('updated', 'desc')}>
          Recently Updated
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('popularity', 'desc')}>
          Most Popular
        </MenuItem>
      </Menu>

      {/* Floating Action Button for Quick Filters */}
      <Fab
        color="primary"
        aria-label="Quick filters"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setFiltersExpanded(!filtersExpanded)}
      >
        <TuneIcon />
      </Fab>
    </Box>
  );
};

export default EnhancedToolList;