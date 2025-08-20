import { useState, useEffect, useCallback } from 'react';
import type { ToolMetadata } from '../../types/tools';
import type { SearchOptions } from '../../services/toolSearch';
import { toolService } from '../../services/toolService';
import { toolSearchService } from '../../services/toolSearch';
import SearchInterface from '../SearchInterface/SearchInterface';
import ToolCard from './ToolCard';
import CategoryFilter from './CategoryFilter';
import ViewControls from './ViewControls';
import './ToolBrowser.css';

export type ViewMode = 'grid' | 'list';
export type SortMode = 'name' | 'category' | 'complexity';

function ToolBrowser() {
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [filteredTools, setFilteredTools] = useState<ToolMetadata[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({});

  useEffect(() => {
    loadTools();
  }, []);

  const applyFiltersAndSearch = useCallback(() => {
    let result = tools;

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = toolSearchService.search(searchQuery, tools, {
        ...searchOptions,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      });
      result = searchResults.map(r => r.tool);
    } else {
      // Apply filters without search
      const filterOptions: SearchOptions = {
        ...searchOptions,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      };
      result = toolSearchService.filterTools(tools, filterOptions);
    }

    // Apply sorting
    const sortTools = (toolsToSort: ToolMetadata[], mode: SortMode): ToolMetadata[] => {
      const sorted = [...toolsToSort];
      
      switch (mode) {
        case 'name':
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'category':
          return sorted.sort((a, b) => {
            const aCat = a.labels[0] || '';
            const bCat = b.labels[0] || '';
            return aCat.localeCompare(bCat) || a.name.localeCompare(b.name);
          });
        case 'complexity':
          return sorted.sort((a, b) => {
            const complexityOrder = { 'simple': 0, 'medium': 1, 'complex': 2 };
            const aComplexity = complexityOrder[getToolComplexity(a)];
            const bComplexity = complexityOrder[getToolComplexity(b)];
            return aComplexity - bComplexity || a.name.localeCompare(b.name);
          });
        default:
          return sorted;
      }
    };

    result = sortTools(result, sortMode);
    
    setFilteredTools(result);
  }, [tools, searchQuery, selectedCategories, searchOptions, sortMode]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const loadTools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [loadedTools, loadedCategories] = await Promise.all([
        toolService.loadTools(),
        toolService.getCategories(),
      ]);
      
      setTools(loadedTools);
      setCategories(loadedCategories);
      
      // Build search index
      toolSearchService.buildSearchIndex(loadedTools);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const getToolComplexity = (tool: ToolMetadata): 'simple' | 'medium' | 'complex' => {
    const paramCount = tool.parameters.length;
    const hasComplexParams = tool.parameters.some(p => 
      p.type === 'enum' || (p.min !== undefined && p.max !== undefined)
    );
    const isMultiInputOutput = tool.input_types.length > 1 || tool.output_types.length > 1;

    if (paramCount <= 2 && !hasComplexParams && !isMultiInputOutput) {
      return 'simple';
    } else if (paramCount <= 5 && !isMultiInputOutput) {
      return 'medium';
    } else {
      return 'complex';
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSearchOptions({});
  };

  if (loading) {
    return <div className="tool-browser-loading">Loading tools...</div>;
  }

  if (error) {
    return (
      <div className="tool-browser-error">
        <h2>Error Loading Tools</h2>
        <p>{error}</p>
        <button onClick={loadTools}>Retry</button>
      </div>
    );
  }

  return (
    <div className="tool-browser">
      <div className="tool-browser-header">
        <h1>Tool Browser</h1>
        <p>Discover and explore {tools.length} analysis tools</p>
      </div>

      <div className="tool-browser-controls">
        <SearchInterface
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchOptions={searchOptions}
          onSearchOptionsChange={setSearchOptions}
          tools={tools}
        />
        
        <div className="filters-and-controls">
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onClearAll={() => setSelectedCategories([])}
          />
          
          <ViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
          />
        </div>
      </div>

      <div className="tool-browser-results">
        <div className="results-header">
          <span className="results-count">
            Showing {filteredTools.length} of {tools.length} tools
          </span>
          {(searchQuery || selectedCategories.length > 0 || Object.keys(searchOptions).length > 0) && (
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          )}
        </div>

        <div className={`tools-container ${viewMode}`}>
          {filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              viewMode={viewMode}
            />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="no-results">
            <h3>No tools found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolBrowser;