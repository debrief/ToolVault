import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ToolMetadata } from '../../types/tools';
import { fuzzyToolSearchService } from '../../services/fuzzyToolSearch';
import './EnhancedSearchBar.css';

interface EnhancedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tools: ToolMetadata[];
  placeholder?: string;
  showHistory?: boolean;
  showAnalytics?: boolean;
}

interface SearchSuggestion {
  text: string;
  type: 'suggestion' | 'history' | 'popular';
  count?: number;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  tools,
  placeholder = "🔍 Search tools with fuzzy matching...",
  showHistory = true,
  showAnalytics = false,
}) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced suggestion generation
  const generateSuggestions = useCallback(
    (query: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        const newSuggestions: SearchSuggestion[] = [];

        if (query.length >= 2) {
          // Get fuzzy suggestions
          const fuzzySuggestions = fuzzyToolSearchService.getSuggestions(query, tools);
          newSuggestions.push(
            ...fuzzySuggestions.map(text => ({
              text,
              type: 'suggestion' as const,
            }))
          );
        } else if (query.length === 0 && showHistory) {
          // Show search history and popular searches when no query
          const history = fuzzyToolSearchService.getSearchHistory();
          const popular = fuzzyToolSearchService.getPopularSearches();

          // Add recent searches
          if (history.length > 0) {
            newSuggestions.push(
              ...history.slice(0, 5).map(text => ({
                text,
                type: 'history' as const,
              }))
            );
          }

          // Add popular searches
          if (popular.length > 0) {
            newSuggestions.push(
              ...popular.slice(0, 3).map(({ term, count }) => ({
                text: term,
                type: 'popular' as const,
                count,
              }))
            );
          }
        }

        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
        setIsTyping(false);
      }, 300);
    },
    [tools, showHistory]
  );

  useEffect(() => {
    generateSuggestions(searchQuery);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, generateSuggestions]);

  const handleInputChange = (value: string) => {
    setIsTyping(true);
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
          handleSuggestionSelect(suggestions[activeSuggestion].text);
        } else if (searchQuery.trim()) {
          // Execute search with current query
          setShowSuggestions(false);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionSelect = (suggestionText: string) => {
    onSearchChange(suggestionText);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  const handleClearSearch = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      generateSuggestions(searchQuery);
    }
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (!(e.target as Element).closest('.enhanced-search-bar')) {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'history':
        return '🕒';
      case 'popular':
        return '🔥';
      case 'suggestion':
      default:
        return '🔍';
    }
  };

  const getSuggestionLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'history':
        return 'Recent';
      case 'popular':
        return 'Popular';
      case 'suggestion':
      default:
        return 'Suggestion';
    }
  };

  return (
    <div className="enhanced-search-bar" onMouseDown={handleClickOutside}>
      <div className="search-input-container">
        <div className="search-icon">
          {isTyping ? (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M15 15L20 20" stroke="currentColor" strokeWidth="2"/>
            </svg>
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoComplete="off"
          spellCheck="false"
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

        {showAnalytics && (
          <div className="search-analytics">
            <span className="analytics-badge">
              {fuzzyToolSearchService.getAnalytics().totalSearches} searches
            </span>
          </div>
        )}
      </div>

      {showSuggestions && (
        <div className="search-suggestions">
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}`}
                  className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
                  onClick={() => handleSuggestionSelect(suggestion.text)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                >
                  <span className="suggestion-icon">
                    {getSuggestionIcon(suggestion.type)}
                  </span>
                  <span className="suggestion-content">
                    <span className="suggestion-text">{suggestion.text}</span>
                    <span className="suggestion-label">
                      {getSuggestionLabel(suggestion.type)}
                      {suggestion.count && (
                        <span className="suggestion-count"> • {suggestion.count}×</span>
                      )}
                    </span>
                  </span>
                </button>
              ))}
              
              {showHistory && searchQuery.length === 0 && (
                <div className="suggestions-footer">
                  <button
                    className="clear-history-btn"
                    onClick={() => {
                      fuzzyToolSearchService.clearSearchHistory();
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                  >
                    🗑️ Clear history
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-suggestions">
              <span>No suggestions found</span>
            </div>
          )}
        </div>
      )}

      {searchQuery.length >= 2 && (
        <div className="search-tips">
          <small>
            💡 Try fuzzy search: "transf" finds "transform", "geo" finds geographic tools
          </small>
        </div>
      )}
    </div>
  );
};