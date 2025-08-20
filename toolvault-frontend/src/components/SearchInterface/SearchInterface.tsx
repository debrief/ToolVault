import { useState } from 'react';
import type { ToolMetadata } from '../../types/tools';
import type { SearchOptions } from '../../services/toolSearch';
import SearchBar from './SearchBar';
import SearchFilters from './SearchFilters';
import './SearchInterface.css';

interface SearchInterfaceProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchOptions: SearchOptions;
  onSearchOptionsChange: (options: SearchOptions) => void;
  tools: ToolMetadata[];
}

function SearchInterface({
  searchQuery,
  onSearchChange,
  searchOptions,
  onSearchOptionsChange,
  tools,
}: SearchInterfaceProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="search-interface">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        tools={tools}
      />
      
      <div className="search-controls">
        <button
          className={`advanced-filters-toggle ${showAdvancedFilters ? 'active' : ''}`}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          Advanced Filters
          <span className={`chevron ${showAdvancedFilters ? 'up' : 'down'}`}>
            {showAdvancedFilters ? '▲' : '▼'}
          </span>
        </button>
        
        {Object.keys(searchOptions).length > 0 && (
          <button
            className="clear-search-options"
            onClick={() => onSearchOptionsChange({})}
          >
            Clear Filters
          </button>
        )}
      </div>

      {showAdvancedFilters && (
        <SearchFilters
          searchOptions={searchOptions}
          onSearchOptionsChange={onSearchOptionsChange}
          tools={tools}
        />
      )}
    </div>
  );
}

export default SearchInterface;