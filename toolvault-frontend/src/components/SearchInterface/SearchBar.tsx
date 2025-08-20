import { useState, useRef, useEffect } from 'react';
import type { ToolMetadata } from '../../types/tools';
import { toolSearchService } from '../../services/toolSearch';
import './SearchBar.css';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tools: ToolMetadata[];
}

function SearchBar({ searchQuery, onSearchChange, tools }: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const newSuggestions = toolSearchService.getSuggestions(searchQuery, tools);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
    setActiveSuggestion(-1);
  }, [searchQuery, tools]);

  const handleInputChange = (value: string) => {
    onSearchChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
          handleSuggestionSelect(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  const handleClearSearch = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <div className="search-icon">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M15 15L20 20" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search tools by name, description, category, or parameters..."
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        
        {searchQuery && (
          <button
            className="clear-search"
            onClick={handleClearSearch}
            title="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <span className="suggestion-text">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;