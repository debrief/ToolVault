import React, { useState } from 'react';
import type { ToolMetadata } from '../../types/tools';
import type { AdvancedSearchOptions } from '../../services/fuzzyToolSearch';
import { EnhancedSearchBar } from './EnhancedSearchBar';
import { AdvancedSearchFilters } from './AdvancedSearchFilters';
import './EnhancedSearchInterface.css';

interface EnhancedSearchInterfaceProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchOptions: AdvancedSearchOptions;
  onSearchOptionsChange: (options: AdvancedSearchOptions) => void;
  tools: ToolMetadata[];
  resultCount?: number;
  isSearching?: boolean;
}

export const EnhancedSearchInterface: React.FC<EnhancedSearchInterfaceProps> = ({
  searchQuery,
  onSearchChange,
  searchOptions,
  onSearchOptionsChange,
  tools,
  resultCount,
  isSearching = false,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (searchOptions.categories?.length) count++;
    if (searchOptions.complexities?.length) count++;
    if (searchOptions.inputTypes?.length) count++;
    if (searchOptions.outputTypes?.length) count++;
    if (searchOptions.parameterCountRange) count++;
    if (searchOptions.fuzzyThreshold !== undefined && searchOptions.fuzzyThreshold !== 0.3) count++;
    return count;
  };

  const clearAllFilters = () => {
    onSearchOptionsChange({});
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  return (
    <div className="enhanced-search-interface">
      <div className="search-main">
        <EnhancedSearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          tools={tools}
          showHistory={true}
          showAnalytics={false}
        />
      </div>

      <div className="search-meta">
        <div className="search-info">
          {isSearching ? (
            <div className="searching-indicator">
              <div className="searching-spinner"></div>
              <span>Searching tools...</span>
            </div>
          ) : (
            resultCount !== undefined && (
              <div className="result-count">
                {resultCount === 0 ? (
                  <span className="no-results">No tools found</span>
                ) : (
                  <span className="results-found">
                    {resultCount} tool{resultCount !== 1 ? 's' : ''} found
                    {searchQuery && (
                      <span className="search-term"> for "{searchQuery}"</span>
                    )}
                  </span>
                )}
              </div>
            )
          )}
        </div>

        <div className="search-controls">
          {hasActiveFilters && (
            <button
              className="clear-all-btn"
              onClick={clearAllFilters}
              title="Clear all filters"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      <AdvancedSearchFilters
        filters={searchOptions}
        onFiltersChange={onSearchOptionsChange}
        tools={tools}
        isExpanded={showAdvancedFilters}
        onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {/* Quick filter chips */}
      {(searchQuery || hasActiveFilters) && (
        <div className="quick-filters">
          {searchQuery && (
            <div className="filter-chip search-chip">
              🔍 "{searchQuery}"
              <button
                className="chip-remove"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                ×
              </button>
            </div>
          )}
          
          {searchOptions.categories?.map(category => (
            <div key={`cat-${category}`} className="filter-chip category-chip">
              📂 {category}
              <button
                className="chip-remove"
                onClick={() => {
                  const newCategories = searchOptions.categories?.filter(c => c !== category);
                  onSearchOptionsChange({
                    ...searchOptions,
                    categories: newCategories?.length ? newCategories : undefined,
                  });
                }}
                title="Remove category filter"
              >
                ×
              </button>
            </div>
          ))}

          {searchOptions.complexities?.map(complexity => (
            <div key={`comp-${complexity}`} className="filter-chip complexity-chip">
              ⚡ {complexity}
              <button
                className="chip-remove"
                onClick={() => {
                  const newComplexities = searchOptions.complexities?.filter(c => c !== complexity);
                  onSearchOptionsChange({
                    ...searchOptions,
                    complexities: newComplexities?.length ? newComplexities : undefined,
                  });
                }}
                title="Remove complexity filter"
              >
                ×
              </button>
            </div>
          ))}

          {searchOptions.inputTypes?.map(inputType => (
            <div key={`in-${inputType}`} className="filter-chip input-chip">
              📥 {inputType}
              <button
                className="chip-remove"
                onClick={() => {
                  const newInputTypes = searchOptions.inputTypes?.filter(t => t !== inputType);
                  onSearchOptionsChange({
                    ...searchOptions,
                    inputTypes: newInputTypes?.length ? newInputTypes : undefined,
                  });
                }}
                title="Remove input type filter"
              >
                ×
              </button>
            </div>
          ))}

          {searchOptions.outputTypes?.map(outputType => (
            <div key={`out-${outputType}`} className="filter-chip output-chip">
              📤 {outputType}
              <button
                className="chip-remove"
                onClick={() => {
                  const newOutputTypes = searchOptions.outputTypes?.filter(t => t !== outputType);
                  onSearchOptionsChange({
                    ...searchOptions,
                    outputTypes: newOutputTypes?.length ? newOutputTypes : undefined,
                  });
                }}
                title="Remove output type filter"
              >
                ×
              </button>
            </div>
          ))}

          {searchOptions.parameterCountRange && (
            <div className="filter-chip range-chip">
              🔢 {searchOptions.parameterCountRange.min}-{searchOptions.parameterCountRange.max} params
              <button
                className="chip-remove"
                onClick={() =>
                  onSearchOptionsChange({
                    ...searchOptions,
                    parameterCountRange: undefined,
                  })
                }
                title="Remove parameter range filter"
              >
                ×
              </button>
            </div>
          )}

          {searchOptions.fuzzyThreshold !== undefined && searchOptions.fuzzyThreshold !== 0.3 && (
            <div className="filter-chip precision-chip">
              🎯 {Math.round(searchOptions.fuzzyThreshold * 100)}% precision
              <button
                className="chip-remove"
                onClick={() =>
                  onSearchOptionsChange({
                    ...searchOptions,
                    fuzzyThreshold: undefined,
                  })
                }
                title="Reset search precision"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};