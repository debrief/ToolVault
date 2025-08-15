# APM Task Assignment: Enhanced Search and Filtering

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 4, Task 4.2** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Implement advanced search and filter capabilities with badges, metadata-driven features, and comprehensive filtering system to enhance tool discoverability.

**Prerequisites:** Task 4.1 completed - Mock backend service should be operational and providing realistic data.

## 2. Detailed Action Steps

1. **Implement Advanced Search Features:**
   - Create full-text search with highlighting:
     ```typescript
     // src/utils/searchUtils.ts
     export interface SearchOptions {
       query: string;
       fields: SearchField[];
       fuzzy: boolean;
       highlightMatches: boolean;
       maxResults: number;
     }
     
     export interface SearchResult<T> {
       item: T;
       score: number;
       matches: SearchMatch[];
     }
     
     export class AdvancedSearchEngine {
       private index: FlexSearch.Index;
       private documents: Map<string, Tool> = new Map();
       
       constructor() {
         this.index = new FlexSearch.Index({
           preset: 'performance',
           tokenize: 'full',
           resolution: 3,
           minlength: 2,
         });
       }
       
       indexTool(tool: Tool): void {
         const searchableContent = this.createSearchableContent(tool);
         this.index.add(tool.id, searchableContent);
         this.documents.set(tool.id, tool);
       }
       
       search(options: SearchOptions): SearchResult<Tool>[] {
         const results = this.index.search(options.query, options.maxResults);
         return results.map(id => ({
           item: this.documents.get(id as string)!,
           score: this.calculateRelevanceScore(id as string, options.query),
           matches: this.findMatches(id as string, options.query),
         }));
       }
       
       private createSearchableContent(tool: Tool): string {
         return [
           tool.name,
           tool.description,
           tool.category,
           ...tool.tags,
           ...tool.inputs.map(input => input.label),
           ...tool.outputs.map(output => output.label),
         ].join(' ').toLowerCase();
       }
     }
     ```

2. **Build Comprehensive Filtering System:**
   - Create advanced filter panel:
     ```typescript
     // src/components/tools/AdvancedFilters.tsx
     export interface FilterOptions {
       categories: string[];
       tags: string[];
       complexity: 'beginner' | 'intermediate' | 'advanced' | null;
       lastUpdated: 'week' | 'month' | 'year' | null;
       inputTypes: string[];
       outputTypes: string[];
       status: 'new' | 'updated' | 'stable' | 'deprecated' | null;
     }
     
     export function AdvancedFilters({ 
       filters, 
       onFiltersChange,
       availableOptions 
     }: AdvancedFiltersProps) {
       const [isExpanded, setIsExpanded] = useState(false);
       
       return (
         <Card>
           <CardHeader
             title="Filters"
             action={
               <IconButton
                 onClick={() => setIsExpanded(!isExpanded)}
                 aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
               >
                 {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
               </IconButton>
             }
           />
           <Collapse in={isExpanded}>
             <CardContent>
               {/* Category Filter */}
               <FilterSection title="Categories">
                 <FormGroup>
                   {availableOptions.categories.map(category => (
                     <FormControlLabel
                       key={category.id}
                       control={
                         <Checkbox
                           checked={filters.categories.includes(category.id)}
                           onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                         />
                       }
                       label={
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                           <span>{category.name}</span>
                           <Chip size="small" label={category.count} />
                         </Box>
                       }
                     />
                   ))}
                 </FormGroup>
               </FilterSection>
               
               {/* Tag Filter with Multi-select */}
               <FilterSection title="Tags">
                 <Autocomplete
                   multiple
                   options={availableOptions.tags}
                   value={filters.tags}
                   onChange={(_, newTags) => onFiltersChange({ ...filters, tags: newTags })}
                   renderTags={(value, getTagProps) =>
                     value.map((option, index) => (
                       <Chip
                         variant="outlined"
                         label={option}
                         {...getTagProps({ index })}
                         key={option}
                       />
                     ))
                   }
                   renderInput={(params) => (
                     <TextField {...params} placeholder="Select tags..." />
                   )}
                 />
               </FilterSection>
               
               {/* Complexity Filter */}
               <FilterSection title="Complexity Level">
                 <RadioGroup
                   value={filters.complexity || ''}
                   onChange={(e) => onFiltersChange({
                     ...filters,
                     complexity: e.target.value || null
                   })}
                 >
                   <FormControlLabel value="" control={<Radio />} label="Any" />
                   <FormControlLabel value="beginner" control={<Radio />} label="Beginner" />
                   <FormControlLabel value="intermediate" control={<Radio />} label="Intermediate" />
                   <FormControlLabel value="advanced" control={<Radio />} label="Advanced" />
                 </RadioGroup>
               </FilterSection>
               
               {/* Date-based Filter */}
               <FilterSection title="Last Updated">
                 <Select
                   value={filters.lastUpdated || ''}
                   onChange={(e) => onFiltersChange({
                     ...filters,
                     lastUpdated: e.target.value || null
                   })}
                   displayEmpty
                 >
                   <MenuItem value="">Any time</MenuItem>
                   <MenuItem value="week">Past week</MenuItem>
                   <MenuItem value="month">Past month</MenuItem>
                   <MenuItem value="year">Past year</MenuItem>
                 </Select>
               </FilterSection>
             </CardContent>
           </Collapse>
         </Card>
       );
     }
     ```

3. **Create Metadata-Driven Badges:**
   - Implement dynamic badge system:
     ```typescript
     // src/components/tools/ToolBadges.tsx
     export interface BadgeConfig {
       type: 'new' | 'updated' | 'popular' | 'beta' | 'stable' | 'deprecated';
       label: string;
       color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
       icon?: React.ReactNode;
       condition: (tool: Tool, metadata?: ToolMetadata) => boolean;
     }
     
     const badgeConfigs: BadgeConfig[] = [
       {
         type: 'new',
         label: 'New',
         color: 'primary',
         icon: <NewReleasesIcon />,
         condition: (tool, metadata) => {
           const createdDate = new Date(metadata?.created || tool.created);
           const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
           return daysSinceCreation <= 7;
         }
       },
       {
         type: 'updated',
         label: 'Updated',
         color: 'info',
         icon: <UpdateIcon />,
         condition: (tool, metadata) => {
           const updatedDate = new Date(metadata?.updated || tool.updated);
           const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
           return daysSinceUpdate <= 30;
         }
       },
       {
         type: 'popular',
         label: 'Popular',
         color: 'success',
         icon: <TrendingUpIcon />,
         condition: (tool, metadata) => metadata?.usage?.executions > 1000
       },
       {
         type: 'beta',
         label: 'Beta',
         color: 'warning',
         condition: (tool, metadata) => metadata?.status === 'beta'
       }
     ];
     
     export function ToolBadges({ tool, metadata }: ToolBadgesProps) {
       const applicableBadges = badgeConfigs.filter(config => 
         config.condition(tool, metadata)
       );
       
       if (applicableBadges.length === 0) return null;
       
       return (
         <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
           {applicableBadges.map(badge => (
             <Chip
               key={badge.type}
               label={badge.label}
               color={badge.color}
               size="small"
               icon={badge.icon}
               variant="filled"
             />
           ))}
         </Box>
       );
     }
     ```

4. **Enhance UI with Filter Visualizations:**
   - Create filter summary and management:
     ```typescript
     // src/components/tools/FilterSummary.tsx
     export function FilterSummary({ 
       filters, 
       onClearFilter, 
       onClearAll,
       resultCount 
     }: FilterSummaryProps) {
       const activeFilters = getActiveFilters(filters);
       
       if (activeFilters.length === 0) {
         return (
           <Typography variant="body2" color="text.secondary">
             Showing all {resultCount} tools
           </Typography>
         );
       }
       
       return (
         <Box sx={{ mb: 2 }}>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
             <Typography variant="body2" color="text.secondary">
               Showing {resultCount} tools with filters:
             </Typography>
             <Button
               size="small"
               onClick={onClearAll}
               startIcon={<ClearAllIcon />}
             >
               Clear all
             </Button>
           </Box>
           <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
             {activeFilters.map(filter => (
               <Chip
                 key={filter.key}
                 label={filter.label}
                 onDelete={() => onClearFilter(filter.key)}
                 size="small"
                 variant="outlined"
               />
             ))}
           </Box>
         </Box>
       );
     }
     
     // src/components/tools/FilterPresets.tsx
     export function FilterPresets({ onApplyPreset }: FilterPresetsProps) {
       const presets: FilterPreset[] = [
         {
           name: 'GIS Tools',
           icon: <MapIcon />,
           filters: {
             categories: ['geospatial'],
             tags: ['gis', 'mapping', 'spatial'],
           }
         },
         {
           name: 'Text Analysis',
           icon: <TextFieldsIcon />,
           filters: {
             categories: ['text'],
             tags: ['nlp', 'analysis', 'processing'],
           }
         },
         {
           name: 'Data Visualization',
           icon: <BarChartIcon />,
           filters: {
             categories: ['visualization'],
             outputTypes: ['chart', 'graph'],
           }
         },
         {
           name: 'Recently Updated',
           icon: <UpdateIcon />,
           filters: {
             lastUpdated: 'month',
           }
         }
       ];
       
       return (
         <Card>
           <CardHeader title="Quick Filters" />
           <CardContent>
             <Grid container spacing={2}>
               {presets.map(preset => (
                 <Grid item xs={12} sm={6} key={preset.name}>
                   <Button
                     variant="outlined"
                     startIcon={preset.icon}
                     onClick={() => onApplyPreset(preset.filters)}
                     fullWidth
                     sx={{ justifyContent: 'flex-start' }}
                   >
                     {preset.name}
                   </Button>
                 </Grid>
               ))}
             </Grid>
           </CardContent>
         </Card>
       );
     }
     ```

