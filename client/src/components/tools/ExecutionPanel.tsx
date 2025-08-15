import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import { PlayArrow, CheckCircle, Refresh } from '@mui/icons-material';
import { validateInputs } from '../../utils/inputValidation';
import { InputsList } from './InputsList';
import { OutputsList } from './OutputsList';
import type { Tool } from '../../types/index';

interface ExecutionPanelProps {
  tool: Tool;
  onExecute?: (inputs: Record<string, any>) => void;
  isExecuting?: boolean;
}

type ExecutionStatus = 'idle' | 'validating' | 'executing' | 'complete' | 'error';

const executionSteps = [
  'Input Validation',
  'Tool Execution',
  'Results Ready'
];

export function ExecutionPanel({ tool, onExecute, isExecuting = false }: ExecutionPanelProps) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [outputData, setOutputData] = useState<Record<string, any>>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleInputChange = (newValues: Record<string, any>) => {
    setInputValues(newValues);
    // Clear validation errors when user types
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
  };

  const getActiveStep = () => {
    switch (executionStatus) {
      case 'validating':
        return 0;
      case 'executing':
        return 1;
      case 'complete':
        return 2;
      case 'error':
        return executionStatus === 'error' ? -1 : 0;
      default:
        return -1;
    }
  };

  const handleExecute = async () => {
    setExecutionStatus('validating');
    setErrorMessage('');
    setValidationErrors({});

    // Validate inputs
    const validation = validateInputs(tool.inputs, inputValues);
    
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        errors[error.field] = error.message;
      });
      setValidationErrors(errors);
      setExecutionStatus('error');
      setErrorMessage('Please fix the validation errors above.');
      return;
    }

    setExecutionStatus('executing');
    
    try {
      // Simulate execution (replace with actual implementation)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock output data based on tool outputs
      const mockOutputData: Record<string, any> = {};
      tool.outputs.forEach(output => {
        switch (output.type.toLowerCase()) {
          case 'map':
          case 'geojson':
            mockOutputData[output.name] = {
              type: 'FeatureCollection',
              features: []
            };
            break;
          case 'number':
            mockOutputData[output.name] = Math.random() * 100;
            break;
          case 'string':
            mockOutputData[output.name] = 'Sample output result';
            break;
          default:
            mockOutputData[output.name] = 'Sample data';
        }
      });
      
      setOutputData(mockOutputData);
      setExecutionStatus('complete');
      
      if (onExecute) {
        onExecute(inputValues);
      }
    } catch (error) {
      setExecutionStatus('error');
      setErrorMessage('Tool execution failed. Please try again.');
      console.error('Execution error:', error);
    }
  };

  const handleReset = () => {
    setExecutionStatus('idle');
    setValidationErrors({});
    setOutputData({});
    setErrorMessage('');
  };

  const canExecute = tool.inputs.length === 0 || Object.keys(inputValues).length > 0;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Execute Tool
      </Typography>

      {/* Execution Status Stepper */}
      {executionStatus !== 'idle' && (
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={getActiveStep()} alternativeLabel>
            {executionSteps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  error={executionStatus === 'error' && index <= getActiveStep()}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      {/* Error Alert */}
      {executionStatus === 'error' && errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Success Alert */}
      {executionStatus === 'complete' && (
        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
          Tool executed successfully! Results are displayed below.
        </Alert>
      )}

      {/* Input Parameters Form */}
      {tool.inputs.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <InputsList
            inputs={tool.inputs}
            values={inputValues}
            onChange={handleInputChange}
            errors={validationErrors}
          />
        </Box>
      )}

      {/* Execute Button */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {executionStatus === 'complete' ? (
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleReset}
            size="large"
          >
            Run Again
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            startIcon={
              executionStatus === 'executing' ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PlayArrow />
              )
            }
            onClick={handleExecute}
            disabled={!canExecute || isExecuting || executionStatus === 'executing'}
            sx={{ minWidth: 150 }}
          >
            {executionStatus === 'executing' ? 'Executing...' : 'Execute Tool'}
          </Button>
        )}
      </Box>

      {/* Output Results */}
      {tool.outputs.length > 0 && (
        <>
          <Divider sx={{ mb: 2 }} />
          <OutputsList
            outputs={tool.outputs}
            showPreview={executionStatus === 'complete'}
            previewData={outputData}
          />
        </>
      )}
    </Paper>
  );
}