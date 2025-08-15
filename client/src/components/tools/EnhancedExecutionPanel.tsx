import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  AlertTitle,
  Typography,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Save,
  History,
  Analytics,
  Feedback,
  Settings,
  ExpandMore,
  ErrorOutline,
} from '@mui/icons-material';
import { validateInputs } from '../../utils/inputValidation';
import { useToolExecution } from '../../hooks/useToolExecution';
import { InputsList } from './InputsList';
import { OutputRenderer } from '../output/OutputRenderer';
import { ExecutionProgress } from './ExecutionProgress';
import { ExecutionErrorHandler } from './ExecutionErrorHandler';
import { ExecutionFeedback } from './ExecutionFeedback';
import { StreamingOutputRenderer } from './StreamingOutputRenderer';
import type { Tool } from '../../types/index';
import type { ExecutionError, ExecutionResults } from '../../types/execution';

export interface ExecutionPanelProps {
  tool: Tool;
  onExecutionComplete?: (results: ExecutionResults) => void;
  onExecutionError?: (error: ExecutionError) => void;
  onExecutionStart?: (executionId: string) => void;
  enableStreaming?: boolean;
  enableFeedback?: boolean;
  showAdvancedOptions?: boolean;
}

export function EnhancedExecutionPanel({ 
  tool, 
  onExecutionComplete,
  onExecutionError,
  onExecutionStart,
  enableStreaming = true,
  enableFeedback = true,
  showAdvancedOptions = false
}: ExecutionPanelProps) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [executionOptions, setExecutionOptions] = useState({
    timeout: 30000,
    priority: 'normal' as 'low' | 'normal' | 'high',
    enableNotifications: true,
  });

  const {
    execution,
    isExecuting,
    error,
    progress,
    results,
    executeTool,
    cancelExecution,
    clearExecution,
    retryExecution
  } = useToolExecution();

  // Handle execution completion
  useEffect(() => {
    if (results) {
      onExecutionComplete?.(results);
      if (enableFeedback) {
        setShowFeedback(true);
      }
    }
  }, [results, onExecutionComplete, enableFeedback]);

  // Handle execution errors
  useEffect(() => {
    if (error) {
      onExecutionError?.(error);
    }
  }, [error, onExecutionError]);

  // Handle execution start
  useEffect(() => {
    if (execution && execution.status === 'running') {
      onExecutionStart?.(execution.id);
    }
  }, [execution, onExecutionStart]);

  const handleInputChange = useCallback((inputName: string, value: any) => {
    setInputValues(prev => ({ ...prev, [inputName]: value }));
    
    // Clear validation error when user types
    if (validationErrors[inputName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[inputName];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validateAllInputs = useCallback((): boolean => {
    const validation = validateInputs(tool.inputs, inputValues);
    
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        errors[error.field] = error.message;
      });
      setValidationErrors(errors);
      return false;
    }
    
    setValidationErrors({});
    return true;
  }, [tool.inputs, inputValues]);

  const handleExecute = useCallback(async () => {
    if (!validateAllInputs()) {
      return;
    }

    try {
      await executeTool(tool.id, inputValues);
    } catch (executionError) {
      console.error('Execution failed:', executionError);
    }
  }, [validateAllInputs, executeTool, tool.id, inputValues]);

  const handleCancel = useCallback(async () => {
    try {
      await cancelExecution();
    } catch (cancelError) {
      console.error('Cancel failed:', cancelError);
    }
  }, [cancelExecution]);

  const handleReset = useCallback(() => {
    setInputValues({});
    setValidationErrors({});
    clearExecution();
    setShowFeedback(false);
  }, [clearExecution]);

  const handleRetry = useCallback(async () => {
    try {
      await retryExecution();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    }
  }, [retryExecution]);

  const handleSaveTemplate = useCallback(() => {
    const templateName = prompt('Enter template name:');
    if (templateName && Object.keys(inputValues).length > 0) {
      const template = {
        id: `template_${Date.now()}`,
        name: templateName,
        toolId: tool.id,
        inputs: inputValues,
        createdAt: new Date(),
      };

      const savedTemplates = JSON.parse(
        localStorage.getItem('execution-templates') || '[]'
      );
      savedTemplates.push(template);
      localStorage.setItem('execution-templates', JSON.stringify(savedTemplates));
    }
  }, [tool.id, inputValues]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const canExecute = tool.inputs.length === 0 || Object.keys(inputValues).length > 0;

  return (
    <Card>
      <CardHeader
        title="Tool Execution"
        subheader={`Configure inputs and execute ${tool.name}`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {execution && (
              <Chip
                label={execution.status}
                color={getStatusColor(execution.status) as any}
                size="small"
              />
            )}
            {showAdvancedOptions && (
              <Tooltip title="Execution Settings">
                <IconButton onClick={() => setShowSettings(true)}>
                  <Settings />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      
      <CardContent>
        {/* Input Forms */}
        {tool.inputs.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <InputsList
              inputs={tool.inputs}
              values={inputValues}
              errors={validationErrors}
              onChange={handleInputChange}
              disabled={isExecuting}
            />
          </Box>
        )}

        {/* Execution Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleExecute}
            disabled={!canExecute || isExecuting}
            startIcon={<PlayArrow />}
            size="large"
          >
            Execute Tool
          </Button>

          {isExecuting && (
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<Stop />}
              color="error"
            >
              Cancel
            </Button>
          )}

          {error?.retryable && (
            <Button
              variant="outlined"
              onClick={handleRetry}
              startIcon={<Refresh />}
              color="primary"
            >
              Retry
            </Button>
          )}

          <Button
            variant="text"
            onClick={handleReset}
            startIcon={<Refresh />}
            disabled={isExecuting}
          >
            Reset
          </Button>

          {Object.keys(inputValues).length > 0 && (
            <Button
              variant="text"
              onClick={handleSaveTemplate}
              startIcon={<Save />}
              disabled={isExecuting}
            >
              Save Template
            </Button>
          )}
        </Box>

        {/* Execution Progress */}
        {execution && (
          <ExecutionProgress
            execution={execution}
            progress={progress}
            sx={{ mb: 3 }}
          />
        )}

        {/* Error Handling */}
        {error && (
          <ExecutionErrorHandler
            error={error}
            onRetry={error.retryable ? handleRetry : undefined}
            onReport={() => {/* Implement error reporting */}}
            sx={{ mb: 3 }}
          />
        )}

        {/* Results Display */}
        {(results || (enableStreaming && execution?.id)) && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Execution Results
            </Typography>
            
            {enableStreaming && execution?.id && !results ? (
              <StreamingOutputRenderer
                executionId={execution.id}
                onComplete={(streamingResults) => {
                  // Results will be handled by the useToolExecution hook
                }}
                onError={(streamingError) => {
                  console.error('Streaming error:', streamingError);
                }}
              />
            ) : results ? (
              <OutputRenderer
                data={results.results}
                metadata={results.metadata}
                title={`${tool.name} Results`}
                interactive
              />
            ) : null}
          </Box>
        )}

        {/* Execution Analytics */}
        {results && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<Analytics />}
              label={`Duration: ${results.duration}ms`}
              variant="outlined"
              size="small"
            />
            {results.metadata?.performanceMetrics && (
              <>
                <Chip
                  label={`CPU: ${results.metadata.performanceMetrics.cpuUsage}%`}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={`Memory: ${results.metadata.performanceMetrics.memoryUsage}MB`}
                  variant="outlined"
                  size="small"
                />
              </>
            )}
          </Box>
        )}
      </CardContent>

      {/* Feedback Dialog */}
      {enableFeedback && (
        <Dialog open={showFeedback} onClose={() => setShowFeedback(false)}>
          <DialogTitle>Execution Feedback</DialogTitle>
          <DialogContent>
            {execution && (
              <ExecutionFeedback
                execution={execution}
                onFeedbackSubmit={(feedback) => {
                  console.log('Feedback submitted:', feedback);
                  setShowFeedback(false);
                }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowFeedback(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
        <DialogTitle>Execution Settings</DialogTitle>
        <DialogContent>
          {/* Implement settings form */}
          <Typography>Execution settings will be implemented here</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setShowSettings(false)}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default EnhancedExecutionPanel;