## 3. Advanced Search Implementation

**Search with Autocomplete and Suggestions:**
```typescript
// src/components/tools/SearchWithSuggestions.tsx
export function SearchWithSuggestions({ onSearch, tools }: SearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const debouncedQuery = useDebouncedValue(query, 300);
  
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      generateSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, tools]);
  
  const generateSuggestions = useCallback((searchQuery: string) => {
    const suggestions: SearchSuggestion[] = [];
    
    // Tool name suggestions
    const nameMatches = tools
      .filter(tool => tool.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map(tool => ({
        type: 'tool' as const,
        value: tool.name,
        label: tool.name,
        icon: <BuildIcon />,
        description: tool.description,
      }));
    
    // Category suggestions
    const categories = [...new Set(tools.map(tool => tool.category))]
      .filter(category => category.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 2)
      .map(category => ({
        type: 'category' as const,
        value: category,
        label: `Category: ${category}`,
        icon: <CategoryIcon />,
      }));
    
    // Tag suggestions
    const allTags = [...new Set(tools.flatMap(tool => tool.tags))]
      .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map(tag => ({
        type: 'tag' as const,
        value: tag,
        label: `Tag: ${tag}`,
        icon: <LabelIcon />,
      }));
    
    suggestions.push(...nameMatches, ...categories, ...allTags);
    setSuggestions(suggestions);
  }, [tools]);
  
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to search history
      setSearchHistory(prev => [
        searchQuery,
        ...prev.filter(item => item !== searchQuery)
      ].slice(0, 10));
      
      onSearch(searchQuery);
    }
  };
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Autocomplete
        freeSolo
        options={suggestions}
        inputValue={query}
        onInputChange={(_, newValue) => setQuery(newValue)}
        onChange={(_, value) => {
          if (typeof value === 'string') {
            handleSearch(value);
          } else if (value) {
            handleSearch(value.value);
          }
        }}
        getOptionLabel={(option) => 
          typeof option === 'string' ? option : option.label
        }
        renderOption={(props, option) => (
          <li {...props}>
            <ListItemIcon>
              {option.icon}
            </ListItemIcon>
            <ListItemText
              primary={option.label}
              secondary={option.description}
            />
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search tools, categories, or tags..."
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon />,
              endAdornment: query && (
                <IconButton
                  onClick={() => setQuery('')}
                  edge="end"
                  aria-label="Clear search"
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
          />
        )}
      />
      
      {/* Search History */}
      {query === '' && searchHistory.length > 0 && (
        <Card sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Recent searches
            </Typography>
            <List dense>
              {searchHistory.slice(0, 5).map((item, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleSearch(item)}
                >
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
```

## 4. Performance Optimization for Search

