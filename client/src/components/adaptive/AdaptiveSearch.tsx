import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Badge,
  SwipeableDrawer,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useResponsive } from '../../theme/responsive';
import { TouchInteractions, TouchZoomPrevention } from '../mobile/TouchInteractions';
import { useKeyboardAwareScrolling } from '../../hooks/useViewportOptimization';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { 
  getUniqueCategories, 
  getUniqueTags,
  type SearchFilters,
  type SortOption,
} from '../../utils/searchUtils';
import type { Tool } from '../../types';

interface AdaptiveSearchProps {
  tools: Tool[];
  filters: SearchFilters;
  sortOption: SortOption;
  onFiltersChange: (filters: SearchFilters) => void;
  onSortChange: (sort: SortOption) => void;
  placeholder?: string;
}

/**
 * Adaptive search component that provides mobile-optimized search interface
 */
export function AdaptiveSearch({
  tools,
  filters,
  sortOption,
  onFiltersChange,
  onSortChange,
  placeholder = "Search tools...",
}: AdaptiveSearchProps) {
  const { isMobile } = useResponsive();
  
  const [searchValue, setSearchValue] = useState(filters.query || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  // Get unique values for filters
  const uniqueCategories = getUniqueCategories(tools);
  const uniqueTags = getUniqueTags(tools);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.query) {
      onFiltersChange({ ...filters, query: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  // Handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchValue('');
    onFiltersChange({ ...filters, query: '' });
  }, [filters, onFiltersChange]);

  const handleCategoryChange = useCallback((category: string) => {
    onFiltersChange({
      ...filters,
      category: category === filters.category ? undefined : category,
    });
  }, [filters, onFiltersChange]);

  const handleTagsChange = useCallback((newTags: string[]) => {
    onFiltersChange({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
  }, [filters, onFiltersChange]);

  const handleSortFieldChange = useCallback((field: SortOption['field']) => {
    onSortChange({ ...sortOption, field });
  }, [sortOption, onSortChange]);

  const handleSortDirectionToggle = useCallback(() => {
    onSortChange({
      ...sortOption,
      direction: sortOption.direction === 'asc' ? 'desc' : 'asc',
    });
  }, [sortOption, onSortChange]);

  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    onFiltersChange({ query: '' });
    onSortChange({ field: 'name', direction: 'asc' });
  }, [onFiltersChange, onSortChange]);

  // Count active filters
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length;
    return count;
  }, [filters]);

  // Mobile Filter Drawer Content
  const MobileFiltersContent = () => (
    <TouchInteractions>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Filters & Sort</Typography>
          <IconButton onClick={() => setFiltersOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />

        {/* Filters Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List>
            {/* Sort Section */}
            <ListItem>
              <ListItemIcon>
                <SortIcon />
              </ListItemIcon>
              <ListItemText primary="Sort" />
            </ListItem>
            
            <Box sx={{ px: 2, mb: 2 }}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortOption.field}
                  label="Sort by"
                  onChange={(e) => handleSortFieldChange(e.target.value as SortOption['field'])}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={handleSortDirectionToggle}
                startIcon={<SortIcon sx={{ 
                  transform: sortOption.direction === 'desc' ? 'rotate(180deg)' : 'none' 
                }} />}
              >
                {sortOption.direction === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </Box>

            <Divider />

            {/* Categories Section */}
            <ListItemButton onClick={() => setCategoriesExpanded(!categoriesExpanded)}>
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary="Categories" />
              {categoriesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            
            <Collapse in={categoriesExpanded}>
              <Box sx={{ px: 2, mb: 2 }}>
                {uniqueCategories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    variant={filters.category === category ? 'filled' : 'outlined'}
                    onClick={() => handleCategoryChange(category)}
                    sx={{ m: 0.5 }}
                    size="small"
                  />
                ))}
              </Box>
            </Collapse>

            <Divider />

            {/* Tags Section */}
            <ListItemButton onClick={() => setTagsExpanded(!tagsExpanded)}>
              <ListItemIcon>
                <TagIcon />
              </ListItemIcon>
              <ListItemText primary="Tags" />
              {tagsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            
            <Collapse in={tagsExpanded}>
              <Box sx={{ px: 2, mb: 2 }}>
                <Autocomplete
                  multiple
                  options={uniqueTags}
                  value={filters.tags || []}
                  onChange={(_, newValue) => handleTagsChange(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        size="small"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select tags"
                      placeholder="Choose tags"
                      size="small"
                    />
                  )}
                />
              </Box>
            </Collapse>
          </List>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={clearAllFilters}
            disabled={getActiveFilterCount() === 0 && !filters.query}
          >
            Clear All Filters
          </Button>
        </Box>
      </Box>
    </TouchInteractions>
  );

  // Desktop Filters
  const DesktopFilters = () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {/* Categories */}
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filters.category || ''}
          label="Category"
          onChange={(e) => handleCategoryChange(e.target.value as string)}
          size="small"
        >
          <MenuItem value="">All Categories</MenuItem>
          {uniqueCategories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Tags */}
      <Autocomplete
        multiple
        options={uniqueTags}
        value={filters.tags || []}
        onChange={(_, newValue) => handleTagsChange(newValue)}
        sx={{ minWidth: 200 }}
        size="small"
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option}
              label={option}
              size="small"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            placeholder="Select tags"
            size="small"
          />
        )}
      />

      {/* Sort */}
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Sort by</InputLabel>
        <Select
          value={sortOption.field}
          label="Sort by"
          onChange={(e) => handleSortFieldChange(e.target.value as SortOption['field'])}
          size="small"
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="category">Category</MenuItem>
        </Select>
      </FormControl>

      <IconButton
        onClick={handleSortDirectionToggle}
        title={`Sort ${sortOption.direction === 'asc' ? 'descending' : 'ascending'}`}
      >
        <SortIcon sx={{ 
          transform: sortOption.direction === 'desc' ? 'rotate(180deg)' : 'none' 
        }} />
      </IconButton>

      {(getActiveFilterCount() > 0 || filters.query) && (
        <Button variant="outlined" onClick={clearAllFilters} size="small">
          Clear Filters
        </Button>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <TouchZoomPrevention>
        <Box sx={{ width: '100%' }}>
          {/* Mobile Search Bar */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={placeholder}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchValue && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearchClear} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 3,
                },
              }}
            />
            
            <IconButton
              onClick={() => setFiltersOpen(true)}
              sx={{ 
                position: 'relative',
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <FilterListIcon />
              {getActiveFilterCount() > 0 && (
                <Badge
                  badgeContent={getActiveFilterCount()}
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                  }}
                />
              )}
            </IconButton>
          </Box>

          {/* Mobile Filter Drawer */}
          <SwipeableDrawer
            anchor="bottom"
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            onOpen={() => setFiltersOpen(true)}
            disableSwipeToOpen={false}
            PaperProps={{
              sx: { 
                maxHeight: '80vh',
                borderRadius: '16px 16px 0 0',
              }
            }}
          >
            <MobileFiltersContent />
          </SwipeableDrawer>
        </Box>
      </TouchZoomPrevention>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* Desktop Search and Filters */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Search Bar */}
        <TextField
          fullWidth
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={placeholder}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton onClick={handleSearchClear} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Filters */}
        <DesktopFilters />
      </Box>
    </Paper>
  );
}