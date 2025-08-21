import React, { useState } from 'react';
import type { AdvancedSearchOptions } from '../../services/fuzzyToolSearch';
import type { ToolMetadata } from '../../types/tools';
import './AdvancedSearchFilters.css';

interface AdvancedSearchFiltersProps {
  filters: AdvancedSearchOptions;
  onFiltersChange: (filters: AdvancedSearchOptions) => void;
  tools: ToolMetadata[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  tools,
  isExpanded,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedSearchOptions>(filters);

  // Extract available options from tools
  const availableCategories = Array.from(
    new Set(tools.flatMap(tool => tool.labels))
  ).sort();

  const availableInputTypes = Array.from(
    new Set(tools.flatMap(tool => tool.input_types))
  ).sort();

  const availableOutputTypes = Array.from(
    new Set(tools.flatMap(tool => tool.output_types))
  ).sort();

  const handleFilterChange = (key: keyof AdvancedSearchOptions, value: unknown) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayToggle = <T extends string>(
    key: keyof AdvancedSearchOptions,
    value: T,
    currentArray?: T[]
  ) => {
    const current = currentArray || [];
    const newArray = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    
    handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
  };

  const handleRangeChange = (
    key: 'parameterCountRange',
    field: 'min' | 'max',
    value: number
  ) => {
    const currentRange = localFilters[key] || { min: 0, max: 10 };
    const newRange = { ...currentRange, [field]: value };
    
    // Ensure min <= max
    if (field === 'min' && newRange.min > newRange.max) {
      newRange.max = newRange.min;
    }
    if (field === 'max' && newRange.max < newRange.min) {
      newRange.min = newRange.max;
    }
    
    handleFilterChange(key, newRange);
  };

  const clearAllFilters = () => {
    const clearedFilters: AdvancedSearchOptions = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (localFilters.categories?.length) count++;
    if (localFilters.complexities?.length) count++;
    if (localFilters.inputTypes?.length) count++;
    if (localFilters.outputTypes?.length) count++;
    if (localFilters.parameterCountRange) count++;
    if (localFilters.fuzzyThreshold !== undefined && localFilters.fuzzyThreshold !== 0.3) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="advanced-search-filters">
      <button
        className={`filters-toggle ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
      >
        <span className="toggle-icon">⚙️</span>
        <span className="toggle-text">
          Advanced Filters
          {activeCount > 0 && (
            <span className="active-count">({activeCount})</span>
          )}
        </span>
        <span className="toggle-arrow">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="filters-content">
          <div className="filters-header">
            <h4>🔍 Search Filters</h4>
            {activeCount > 0 && (
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear All
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Categories Filter */}
            <div className="filter-section">
              <h5>📂 Categories</h5>
              <div className="filter-options">
                {availableCategories.map(category => (
                  <label key={category} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={localFilters.categories?.includes(category) || false}
                      onChange={() =>
                        handleArrayToggle('categories', category, localFilters.categories)
                      }
                    />
                    <span className="checkbox-label">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Complexity Filter */}
            <div className="filter-section">
              <h5>⚡ Complexity</h5>
              <div className="filter-options">
                {(['simple', 'medium', 'complex'] as const).map(complexity => (
                  <label key={complexity} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={localFilters.complexities?.includes(complexity) || false}
                      onChange={() =>
                        handleArrayToggle('complexities', complexity, localFilters.complexities)
                      }
                    />
                    <span className="checkbox-label">{complexity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Input Types Filter */}
            <div className="filter-section">
              <h5>📥 Input Types</h5>
              <div className="filter-options">
                {availableInputTypes.map(inputType => (
                  <label key={inputType} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={localFilters.inputTypes?.includes(inputType) || false}
                      onChange={() =>
                        handleArrayToggle('inputTypes', inputType, localFilters.inputTypes)
                      }
                    />
                    <span className="checkbox-label">{inputType}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Output Types Filter */}
            <div className="filter-section">
              <h5>📤 Output Types</h5>
              <div className="filter-options">
                {availableOutputTypes.map(outputType => (
                  <label key={outputType} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={localFilters.outputTypes?.includes(outputType) || false}
                      onChange={() =>
                        handleArrayToggle('outputTypes', outputType, localFilters.outputTypes)
                      }
                    />
                    <span className="checkbox-label">{outputType}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Parameter Count Range */}
            <div className="filter-section">
              <h5>🔢 Parameter Count</h5>
              <div className="range-inputs">
                <div className="range-input">
                  <label>Min:</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={localFilters.parameterCountRange?.min || 0}
                    onChange={(e) =>
                      handleRangeChange('parameterCountRange', 'min', parseInt(e.target.value, 10))
                    }
                  />
                </div>
                <div className="range-input">
                  <label>Max:</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={localFilters.parameterCountRange?.max || 10}
                    onChange={(e) =>
                      handleRangeChange('parameterCountRange', 'max', parseInt(e.target.value, 10))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Fuzzy Threshold */}
            <div className="filter-section">
              <h5>🎯 Search Precision</h5>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localFilters.fuzzyThreshold || 0.3}
                  onChange={(e) =>
                    handleFilterChange('fuzzyThreshold', parseFloat(e.target.value))
                  }
                  className="precision-slider"
                />
                <div className="slider-labels">
                  <span>Exact</span>
                  <span className="current-value">
                    {Math.round((localFilters.fuzzyThreshold || 0.3) * 100)}%
                  </span>
                  <span>Fuzzy</span>
                </div>
                <p className="slider-help">
                  Lower values = more precise matches, Higher values = broader fuzzy matching
                </p>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          {activeCount > 0 && (
            <div className="filter-summary">
              <h5>📊 Active Filters Summary</h5>
              <div className="summary-tags">
                {localFilters.categories?.map(cat => (
                  <span key={`cat-${cat}`} className="summary-tag category">
                    📂 {cat}
                  </span>
                ))}
                {localFilters.complexities?.map(comp => (
                  <span key={`comp-${comp}`} className="summary-tag complexity">
                    ⚡ {comp}
                  </span>
                ))}
                {localFilters.inputTypes?.map(type => (
                  <span key={`in-${type}`} className="summary-tag input">
                    📥 {type}
                  </span>
                ))}
                {localFilters.outputTypes?.map(type => (
                  <span key={`out-${type}`} className="summary-tag output">
                    📤 {type}
                  </span>
                ))}
                {localFilters.parameterCountRange && (
                  <span className="summary-tag range">
                    🔢 {localFilters.parameterCountRange.min}-{localFilters.parameterCountRange.max} params
                  </span>
                )}
                {localFilters.fuzzyThreshold !== undefined && localFilters.fuzzyThreshold !== 0.3 && (
                  <span className="summary-tag precision">
                    🎯 {Math.round(localFilters.fuzzyThreshold * 100)}% precision
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};