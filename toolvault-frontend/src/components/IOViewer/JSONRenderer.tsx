import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './JSONRenderer.css';

interface JSONRendererProps {
  data: unknown;
  title?: string;
  collapsible?: boolean;
  maxHeight?: string;
}

export const JSONRenderer: React.FC<JSONRendererProps> = ({
  data,
  title,
  collapsible = false,
  maxHeight = '400px'
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const formatData = () => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Unable to format data';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatData());
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const getDataInfo = () => {
    if (data === null || data === undefined) {
      return 'null';
    }
    
    if (Array.isArray(data)) {
      return `Array (${data.length} items)`;
    }
    
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      return `Object (${keys.length} properties)`;
    }
    
    return typeof data;
  };

  return (
    <div className="json-renderer">
      <div className="json-header">
        {title && <h4 className="json-title">{title}</h4>}
        
        <div className="json-controls">
          <span className="data-info">{getDataInfo()}</span>
          
          <button 
            className="copy-button"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copyStatus === 'idle' && '📋'}
            {copyStatus === 'copied' && '✅'}
            {copyStatus === 'error' && '❌'}
          </button>
          
          {collapsible && (
            <button
              className="collapse-button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? '▶️' : '▼️'}
            </button>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="json-content" style={{ maxHeight }}>
          <SyntaxHighlighter
            language="json"
            style={tomorrow}
            customStyle={{
              margin: 0,
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
            }}
            wrapLongLines={true}
          >
            {formatData()}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};