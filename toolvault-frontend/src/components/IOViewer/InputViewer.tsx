import React, { useState, useCallback } from 'react';
import { IOTabs } from './IOTabs';
import './InputViewer.css';

interface InputViewerProps {
  inputTypes?: string[];
  onDataChange?: (data: unknown) => void;
  onFileSelect?: (file: File) => void;
  currentData?: unknown;
  title?: string;
  placeholder?: string;
}

export const InputViewer: React.FC<InputViewerProps> = ({
  inputTypes = [],
  onDataChange,
  onFileSelect,
  currentData,
  title = 'Input Data',
  placeholder = 'Upload a file or paste data here...'
}) => {
  const [inputMode, setInputMode] = useState<'file' | 'text' | 'sample'>('file');
  const [textInput, setTextInput] = useState('');
  const [parseError, setParseError] = useState<string>('');

  const handleTextChange = (value: string) => {
    setTextInput(value);
    setParseError('');

    if (!value.trim()) {
      onDataChange?.(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      onDataChange?.(parsed);
    } catch {
      setParseError('Invalid JSON format');
      onDataChange?.(value); // Pass as raw string
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(content);
        onDataChange?.(parsed);
        setTextInput(JSON.stringify(parsed, null, 2));
      } catch {
        // If not JSON, use as raw text
        onDataChange?.(content);
        setTextInput(content);
      }
      
      setParseError('');
    };

    reader.onerror = () => {
      setParseError('Error reading file');
    };

    reader.readAsText(file);
    onFileSelect?.(file);
  }, [onDataChange, onFileSelect]);

  const handleSampleData = () => {
    const sampleGeoJSON = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [-0.1278, 51.5074]
          },
          "properties": {
            "name": "London",
            "population": 8982000
          }
        }
      ]
    };
    
    const sampleText = JSON.stringify(sampleGeoJSON, null, 2);
    setTextInput(sampleText);
    onDataChange?.(sampleGeoJSON);
    setParseError('');
  };

  const renderInputModeSelector = () => (
    <div className="input-mode-selector">
      <button
        className={`mode-button ${inputMode === 'file' ? 'active' : ''}`}
        onClick={() => setInputMode('file')}
      >
        📁 File Upload
      </button>
      <button
        className={`mode-button ${inputMode === 'text' ? 'active' : ''}`}
        onClick={() => setInputMode('text')}
      >
        📝 Text Input
      </button>
      <button
        className={`mode-button ${inputMode === 'sample' ? 'active' : ''}`}
        onClick={() => setInputMode('sample')}
      >
        🧪 Sample Data
      </button>
    </div>
  );

  const renderInputContent = () => {
    switch (inputMode) {
      case 'file':
        return (
          <div className="file-input-section">
            <div className="accepted-types">
              <strong>Accepted types:</strong> {inputTypes.length > 0 ? inputTypes.join(', ') : 'Any format'}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="text-input-section">
            <textarea
              className={`data-textarea ${parseError ? 'error' : ''}`}
              value={textInput}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={placeholder}
              rows={10}
            />
            {parseError && (
              <div className="parse-error">
                ⚠️ {parseError} - Data will be used as plain text
              </div>
            )}
            <div className="input-help">
              Paste JSON data, GeoJSON, CSV, or plain text here
            </div>
          </div>
        );

      case 'sample':
        return (
          <div className="sample-input-section">
            <p>Use sample data to test the tool quickly:</p>
            <button
              className="sample-button"
              onClick={handleSampleData}
            >
              Load Sample GeoJSON Data
            </button>
            <div className="sample-description">
              This will load a sample GeoJSON FeatureCollection with a point in London
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="input-viewer">
      <div className="input-controls">
        <h3 className="input-title">{title}</h3>
        {renderInputModeSelector()}
      </div>

      <div className="input-content">
        {renderInputContent()}
      </div>

      <div className="input-data-display">
        {currentData !== null && currentData !== undefined && (
          <div className="current-data-preview">
            Data loaded successfully
          </div>
        )}
        <IOTabs
          data={currentData}
          title={currentData ? "Current Input Data" : "No Input Data"}
          showPreview={true}
          showRaw={true}
          showDownload={!!currentData}
          filename="input-data"
          onFileSelect={handleFileSelect}
          renderPreview={currentData ? undefined : () => (
            <div className="no-input-placeholder">
              <div className="placeholder-icon">📄</div>
              <div className="placeholder-title">No Input Data</div>
              <div className="placeholder-message">
                Use the controls above to load input data for this tool
              </div>
              <div className="accepted-types-info">
                <strong>Accepted types:</strong> {inputTypes.length > 0 ? inputTypes.join(', ') : 'Any format'}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};