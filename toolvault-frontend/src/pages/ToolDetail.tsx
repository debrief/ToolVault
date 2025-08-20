import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { ToolMetadata } from '../types/tools';
import { toolService } from '../services/toolService';
import { ParameterForm } from '../components/DynamicForm';
import { InputViewer, OutputViewer } from '../components/IOViewer';
import type { ParameterSchema } from '../components/DynamicForm';
import './ToolDetail.css';

function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [tool, setTool] = useState<ToolMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'example' | 'history'>('overview');
  
  // Execution state
  const [inputData, setInputData] = useState<any>(null);
  const [outputData, setOutputData] = useState<any>(null);
  const [paramValues, setParamValues] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | undefined>();

  useEffect(() => {
    if (id) {
      loadTool(id);
    }
  }, [id]);

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

  const loadTool = async (toolId: string) => {
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
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tool');
    } finally {
      setLoading(false);
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

  const convertParametersToSchema = (params: any[]): ParameterSchema[] => {
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

  // Memoize parameter schema conversion to prevent unnecessary re-renders
  const parameterSchema = useMemo(() => {
    return tool ? convertParametersToSchema(tool.parameters) : [];
  }, [tool]);

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
        <button onClick={() => navigate('/browse')}>
          ← Back to Browse Tools
        </button>
      </div>
    );
  }

  if (!tool) {
    return null;
  }

  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="tool-header">
        <div className="tool-info">
          <h1>{tool.name}</h1>
          <p className="tool-description">{tool.description}</p>
          <div className="tool-metadata">
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
        </div>
      </div>

      <div className="parameters-overview">
        <h3>Parameters</h3>
        {tool.parameters.length === 0 ? (
          <p>This tool requires no parameters.</p>
        ) : (
          <div className="parameters-list">
            {tool.parameters.map(param => (
              <div key={param.name} className="parameter-item">
                <div className="parameter-header">
                  <strong>{param.name}</strong>
                  <span className="parameter-type">({param.type})</span>
                </div>
                <p className="parameter-description">{param.description}</p>
                {param.default !== undefined && (
                  <div className="parameter-default">
                    Default: <code>{JSON.stringify(param.default)}</code>
                  </div>
                )}
                {param.enum && (
                  <div className="parameter-options">
                    Options: {param.enum.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {tool.examples && tool.examples.length > 0 && (
        <div className="examples-overview">
          <h3>Examples</h3>
          <div className="examples-list">
            {tool.examples.map((example, index) => (
              <div key={index} className="example-item">
                <h4>{example.name}</h4>
                <div className="example-params">
                  <strong>Parameters:</strong>
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
    <div className="example-tab">
      <div className="example-controls">
        <h3>Try the Tool</h3>
        {tool.examples && tool.examples.length > 0 && (
          <div className="example-selector">
            <label>Load Example:</label>
            <div className="example-buttons">
              {tool.examples.map((example, index) => (
                <button
                  key={index}
                  className="example-button"
                  onClick={() => loadExampleData(index)}
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="execution-interface">
        <div className="interface-grid">
          <div className="input-section">
            <InputViewer
              inputTypes={tool.input_types}
              onDataChange={setInputData}
              currentData={inputData}
              title="Input Data"
              placeholder="Enter or upload input data for this tool..."
            />
          </div>

          <div className="parameters-section">
            <h4>Parameters</h4>
            <ParameterForm
              parameters={parameterSchema}
              onChange={(values) => setParamValues(values)}
            />
            
            <div className="execution-controls">
              <button 
                className="execute-button"
                onClick={executeTool}
                disabled={!inputData || isExecuting}
              >
                {isExecuting ? 'Executing...' : 'Run Tool'}
              </button>
            </div>
          </div>

          <div className="output-section">
            <OutputViewer
              data={outputData}
              outputTypes={tool.output_types}
              title="Output Data"
              filename={tool.id}
              isLoading={isExecuting}
              error={executionError || undefined}
              executionTime={executionTime}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="history-tab">
      <h3>Version History</h3>
      <div className="history-placeholder">
        <p>🚧 Version history and source information will be available in a future release.</p>
        <div className="current-version">
          <h4>Current Version</h4>
          <div className="version-info">
            <div>Commit: {tool.commit}</div>
            <div>Date: {new Date(tool.commit_date).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tool-detail">
      <div className="tool-header-nav">
        <button className="back-button" onClick={() => navigate('/browse')}>
          ← Back to Browse Tools
        </button>
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