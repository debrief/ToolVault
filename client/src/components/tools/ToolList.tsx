import { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Autocomplete,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Search, GridView, ViewList, Sort } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchToolVaultIndex } from '../../services/toolVaultService';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useScreenReaderAnnouncements } from '../common/LiveRegion';
import { useListNavigation } from '../../hooks/useKeyboardShortcuts';
import { KEYBOARD_KEYS, isKeyPressed } from '../../utils/focusManagement';
import { 
  filterTools, 
  sortTools, 
  getUniqueCategories, 
  getUniqueTags,
  type SearchFilters,
  type SortOption,
} from '../../utils/searchUtils';
import { ToolCard } from './ToolCard';
import { VirtualizedToolList, VirtualizedToolCard } from '../common/VirtualizedList';
import type { Tool } from '../../types/index';

interface ToolListProps {
  onViewDetails: (tool: Tool) => void;
}

export const ToolList = memo<ToolListProps>(({ onViewDetails }: ToolListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'name', direction: 'asc' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [useVirtualization, setUseVirtualization] = useState(false);
  
  const toolsGridRef = useRef<HTMLElement>(null);
  const { announceSearch, announceFilter, announceSortChange } = useScreenReaderAnnouncements();

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const previousResultCount = useRef<number>(0);

  const { data: toolVaultData, isLoading, error } = useQuery({
    queryKey: ['toolVaultIndex'],
    queryFn: fetchToolVaultIndex,
  });

  const tools = toolVaultData?.tools || [];
  
  // Memoize expensive computations
  const uniqueCategories = useMemo(() => getUniqueCategories(tools), [tools]);
  const uniqueTags = useMemo(() => getUniqueTags(tools), [tools]);

  // Memoize filters object to prevent unnecessary recalculations
  const filters = useMemo((): SearchFilters => ({
    query: debouncedSearchQuery,
    category: selectedCategory || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  }), [debouncedSearchQuery, selectedCategory, selectedTags]);

  const filteredAndSortedTools = useMemo(() => {
    const filtered = filterTools(tools, filters);
    return sortTools(filtered, sortOption);
  }, [tools, filters, sortOption]);
  
  // Use list navigation hook for keyboard support
  useListNavigation(filteredAndSortedTools, onViewDetails, toolsGridRef);

  // Announce search and filter results to screen readers
  useEffect(() => {
    const currentCount = filteredAndSortedTools.length;
    
    if (debouncedSearchQuery && currentCount !== previousResultCount.current) {
      announceSearch(debouncedSearchQuery, currentCount);
    } else if (!debouncedSearchQuery && selectedCategory && currentCount !== previousResultCount.current) {
      announceFilter('category', selectedCategory, currentCount);
    } else if (!debouncedSearchQuery && selectedTags.length > 0 && currentCount !== previousResultCount.current) {
      announceFilter('tags', selectedTags.join(', '), currentCount);
    }
    
    previousResultCount.current = currentCount;
  }, [filteredAndSortedTools.length, debouncedSearchQuery, selectedCategory, selectedTags, announceSearch, announceFilter]);
  
  // Memoize all event handlers to prevent child re-renders
  const handleSortChange = useCallback(() => {
    setSortOption(prev => {
      const newDirection = prev.direction === 'asc' ? 'desc' : 'asc';
      announceSortChange(prev.field, newDirection);
      return {
        ...prev,
        direction: newDirection,
      };
    });
  }, [announceSortChange]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);
  
  // Enhanced search with keyboard shortcuts
  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isKeyPressed(event.nativeEvent, KEYBOARD_KEYS.ESCAPE)) {
      setSearchQuery('');
      event.currentTarget.blur();
    }
  }, []);

  const handleCategoryChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCategory(event.target.value as string);
  }, []);

  const handleTagsChange = useCallback((event: any, newValue: string[]) => {
    setSelectedTags(newValue);
  }, []);

  const handleSortFieldChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
    const newField = event.target.value as SortOption['field'];
    setSortOption(prev => {
      announceSortChange(newField, prev.direction);
      return { ...prev, field: newField };
    });
  }, [announceSortChange]);

  const handleGridViewClick = useCallback(() => {
    setViewMode('grid');
  }, []);

  const handleListViewClick = useCallback(() => {
    setViewMode('list');
  }, []);

  const handleVirtualizationToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUseVirtualization(event.target.checked);
  }, []);

  // Memoize the virtualized tool card renderer
  const renderVirtualizedToolCard = useCallback((props: any) => (
    <VirtualizedToolCard {...props} onClick={() => onViewDetails(props.item)} />
  ), [onViewDetails]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading tools...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Error loading tools: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Search tools"
            placeholder="Enter tool name, description, or category..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            data-testid="search-input"
            aria-label="Search analysis tools"
            aria-describedby="search-help"
          />
          <Typography 
            id="search-help" 
            variant="caption" 
            color="text.secondary" 
            sx={{ mt: 0.5, display: 'block' }}
          >
            Use Ctrl+K or Cmd+K to quickly focus search. Press Escape to clear.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                labelId="category-filter-label"
                onChange={handleCategoryChange}
                data-testid="category-filter"
                aria-label="Filter tools by category"
                aria-describedby="category-help"
              >
                <MenuItem value="" aria-label="Show all categories">All Categories</MenuItem>
                {uniqueCategories.map((category) => (
                  <MenuItem key={category} value={category} aria-label={`Filter by ${category}`}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={uniqueTags}
              value={selectedTags}
              onChange={handleTagsChange}
              sx={{ minWidth: 200, flexGrow: 1 }}
              aria-label="Filter by tags"
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    {...getTagProps({ index })} 
                    key={option} 
                    label={option} 
                    size="small"
                    aria-label={`Remove ${option} filter`}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Tags" 
                  placeholder="Select tags to filter tools" 
                  data-testid="tags-filter" 
                  aria-label="Filter tools by tags"
                  aria-describedby="tags-help"
                />
              )}
            />

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="sort-filter-label">Sort by</InputLabel>
              <Select
                value={sortOption.field}
                label="Sort by"
                labelId="sort-filter-label"
                onChange={handleSortFieldChange}
                aria-label="Sort tools by field"
              >
                <MenuItem value="name" aria-label="Sort by tool name">Name</MenuItem>
                <MenuItem value="category" aria-label="Sort by tool category">Category</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title={`Sort ${sortOption.direction === 'asc' ? 'descending' : 'ascending'}`}>
              <IconButton 
                onClick={handleSortChange}
                aria-label={`Sort ${sortOption.direction === 'asc' ? 'descending' : 'ascending'}`}
              >
                <Sort sx={{ transform: sortOption.direction === 'desc' ? 'rotate(180deg)' : 'none' }} />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useVirtualization}
                    onChange={handleVirtualizationToggle}
                    size="small"
                  />
                }
                label="Virtualization"
                sx={{ mr: 2 }}
              />
              
              <Tooltip title="Grid view">
                <IconButton 
                  onClick={handleGridViewClick}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <GridView />
                </IconButton>
              </Tooltip>
              <Tooltip title="List view">
                <IconButton 
                  onClick={handleListViewClick}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Results Summary */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mb: 2 }} 
        data-testid="results-summary"
        role="status"
        aria-live="polite"
        aria-label="Search results count"
      >
        Showing {filteredAndSortedTools.length} of {tools.length} tools
        {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
        {selectedCategory && ` in category "${selectedCategory}"`}
        {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
      </Typography>

      {/* Tools Grid/List */}
      {filteredAndSortedTools.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }} data-testid="no-results">
          <Typography variant="h6" color="text.secondary">
            No tools match your search criteria
          </Typography>
        </Box>
      ) : useVirtualization && filteredAndSortedTools.length > 50 ? (
        <VirtualizedToolList
          tools={filteredAndSortedTools}
          renderToolCard={renderVirtualizedToolCard}
          onToolClick={onViewDetails}
          cardHeight={viewMode === 'grid' ? 220 : 120}
          listHeight={600}
          data-testid="virtualized-tools-list"
        />
      ) : (
        <Box 
          ref={toolsGridRef}
          component="section"
          role="grid"
          aria-label={`Tools in ${viewMode} view`}
          sx={{ 
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' 
              ? 'repeat(auto-fill, minmax(300px, 1fr))' 
              : '1fr',
            gap: 3,
          }}
          data-testid="tools-grid"
        >
          {filteredAndSortedTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onViewDetails={onViewDetails}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          ))}
        </Box>
      )}
    </Box>
  );
});

ToolList.displayName = 'ToolList';