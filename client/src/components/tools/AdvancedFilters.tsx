import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Autocomplete,
  Chip,
  Typography,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { FilterOptions, ToolMetadata } from '../../utils/searchUtils';
import type { Tool } from '../../types/index';

export interface FilterSection {
  title: string;
  children: React.ReactNode;
}

export interface AvailableOptions {
  categories: Array<{ id: string; name: string; count: number }>;
  tags: Array<{ id: string; name: string; count: number }>;
  inputTypes: string[];
  outputTypes: string[];
  complexityLevels: Array<{ value: string; label: string; count: number }>;
  statusOptions: Array<{ value: string; label: string; count: number }>;
}

export interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableOptions: AvailableOptions;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const FilterSection: React.FC<FilterSection> = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  availableOptions,
  isExpanded = false,
  onExpandedChange,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(isExpanded);
  
  const expanded = onExpandedChange ? isExpanded : internalExpanded;
  const setExpanded = onExpandedChange || setInternalExpanded;

  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    
    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  }, [filters, onFiltersChange]);

  const handleTagsChange = useCallback((event: any, newTags: string[]) => {
    onFiltersChange({
      ...filters,
      tags: newTags,
    });
  }, [filters, onFiltersChange]);

  const handleComplexityChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value || null;
    onFiltersChange({
      ...filters,
      complexity: value as FilterOptions['complexity'],
    });
  }, [filters, onFiltersChange]);

  const handleLastUpdatedChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value || null;
    onFiltersChange({
      ...filters,
      lastUpdated: value as FilterOptions['lastUpdated'],
    });
  }, [filters, onFiltersChange]);

  const handleInputTypesChange = useCallback((event: any, newTypes: string[]) => {
    onFiltersChange({
      ...filters,
      inputTypes: newTypes,
    });
  }, [filters, onFiltersChange]);

  const handleOutputTypesChange = useCallback((event: any, newTypes: string[]) => {
    onFiltersChange({
      ...filters,
      outputTypes: newTypes,
    });
  }, [filters, onFiltersChange]);

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value || null;
    onFiltersChange({
      ...filters,
      status: value as FilterOptions['status'],
    });
  }, [filters, onFiltersChange]);

  const handleClearAllFilters = useCallback(() => {
    onFiltersChange({
      categories: [],
      tags: [],
      complexity: null,
      lastUpdated: null,
      inputTypes: [],
      outputTypes: [],
      status: null,
    });
  }, [onFiltersChange]);

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.complexity ||
    filters.lastUpdated ||
    filters.inputTypes.length > 0 ||
    filters.outputTypes.length > 0 ||
    filters.status;

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={<FilterListIcon />}
        title="Advanced Filters"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasActiveFilters && (
              <Tooltip title="Clear all filters">
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={handleClearAllFilters}
                  variant="outlined"
                  color="secondary"
                >
                  Clear All
                </Button>
              </Tooltip>
            )}
            <IconButton
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Collapse filters' : 'Expand filters'}
              color="primary"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            
            {/* Categories Filter */}
            <FilterSection title="Categories">
              <FormGroup>
                {availableOptions.categories.map(category => (
                  <FormControlLabel
                    key={category.id}
                    control={
                      <Checkbox
                        checked={filters.categories.includes(category.id)}
                        onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography variant="body2">{category.name}</Typography>
                        <Chip 
                          size="small" 
                          label={category.count} 
                          sx={{ ml: 1, minWidth: 40, height: 20 }}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    sx={{ 
                      m: 0,
                      '& .MuiFormControlLabel-label': { 
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }
                    }}
                  />
                ))}
              </FormGroup>
            </FilterSection>

            <Divider sx={{ my: 2 }} />

            {/* Tags Filter */}
            <FilterSection title="Tags">
              <Autocomplete
                multiple
                options={availableOptions.tags.map(tag => tag.name)}
                value={filters.tags}
                onChange={handleTagsChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Select tags to filter..." 
                    size="small"
                    fullWidth
                  />
                )}
                size="small"
              />
            </FilterSection>

            <Divider sx={{ my: 2 }} />

            {/* Complexity and Status in a row */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FilterSection title="Complexity Level">
                <RadioGroup
                  value={filters.complexity || ''}
                  onChange={handleComplexityChange}
                  sx={{ flexDirection: 'row' }}
                >
                  <FormControlLabel 
                    value="" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2">Any</Typography>}
                  />
                  <FormControlLabel 
                    value="beginner" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2">Beginner</Typography>}
                  />
                  <FormControlLabel 
                    value="intermediate" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2">Intermediate</Typography>}
                  />
                  <FormControlLabel 
                    value="advanced" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2">Advanced</Typography>}
                  />
                </RadioGroup>
              </FilterSection>

              <FilterSection title="Status">
                <RadioGroup
                  value={filters.status || ''}
                  onChange={handleStatusChange}
                  sx={{ flexDirection: 'row' }}
                >
                  <FormControlLabel 
                    value="" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2">Any</Typography>}
                  />
                  <FormControlLabel 
                    value="new" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2">New</Typography>}
                  />
                  <FormControlLabel 
                    value="updated" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2">Updated</Typography>}
                  />
                  <FormControlLabel 
                    value="stable" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2">Stable</Typography>}
                  />
                  <FormControlLabel 
                    value="deprecated" 
                    control={<Radio size="small" />} 
                    label={<Typography variant="body2">Deprecated</Typography>}
                  />
                </RadioGroup>
              </FilterSection>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Date-based Filter */}
            <FilterSection title="Last Updated">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Time period</InputLabel>
                <Select
                  value={filters.lastUpdated || ''}
                  onChange={handleLastUpdatedChange}
                  label="Time period"
                >
                  <MenuItem value="">Any time</MenuItem>
                  <MenuItem value="week">Past week</MenuItem>
                  <MenuItem value="month">Past month</MenuItem>
                  <MenuItem value="year">Past year</MenuItem>
                </Select>
              </FormControl>
            </FilterSection>

            <Divider sx={{ my: 2 }} />

            {/* Input/Output Types in a row */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FilterSection title="Input Types">
                <Autocomplete
                  multiple
                  options={availableOptions.inputTypes}
                  value={filters.inputTypes}
                  onChange={handleInputTypesChange}
                  size="small"
                  sx={{ minWidth: 200 }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      placeholder="Filter by input types..." 
                      size="small"
                    />
                  )}
                />
              </FilterSection>

              <FilterSection title="Output Types">
                <Autocomplete
                  multiple
                  options={availableOptions.outputTypes}
                  value={filters.outputTypes}
                  onChange={handleOutputTypesChange}
                  size="small"
                  sx={{ minWidth: 200 }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      placeholder="Filter by output types..." 
                      size="small"
                    />
                  )}
                />
              </FilterSection>
            </Box>
            
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default AdvancedFilters;