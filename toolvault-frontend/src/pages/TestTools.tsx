import { useState, useEffect } from 'react';
import type { ToolMetadata } from '../types/tools';
import { toolService } from '../services/toolService';
import './TestTools.css';

function TestTools() {
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
      <h1>Phase 0 Tool Integration Test</h1>
      
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
              <ul>
                {tool.parameters.map(param => (
                  <li key={param.name}>
                    {param.name} ({param.type}): {param.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestTools;