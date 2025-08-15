import { useState, useMemo } from 'react';
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
} from '@mui/material';
import { Search, GridView, ViewList, Sort } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchToolVaultIndex } from '../../services/toolVaultService';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { 
  filterTools, 
  sortTools, 
  getUniqueCategories, 
  getUniqueTags,
  type SearchFilters,
  type SortOption,
} from '../../utils/searchUtils';
import { ToolCard } from './ToolCard';
import type { Tool } from '../../types/index';

interface ToolListProps {
  onViewDetails: (tool: Tool) => void;
}

export function ToolList({ onViewDetails }: ToolListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'name', direction: 'asc' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const { data: toolVaultData, isLoading, error } = useQuery({
    queryKey: ['toolVaultIndex'],
    queryFn: fetchToolVaultIndex,
  });

  const tools = toolVaultData?.tools || [];
  const uniqueCategories = useMemo(() => getUniqueCategories(tools), [tools]);
  const uniqueTags = useMemo(() => getUniqueTags(tools), [tools]);

  const filters: SearchFilters = {
    query: debouncedSearchQuery,
    category: selectedCategory || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  };

  const filteredAndSortedTools = useMemo(() => {
    const filtered = filterTools(tools, filters);
    return sortTools(filtered, sortOption);
  }, [tools, filters, sortOption]);

  const handleSortChange = () => {
    setSortOption(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {uniqueCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={uniqueTags}
              value={selectedTags}
              onChange={(_, newValue) => setSelectedTags(newValue)}
              sx={{ minWidth: 200, flexGrow: 1 }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option} label={option} size="small" />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Select tags" />
              )}
            />

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortOption.field}
                label="Sort by"
                onChange={(e) => setSortOption(prev => ({ ...prev, field: e.target.value as SortOption['field'] }))}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="category">Category</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title={`Sort ${sortOption.direction === 'asc' ? 'descending' : 'ascending'}`}>
              <IconButton onClick={handleSortChange}>
                <Sort sx={{ transform: sortOption.direction === 'desc' ? 'rotate(180deg)' : 'none' }} />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex' }}>
              <Tooltip title="Grid view">
                <IconButton 
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <GridView />
                </IconButton>
              </Tooltip>
              <Tooltip title="List view">
                <IconButton 
                  onClick={() => setViewMode('list')}
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredAndSortedTools.length} of {tools.length} tools
      </Typography>

      {/* Tools Grid/List */}
      {filteredAndSortedTools.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No tools match your search criteria
          </Typography>
        </Box>
      ) : (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' 
              ? 'repeat(auto-fill, minmax(300px, 1fr))' 
              : '1fr',
            gap: 3,
          }}
        >
          {filteredAndSortedTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onViewDetails={onViewDetails}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}