import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { ToolMetadata, ToolHistoryCommit, ToolInputData, ToolOutputData, ToolParameterValues, ToolParameter } from '../types/tools';
import { toolService } from '../services/toolService';
import { bundleLoader } from '../services/bundleLoader';
import { ParameterField } from '../components/DynamicForm';
import { InputViewer, OutputViewer } from '../components/IOViewer';
import type { ParameterSchema } from '../components/DynamicForm';
import './ToolDetail.css';

function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  const [tool, setTool] = useState<ToolMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'example' | 'history'>('overview');
  
  // Execution state
  const [inputData, setInputData] = useState<ToolInputData>(null);
  const [outputData, setOutputData] = useState<ToolOutputData>(null);
  const [paramValues, setParamValues] = useState<ToolParameterValues>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | undefined>();

  // History state
  const [historyData, setHistoryData] = useState<ToolHistoryCommit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // Add full-width class for tool detail pages
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    const htmlElement = document.documentElement;
    
    if (mainContent) {
      mainContent.classList.add('tool-detail-page');
    }
    if (htmlElement) {
      htmlElement.classList.add('tool-detail-page');
    }

    // Cleanup on unmount
    return () => {
      if (mainContent) {
        mainContent.classList.remove('tool-detail-page');
      }
      if (htmlElement) {
        htmlElement.classList.remove('tool-detail-page');
      }
    };
  }, []);

  useEffect(() => {
    // Handle tab query parameter
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'example', 'history'].includes(tabParam)) {
      setActiveTab(tabParam as 'overview' | 'example' | 'history');
    }
  }, [searchParams]);

  // Update allExpanded state when individual expansions change
  useEffect(() => {
    if (historyData.length > 0) {
      const totalCommitsWithChanges = historyData.filter(commit => commit.changes && commit.changes.length > 0).length;
      const expandedCount = expandedChanges.size;
      setAllExpanded(totalCommitsWithChanges > 0 && expandedCount === totalCommitsWithChanges);
    }
  }, [expandedChanges, historyData]);

  const loadTool = useCallback(async (toolId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const toolData = await toolService.getToolById(toolId);
      if (!toolData) {
        setError(`Tool '${toolId}' not found`);
        return;
      }
      
      setTool(toolData);
      
      // Load the tool script
      await toolService.loadToolScript(toolId);
      
      // Load history data
      loadToolHistory(toolId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tool');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadTool(id);
    }
  }, [id, loadTool]);

  const loadToolHistory = async (toolId: string) => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      
      const history = await bundleLoader.getToolHistory(toolId);
      setHistoryData(history);
      
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleChangeExpansion = (commitHash: string) => {
    setExpandedChanges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commitHash)) {
        newSet.delete(commitHash);
      } else {
        newSet.add(commitHash);
      }
      return newSet;
    });
  };

  const toggleExpandAll = () => {
    if (allExpanded) {
      // Collapse all
      setExpandedChanges(new Set());
    } else {
      // Expand all commits that have changes
      const commitsWithChanges = new Set(
        historyData
          .filter(commit => commit.changes && commit.changes.length > 0)
          .map(commit => commit.commit)
      );
      setExpandedChanges(commitsWithChanges);
    }
  };

  const executeTool = async () => {
    if (!tool || !inputData) return;

    setIsExecuting(true);
    setExecutionError(null);
    setOutputData(null);

    const startTime = performance.now();
    
    try {
      const result = await toolService.executeTools(tool.id, inputData, paramValues);
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      
      if (result.success) {
        setOutputData(result.output);
      } else {
        setExecutionError(result.error || 'Tool execution failed');
      }
    } catch (err) {
      setExecutionError(err instanceof Error ? err.message : 'Tool execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const convertParametersToSchema = (params: ToolParameter[]): ParameterSchema[] => {
    return params.map(param => ({
      name: param.name,
      type: param.type,
      default: param.default,
      min: param.min,
      max: param.max,
      step: param.step,
      pattern: param.pattern,
      enum: param.enum,
      description: param.description
    }));
  };


  const loadExampleData = (exampleIndex: number) => {
    if (!tool || !tool.examples || !tool.examples[exampleIndex]) return;
    
    const example = tool.examples[exampleIndex];
    setParamValues(example.parameters || {});
    
    // Load sample input data based on tool type
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
    
    if (tool.input_types.includes('FeatureCollection') || tool.input_types.includes('Feature')) {
      setInputData(sampleGeoJSON);
    } else if (tool.input_types.includes('string')) {
      setInputData('Sample string data');
    }
  };

  if (loading) {
    return (
      <div className="tool-detail-loading">
        <div className="loading-spinner"></div>
        <div>Loading tool...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tool-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!tool) {
    return null;
  }

  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="tool-metadata">
        <p className="tool-description">{tool.description}</p>
        <div className="metadata-row">
          <span className="metadata-label">Category:</span>
          <span className="metadata-value">{tool.labels.join(', ')}</span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">Input Types:</span>
          <span className="metadata-value">{tool.input_types.join(', ')}</span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">Output Types:</span>
          <span className="metadata-value">{tool.output_types.join(', ')}</span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">Temporal:</span>
          <span className="metadata-value">{tool.isTemporal ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div className="parameters-overview">
        <h3>Parameters</h3>
        {tool.parameters.length === 0 ? (
          <p>This tool requires no parameters.</p>
        ) : (
          <div className="parameters-table-container">
            <table className="parameters-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Default</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {tool.parameters.map(param => (
                  <tr key={param.name}>
                    <td className="param-name">
                      <strong>{param.name}</strong>
                    </td>
                    <td className="param-type">
                     <code>{param.type}</code>
                    </td>
                    <td className="param-description">
                      {param.description}
                    </td>
                    <td className="param-default">
                      {param.default !== undefined ? (
                        <code>{JSON.stringify(param.default)}</code>
                      ) : (
                        <span className="no-value">—</span>
                      )}
                    </td>
                    <td className="param-options">
                      {param.enum ? (
                        param.enum.join(', ')
                      ) : (
                        <span className="no-value">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tool.examples && tool.examples.length > 0 && (
        <div className="examples-overview">
          <h3>Examples</h3>
          <div className="examples-list">
            {tool.examples.map((example, index) => (
              <div key={index} className="example-item">
                <div className="example-title">
                  <h4>{example.name}</h4>
                </div>
                <div className="example-params">
                  <pre>{JSON.stringify(example.parameters, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderExampleTab = () => (
    <div className="example-tab execution-interface">
      <div className="workflow-container">        
        {/* Step 1: Input Configuration */}
        <div className="input-configuration interface-grid">
          <div className="input-config-grid">
            <div className="input-data-section input-section">
              <InputViewer
                inputTypes={tool.input_types}
                onDataChange={setInputData}
                currentData={inputData}
                placeholder="Enter or upload input data for this tool..."
              />
            </div>

            <div className="parameters-config-section parameters-section">
              <div className="parameters-header">
                <h4>Parameters</h4>
                {tool.examples && tool.examples.length > 0 && (
                  <div className="example-controls-inline">
                    <span className="example-label">Load Example:</span>
                    <div className="example-buttons-compact">
                      {tool.examples.map((example, index) => (
                        <button
                          key={index}
                          className="example-button-small"
                          onClick={() => loadExampleData(index)}
                        >
                          {example.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {tool.parameters.length === 0 ? (
                <p className="no-parameters">This tool requires no parameters.</p>
              ) : (
                <div className="parameters-table-container">
                  <div className="parameter-form">
                    <table className="parameters-form-table">
                      <tbody>
                        {tool.parameters.map(param => (
                          <tr key={param.name} className="parameter-field">
                            <td className="param-name">
                              <span className="parameter-label"><strong>{param.name}</strong></span>
                            </td>
                            <td className="param-description">
                              {param.description || '—'}
                            </td>
                            <td className="param-input">
                              <ParameterField
                                schema={convertParametersToSchema([param])[0]}
                                value={paramValues[param.name]}
                                onChange={(value) => setParamValues(prev => ({ ...prev, [param.name]: value }))}
                                compact={true}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Execute */}
        <div className="execution-controls">
          <button 
            className="execute-button"
            onClick={executeTool}
            disabled={!inputData || isExecuting}
          >
            {isExecuting ? 'Executing...' : '▶ Run Tool'}
          </button>
        </div>

        {/* Step 3: Output */}
        <div className="output-section">
          <OutputViewer
            data={outputData}
            outputTypes={tool.output_types}
            filename={tool.id}
            isLoading={isExecuting}
            error={executionError || undefined}
            executionTime={executionTime}
          />
          {executionError && (
            <div className="output-error error-message">
              {executionError}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="history-tab">
      <div className="history-header">
        <h3>Version History</h3>
        {historyData.length > 0 && (
          <button 
            className="expand-all-button"
            onClick={toggleExpandAll}
          >
            {allExpanded ? '📝 Collapse All Changes' : '📝 Expand All Changes'}
          </button>
        )}
      </div>
      
      {historyLoading && (
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <div>Loading history...</div>
        </div>
      )}
      
      {historyError && (
        <div className="history-error">
          <p>❌ Failed to load history: {historyError}</p>
        </div>
      )}
      
      {!historyLoading && !historyError && historyData.length === 0 && (
        <div className="no-history">
          <p>📝 No version history available for this tool.</p>
        </div>
      )}
      
      {!historyLoading && !historyError && historyData.length > 0 && (
        <div className="history-list">
          {historyData.map((commit, index) => {
            const isExpanded = expandedChanges.has(commit.commit);
            const hasChanges = commit.changes && commit.changes.length > 0;
            
            return (
              <div key={commit.commit} className={`history-item ${index === 0 ? 'current' : ''}`}>
                <div className={`commit-content ${hasChanges && isExpanded ? 'has-expanded-changes' : ''}`}>
                  <div className="commit-summary">
                    <div className="commit-header">
                      <span className="commit-hash">{commit.commit}</span>
                      {index === 0 && <span className="current-badge">Current</span>}
                      <span className="commit-date">
                        {new Date(commit.commit_date).toLocaleDateString()}
                      </span>
                      <span className="commit-author">{commit.author}</span>
                    </div>
                    <div className="commit-message-row">
                      <div className="commit-message">{commit.message}</div>
                      {hasChanges && (
                        <button 
                          className="expand-changes-button"
                          onClick={() => toggleChangeExpansion(commit.commit)}
                        >
                          {isExpanded ? '▼ Hide' : '▶ Show'} ({commit.changes.length})
                        </button>
                      )}
                    </div>
                  </div>
                  {hasChanges && isExpanded && (
                    <div className="commit-changes">
                      <h6>Changes:</h6>
                      <ul>
                        {commit.changes.map((change, changeIndex) => (
                          <li key={changeIndex}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="tool-detail">
      <div className="tool-header-nav">
        <button
          className="back-button"
          onClick={() => window.location.href = '/browse'}
        >
          ← Back to Browse
        </button>
      </div>

      <div className="tool-header">
        <h1>{tool.name}</h1>
      </div>

      <div className="tool-tabs">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'example' ? 'active' : ''}`}
            onClick={() => setActiveTab('example')}
          >
            Try It
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'example' && renderExampleTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </div>
      </div>
    </div>
  );
}

export default ToolDetail;