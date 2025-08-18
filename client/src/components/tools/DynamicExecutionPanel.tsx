/**
 * Dynamic Execution Panel for real JavaScript tool execution
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import { 
  PlayArrow, 
  Stop, 
  CheckCircle, 
  Error as ErrorIcon, 
  Refresh,
  Speed,
  Code,
  DataObject
} from '@mui/icons-material';
import { InputsList } from './InputsList';
import { OutputRenderer } from '../output/OutputRenderer';
import { useDynamicToolExecution } from '../../hooks/useDynamicToolExecution';
import { validateInputs } from '../../utils/inputValidation';
import { ToolValidationError, ToolExecutionError } from '../../tools/types';
import type { Tool } from '../../types/index';

interface DynamicExecutionPanelProps {
  tool: Tool;
  disabled?: boolean;
}

const executionSteps = [
  'Input Validation',
  'Module Loading',
  'Tool Execution',
  'Results Ready'
];

const getStepFromStatus = (status: string): number => {
  switch (status) {
    case 'idle':
    case 'initializing':
      return 0;
    case 'loading':
      return 1;
    case 'executing':
      return 2;
    case 'completed':
    case 'error':
    case 'cancelled':
      return 3;
    default:
      return 0;
  }
};

export function DynamicExecutionPanel({ tool, disabled = false }: DynamicExecutionPanelProps) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const {
    isExecuting,
    progress,
    status,
    results,
    error,
    executionTime,
    executeTool,
    loadTestData,
    cancelExecution,
    clearExecution,
  } = useDynamicToolExecution();

  // Load test data when component mounts
  useEffect(() => {
    if (tool.module && Object.keys(inputValues).length === 0) {
      loadTestData(tool).then(testData => {
        if (testData) {
          setInputValues(testData);
        }
      }).catch(error => {
        console.warn('Failed to load test data:', error);
      });
    }
  }, [tool, inputValues, loadTestData]);

  const handleInputChange = useCallback((newValues: Record<string, any>) => {
    setInputValues(newValues);
    // Clear validation errors when user types
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
  }, [validationErrors]);

  const handleExecute = useCallback(async () => {
    try {
      // Clear previous errors
      setValidationErrors({});
      
      // Validate inputs
      const validationResult = validateInputs(tool.inputs || [], inputValues);
      if (!validationResult.isValid) {
        // Convert ValidationError[] to Record<string, string>
        const errors: Record<string, string> = {};
        validationResult.errors.forEach(error => {
          errors[error.field] = error.message;
        });
        setValidationErrors(errors);
        return;
      }

      // Check if tool has a module path
      if (!tool.module) {
        setValidationErrors({
          general: 'This tool does not support dynamic execution (no module path defined)'
        });
        return;
      }

      // Execute the tool
      await executeTool(tool, inputValues);
    } catch (execError) {
      console.error('Tool execution failed:', execError);
      
      if (execError instanceof ToolValidationError) {
        setValidationErrors({
          [execError.field || 'general']: execError.message
        });
      }
      // Error state is handled by the hook
    }
  }, [inputValues, tool, executeTool]);

  const handleCancel = useCallback(() => {
    cancelExecution();
  }, [cancelExecution]);

  const handleClear = useCallback(() => {
    clearExecution();
    setInputValues({});
    setValidationErrors({});
  }, [clearExecution]);

  const handleLoadTestData = useCallback(async () => {
    if (!tool.module) return;
    
    try {
      const testData = await loadTestData(tool);
      if (testData) {
        setInputValues(testData);
        setValidationErrors({});
      }
    } catch (error) {
      console.error('Failed to load test data:', error);
    }
  }, [tool, loadTestData]);

  const currentStep = getStepFromStatus(status);
  const canExecute = !disabled && !isExecuting && tool.module && Object.keys(validationErrors).length === 0;
  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Code color="primary" />
          <Typography variant="h6">
            Dynamic Tool Execution
          </Typography>
          {tool.module && (
            <Chip
              size="small"
              label="Real Module"
              color="success"
              variant="outlined"
            />
          )}
        </Stack>
        
        {!tool.module && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This tool does not support dynamic execution. No module path is defined in the tool configuration.
          </Alert>
        )}
      </Box>

      {/* Input Section */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            Tool Inputs
          </Typography>
          {tool.module && (
            <Button
              size="small"
              startIcon={<DataObject />}
              onClick={handleLoadTestData}
              disabled={isExecuting}
              variant="outlined"
            >
              Load Test Data
            </Button>
          )}
        </Stack>
        <InputsList
          inputs={tool.inputs || []}
          values={inputValues}
          onChange={handleInputChange}
          errors={validationErrors}
          disabled={isExecuting}
        />
      </Box>

      {/* Execution Controls */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            startIcon={isExecuting ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            onClick={handleExecute}
            disabled={!canExecute}
            size="large"
          >
            {isExecuting ? 'Executing...' : 'Execute Tool'}
          </Button>
          
          {isExecuting && (
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={handleCancel}
              color="error"
            >
              Cancel
            </Button>
          )}
          
          {(results || error) && !isExecuting && (
            <Button
              variant="text"
              startIcon={<Refresh />}
              onClick={handleClear}
            >
              Clear Results
            </Button>
          )}
        </Stack>
      </Box>

      {/* Validation Errors */}
      {hasValidationErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Input Validation Errors:
          </Typography>
          {Object.entries(validationErrors).map(([field, message]) => (
            <Typography key={field} variant="body2">
              • {field === 'general' ? message : `${field}: ${message}`}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Execution Progress */}
      {isExecuting && (
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {executionSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary" align="center">
              {status === 'loading' && 'Loading tool module...'}
              {status === 'executing' && 'Executing tool...'}
              {status === 'initializing' && 'Initializing execution...'}
              {progress > 0 && ` (${Math.round(progress)}%)`}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Execution Error */}
      {error && !isExecuting && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={handleExecute}
            >
              Retry
            </Button>
          }
        >
          <Typography variant="subtitle2" gutterBottom>
            Execution Failed
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      {/* Execution Success */}
      {results && !isExecuting && !error && (
        <Box>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <CheckCircle color="success" />
            <Typography variant="h6" color="success.main">
              Execution Completed
            </Typography>
            {executionTime && (
              <Chip
                size="small"
                icon={<Speed />}
                label={`${executionTime.toFixed(2)}ms`}
                variant="outlined"
                color="success"
              />
            )}
          </Stack>

          {/* Results Section */}
          <Box data-testid="output-viewer">
            <Typography variant="subtitle1" gutterBottom>
              Tool Outputs
            </Typography>
            <OutputRenderer
              data={results.output}
              outputs={tool.outputs || []}
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default DynamicExecutionPanel;