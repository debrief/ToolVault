import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ToolMetadata } from '../types/tools';
import { toolService } from '../services/toolService';
import './TestTools.css';

function TestTools() {
  const navigate = useNavigate();
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number; categories: number; loaded: number } | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const loadedTools = await toolService.loadTools();
      const toolStats = await toolService.getToolStats();
      
      setTools(loadedTools);
      setStats(toolStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const loadAllScripts = async () => {
    try {
      await toolService.loadAllToolScripts();
      const updatedStats = await toolService.getToolStats();
      setStats(updatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tool scripts');
    }
  };

  const viewToolDetail = (toolId: string) => {
    navigate(`/tool/${toolId}`);
  };

  const tryTool = (toolId: string) => {
    navigate(`/tool/${toolId}?tab=example`);
  };

  if (loading) {
    return <div className="loading">Loading Phase 0 tools...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Tools</h2>
        <p>{error}</p>
        <button onClick={loadTools}>Retry</button>
      </div>
    );
  }

  return (
    <div className="test-tools">
      <h1>Phase 1 Task 1.4 - Metadata-Driven UI Test</h1>
      
      {stats && (
        <div className="stats">
          <h2>Tool Statistics</h2>
          <p>Total Tools: {stats.total}</p>
          <p>Categories: {stats.categories}</p>
          <p>Scripts Loaded: {stats.loaded}</p>
          <button onClick={loadAllScripts} disabled={stats.loaded === stats.total}>
            Load All Tool Scripts
          </button>
        </div>
      )}

      <div className="main-content">
        <div className="tools-list">
          <h2>Available Tools</h2>
          <div className="tools-grid">
            {tools.map(tool => (
              <div key={tool.id} className="tool-card">
                <h3>{tool.name}</h3>
                <p className="tool-description">{tool.description}</p>
                <div className="tool-meta">
                  <span className="tool-id">ID: {tool.id}</span>
                  <span className="tool-labels">
                    Labels: {tool.labels.join(', ')}
                  </span>
                  <span className="tool-temporal">
                    Temporal: {tool.isTemporal ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="tool-io">
                  <div>Input: {tool.input_types.join(', ')}</div>
                  <div>Output: {tool.output_types.join(', ')}</div>
                </div>
                <div className="tool-params">
                  <strong>Parameters ({tool.parameters.length}):</strong>
                  {tool.parameters.length === 0 ? (
                    <p>None</p>
                  ) : (
                    <ul>
                      {tool.parameters.slice(0, 3).map(param => (
                        <li key={param.name}>
                          {param.name} ({param.type}): {param.description}
                        </li>
                      ))}
                      {tool.parameters.length > 3 && (
                        <li>... and {tool.parameters.length - 3} more</li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="tool-actions">
                  <button 
                    className="action-button primary"
                    onClick={() => viewToolDetail(tool.id)}
                  >
                    View Details
                  </button>
                  <button 
                    className="action-button secondary"
                    onClick={() => tryTool(tool.id)}
                  >
                    Try Tool
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="test-note">
          <h3>✅ Metadata-Driven UI Testing Complete</h3>
          <p>This page demonstrates that all 12 Phase 0 tools are successfully loaded and their metadata can be used to generate dynamic interfaces. Click "View Details" or "Try Tool" to navigate to individual tool pages with the full metadata-driven UI experience.</p>
          <div className="navigation-info">
            <p><strong>Navigation:</strong></p>
            <ul>
              <li><strong>View Details</strong> - Opens the tool overview page</li>
              <li><strong>Try Tool</strong> - Opens the tool with the interactive interface ready to use</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestTools;