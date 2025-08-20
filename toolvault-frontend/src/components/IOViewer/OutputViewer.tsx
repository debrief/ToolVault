import React from 'react';
import { IOTabs } from './IOTabs';
import './OutputViewer.css';

interface OutputViewerProps {
  data: any;
  outputTypes?: string[];
  title?: string;
  filename?: string;
  isLoading?: boolean;
  error?: string;
  executionTime?: number;
  renderCustomPreview?: (data: any) => React.ReactNode;
}

export const OutputViewer: React.FC<OutputViewerProps> = ({
  data,
  outputTypes = [],
  title = 'Output Data',
  filename = 'output',
  isLoading = false,
  error,
  executionTime,
  renderCustomPreview
}) => {
  const renderLoadingState = () => (
    <div className="output-loading">
      <div className="loading-spinner"></div>
      <div className="loading-text">Processing...</div>
    </div>
  );

  const renderErrorState = () => (
    <div className="output-error">
      <div className="error-icon">⚠️</div>
      <div className="error-title">Execution Error</div>
      <div className="error-message">{error}</div>
      <div className="error-help">
        Please check your input data and parameters, then try again.
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="output-empty">
      <div className="empty-icon">📄</div>
      <div className="empty-title">No Output</div>
      <div className="empty-message">
        Run the tool to see output data here
      </div>
    </div>
  );

  const renderOutputInfo = () => {
    if (!data || isLoading || error) return null;

    return (
      <div className="output-info">
        <div className="info-section">
          <span className="info-label">Expected types:</span>
          <span className="info-value">
            {outputTypes.length > 0 ? outputTypes.join(', ') : 'Various formats'}
          </span>
        </div>
        
        {executionTime !== undefined && (
          <div className="info-section">
            <span className="info-label">Execution time:</span>
            <span className="info-value">{executionTime}ms</span>
          </div>
        )}
        
        <div className="info-section">
          <span className="info-label">Data size:</span>
          <span className="info-value">{getDataSize(data)}</span>
        </div>
      </div>
    );
  };

  const getDataSize = (data: any): string => {
    try {
      const jsonString = JSON.stringify(data);
      const bytes = new TextEncoder().encode(jsonString).length;
      
      if (bytes < 1024) {
        return `${bytes} bytes`;
      } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
      } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    } catch (error) {
      return 'Unknown size';
    }
  };

  const renderOutputContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (error) {
      return renderErrorState();
    }

    if (!data) {
      return renderEmptyState();
    }

    return (
      <IOTabs
        data={data}
        showRaw={true}
        showPreview={true}
        showDownload={true}
        filename={filename}
        renderPreview={renderCustomPreview}
      />
    );
  };

  return (
    <div className="output-viewer">
      <div className="output-header">
        <h3 className="output-title">{title}</h3>
        {renderOutputInfo()}
      </div>

      <div className="output-content">
        {renderOutputContent()}
      </div>
    </div>
  );
};