**Optimized Search Performance:**
```typescript
// src/hooks/useOptimizedSearch.ts
export function useOptimizedSearch(tools: Tool[]) {
  const searchEngine = useRef<AdvancedSearchEngine>();
  const [isIndexing, setIsIndexing] = useState(false);
  
  // Initialize and build search index
  useEffect(() => {
    if (!searchEngine.current) {
      searchEngine.current = new AdvancedSearchEngine();
    }
    
    const buildIndex = async () => {
      setIsIndexing(true);
      
      // Use web worker for heavy indexing
      const worker = new Worker(new URL('../workers/searchIndexWorker.ts', import.meta.url));
      
      worker.postMessage({ tools });
      
      worker.onmessage = (e) => {
        if (e.data.type === 'INDEX_COMPLETE') {
          searchEngine.current!.loadIndex(e.data.index);
          setIsIndexing(false);
        }
      };
    };
    
    if (tools.length > 100) {
      buildIndex();
    } else {
      // Build index synchronously for small datasets
      tools.forEach(tool => searchEngine.current!.indexTool(tool));
    }
  }, [tools]);
  
  const search = useCallback((options: SearchOptions): SearchResult<Tool>[] => {
    if (!searchEngine.current || isIndexing) {
      return [];
    }
    
    return searchEngine.current.search(options);
  }, [isIndexing]);
  
  return { search, isIndexing };
}

// src/workers/searchIndexWorker.ts
import { AdvancedSearchEngine } from '../utils/searchUtils';

self.onmessage = (e) => {
  const { tools } = e.data;
  const engine = new AdvancedSearchEngine();
  
  tools.forEach((tool: Tool) => {
    engine.indexTool(tool);
  });
  
  self.postMessage({
    type: 'INDEX_COMPLETE',
    index: engine.exportIndex(),
  });
};
```

## 5. URL State Management

**Deep Linking for Search and Filters:**
```typescript
// src/hooks/useSearchState.ts
export function useSearchState() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchState = useMemo(() => ({
    query: searchParams.get('q') || '',
    categories: searchParams.getAll('category'),
    tags: searchParams.getAll('tag'),
    complexity: searchParams.get('complexity') as FilterOptions['complexity'],
    lastUpdated: searchParams.get('updated') as FilterOptions['lastUpdated'],
  }), [searchParams]);
  
  const updateSearchState = useCallback((updates: Partial<typeof searchState>) => {
    const newParams = new URLSearchParams();
    
    if (updates.query) newParams.set('q', updates.query);
    updates.categories?.forEach(cat => newParams.append('category', cat));
    updates.tags?.forEach(tag => newParams.append('tag', tag));
    if (updates.complexity) newParams.set('complexity', updates.complexity);
    if (updates.lastUpdated) newParams.set('updated', updates.lastUpdated);
    
    setSearchParams(newParams, { replace: true });
  }, [setSearchParams]);
  
  return [searchState, updateSearchState] as const;
}
```

## 6. Expected Output & Deliverables

**Success Criteria:**
- Full-text search with highlighting and relevance scoring
- Comprehensive filter system with multiple criteria
- Dynamic badge system based on tool metadata
- Filter presets for common use cases
- Search autocomplete with suggestions and history
- URL state management for shareable filtered views
- Performance optimization for large datasets

**Deliverables:**
1. **Search Infrastructure:**
   - `src/utils/searchUtils.ts` - Advanced search engine
   - `src/workers/searchIndexWorker.ts` - Web worker for indexing
   - `src/hooks/useOptimizedSearch.ts` - Optimized search hook
   - `src/hooks/useSearchState.ts` - URL state management

2. **Filter Components:**
   - `src/components/tools/AdvancedFilters.tsx` - Main filter panel
   - `src/components/tools/FilterSummary.tsx` - Active filters display
   - `src/components/tools/FilterPresets.tsx` - Quick filter presets
   - `src/components/tools/SearchWithSuggestions.tsx` - Enhanced search

3. **Badge System:**
   - `src/components/tools/ToolBadges.tsx` - Dynamic badge display
   - `src/utils/badgeUtils.ts` - Badge configuration and logic
   - Enhanced `src/components/tools/ToolCard.tsx` - Badge integration

4. **Enhanced UI:**
   - Updated `src/components/tools/ToolList.tsx` - Search integration
   - Filter visualization and management
   - Search result highlighting

## 7. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_4_Full_UI_Mock_Execution/Task_4.2_Enhanced_Search_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_UI_Specialist)
- Task reference (Phase 4 / Task 4.2)
- Search engine implementation details
- Filter system architecture
- Badge system configuration
- Performance optimization strategies
- URL state management approach
- User experience enhancements

Please acknowledge receipt and proceed with implementation.