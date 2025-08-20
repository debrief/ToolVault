import { Link } from 'react-router-dom';
import type { ToolMetadata } from '../../types/tools';
import type { ViewMode } from './ToolBrowser';
import { metadataParser } from '../../services/metadataParser';
import './ToolCard.css';

interface ToolCardProps {
  tool: ToolMetadata;
  viewMode: ViewMode;
}

function ToolCard({ tool, viewMode }: ToolCardProps) {
  const complexity = metadataParser.getToolComplexity(tool);
  const primaryCategory = tool.labels[0] || 'uncategorized';

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return '#28a745';
      case 'medium': return '#ffc107';
      case 'complex': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="tool-card tool-card-list">
        <div className="tool-card-main">
          <div className="tool-card-header">
            <h3 className="tool-name">
              <Link to={`/tool/${tool.id}`}>{tool.name}</Link>
            </h3>
            <div className="tool-badges">
              <span className="category-badge">{primaryCategory}</span>
              <span 
                className="complexity-badge"
                style={{ backgroundColor: getComplexityColor(complexity) }}
              >
                {complexity}
              </span>
              {tool.isTemporal && (
                <span className="temporal-badge">temporal</span>
              )}
            </div>
          </div>
          
          <p className="tool-description">{tool.description}</p>
          
          <div className="tool-meta-list">
            <div className="tool-meta-item">
              <strong>Parameters:</strong> {tool.parameters.length}
            </div>
            <div className="tool-meta-item">
              <strong>Input:</strong> {tool.input_types.slice(0, 2).join(', ')}
              {tool.input_types.length > 2 && ` +${tool.input_types.length - 2} more`}
            </div>
            <div className="tool-meta-item">
              <strong>Output:</strong> {tool.output_types.slice(0, 2).join(', ')}
              {tool.output_types.length > 2 && ` +${tool.output_types.length - 2} more`}
            </div>
          </div>
        </div>

        <div className="tool-card-actions">
          <Link to={`/tool/${tool.id}`} className="btn btn-primary">
            View Details
          </Link>
          <Link to={`/execute/${tool.id}`} className="btn btn-secondary">
            Try Tool
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tool-card tool-card-grid">
      <div className="tool-card-header">
        <h3 className="tool-name">
          <Link to={`/tool/${tool.id}`}>{tool.name}</Link>
        </h3>
        <div className="tool-badges">
          <span className="category-badge">{primaryCategory}</span>
          <span 
            className="complexity-badge"
            style={{ backgroundColor: getComplexityColor(complexity) }}
          >
            {complexity}
          </span>
        </div>
      </div>

      <p className="tool-description">{tool.description}</p>

      <div className="tool-labels">
        {tool.labels.map(label => (
          <span key={label} className="tool-label">
            {label}
          </span>
        ))}
      </div>

      <div className="tool-meta-grid">
        <div className="tool-meta-item">
          <span className="meta-label">Parameters:</span>
          <span className="meta-value">{tool.parameters.length}</span>
        </div>
        <div className="tool-meta-item">
          <span className="meta-label">Temporal:</span>
          <span className="meta-value">{tool.isTemporal ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div className="tool-io-types">
        <div className="io-section">
          <strong>Input:</strong>
          <div className="io-types">
            {tool.input_types.slice(0, 3).map(type => (
              <span key={type} className="io-type">{type}</span>
            ))}
            {tool.input_types.length > 3 && (
              <span className="io-more">+{tool.input_types.length - 3}</span>
            )}
          </div>
        </div>
        <div className="io-section">
          <strong>Output:</strong>
          <div className="io-types">
            {tool.output_types.slice(0, 3).map(type => (
              <span key={type} className="io-type">{type}</span>
            ))}
            {tool.output_types.length > 3 && (
              <span className="io-more">+{tool.output_types.length - 3}</span>
            )}
          </div>
        </div>
      </div>

      <div className="tool-card-actions">
        <Link to={`/tool/${tool.id}`} className="btn btn-primary btn-sm">
          Details
        </Link>
        <Link to={`/execute/${tool.id}`} className="btn btn-secondary btn-sm">
          Try Tool
        </Link>
      </div>
    </div>
  );
}

export default ToolCard;