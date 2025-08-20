import { useState } from 'react';
import type { ToolMetadata } from '../../types/tools';
import type { SearchOptions } from '../../services/toolSearch';
import './SearchFilters.css';

interface SearchFiltersProps {
  searchOptions: SearchOptions;
  onSearchOptionsChange: (options: SearchOptions) => void;
  tools: ToolMetadata[];
}

function SearchFilters({ searchOptions, onSearchOptionsChange, tools }: SearchFiltersProps) {
  const [localOptions, setLocalOptions] = useState<SearchOptions>(searchOptions);

  // Extract unique values from tools for filter options
  const inputTypes = Array.from(new Set(tools.flatMap(t => t.input_types))).sort();
  const outputTypes = Array.from(new Set(tools.flatMap(t => t.output_types))).sort();

  const handleOptionChange = (key: keyof SearchOptions, value: unknown) => {
    const newOptions = { ...localOptions, [key]: value };
    setLocalOptions(newOptions);
    onSearchOptionsChange(newOptions);
  };

  const handleComplexityChange = (complexity: 'simple' | 'medium' | 'complex', checked: boolean) => {
    const currentComplexities = localOptions.complexities || [];
    const newComplexities = checked
      ? [...currentComplexities, complexity]
      : currentComplexities.filter(c => c !== complexity);
    
    handleOptionChange('complexities', newComplexities.length > 0 ? newComplexities : undefined);
  };

  const handleInputTypeChange = (inputType: string, checked: boolean) => {
    const currentTypes = localOptions.inputTypes || [];
    const newTypes = checked
      ? [...currentTypes, inputType]
      : currentTypes.filter(t => t !== inputType);
    
    handleOptionChange('inputTypes', newTypes.length > 0 ? newTypes : undefined);
  };

  const handleOutputTypeChange = (outputType: string, checked: boolean) => {
    const currentTypes = localOptions.outputTypes || [];
    const newTypes = checked
      ? [...currentTypes, outputType]
      : currentTypes.filter(t => t !== outputType);
    
    handleOptionChange('outputTypes', newTypes.length > 0 ? newTypes : undefined);
  };

  const handleParameterCountChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value, 10);
    const currentRange = localOptions.parameterCountRange || { min: 0, max: 10 };
    const newRange = { ...currentRange, [field]: isNaN(numValue) ? (field === 'min' ? 0 : 10) : numValue };
    
    handleOptionChange('parameterCountRange', newRange);
  };

  return (
    <div className="search-filters">
      <div className="filter-section">
        <h4>Complexity</h4>
        <div className="checkbox-group">
          {['simple', 'medium', 'complex'].map(complexity => (
            <label key={complexity} className="checkbox-label">
              <input
                type="checkbox"
                checked={(localOptions.complexities || []).includes(complexity as 'simple' | 'medium' | 'complex')}
                onChange={(e) => handleComplexityChange(complexity as 'simple' | 'medium' | 'complex', e.target.checked)}
              />
              <span className="checkbox-text">{complexity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Parameter Count</h4>
        <div className="range-inputs">
          <div className="range-input">
            <label>Min:</label>
            <input
              type="number"
              min="0"
              max="20"
              value={localOptions.parameterCountRange?.min || 0}
              onChange={(e) => handleParameterCountChange('min', e.target.value)}
            />
          </div>
          <div className="range-input">
            <label>Max:</label>
            <input
              type="number"
              min="0"
              max="20"
              value={localOptions.parameterCountRange?.max || 10}
              onChange={(e) => handleParameterCountChange('max', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h4>Input Types</h4>
        <div className="checkbox-group checkbox-grid">
          {inputTypes.map(inputType => (
            <label key={inputType} className="checkbox-label">
              <input
                type="checkbox"
                checked={(localOptions.inputTypes || []).includes(inputType)}
                onChange={(e) => handleInputTypeChange(inputType, e.target.checked)}
              />
              <span className="checkbox-text">{inputType}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Output Types</h4>
        <div className="checkbox-group checkbox-grid">
          {outputTypes.map(outputType => (
            <label key={outputType} className="checkbox-label">
              <input
                type="checkbox"
                checked={(localOptions.outputTypes || []).includes(outputType)}
                onChange={(e) => handleOutputTypeChange(outputType, e.target.checked)}
              />
              <span className="checkbox-text">{outputType}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchFilters;