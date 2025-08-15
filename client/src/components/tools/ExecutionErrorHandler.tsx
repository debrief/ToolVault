import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Lightbulb,
  Refresh,
  BugReport,
  ErrorOutline,
  Warning,
  Info,
  CheckCircle,
} from '@mui/icons-material';
import type { ExecutionError } from '../../types/execution';

export interface ExecutionErrorHandlerProps {
  error: ExecutionError;
  onRetry?: () => void;
  onReport?: (report: ErrorReport) => void;
  sx?: any;
}

interface ErrorReport {
  errorCode: string;
  userDescription: string;
  errorType: 'bug' | 'usability' | 'performance' | 'other';
  userEmail?: string;
  includeContext: boolean;
}

const errorSuggestions: Record<string, {
  icon: React.ReactNode;
  suggestions: string[];
  severity: 'error' | 'warning' | 'info';
}> = {
  INVALID_INPUT: {
    icon: <Warning color="warning" />,
    suggestions: [
      'Check that all required fields are filled out correctly',
      'Verify input formats match the expected patterns',
      'Review input validation requirements in tool documentation',
      'Try using example values provided in the tool description',
    ],
    severity: 'warning',
  },
  
  RESOURCE_EXHAUSTED: {
    icon: <ErrorOutline color="error" />,
    suggestions: [
      'Reduce the size of input data or parameters',
      'Split large operations into smaller, manageable chunks',
      'Try executing during off-peak hours when resources are less constrained',
      'Consider upgrading to a higher service tier if available',
    ],
    severity: 'error',
  },
  
  TIMEOUT: {
    icon: <ErrorOutline color="error" />,
    suggestions: [
      'Reduce processing complexity by simplifying input parameters',
      'Break large operations into smaller steps',
      'Check network connection and try again',
      'Increase timeout settings if the option is available',
    ],
    severity: 'error',
  },
  
  TOOL_UNAVAILABLE: {
    icon: <ErrorOutline color="error" />,
    suggestions: [
      'Check if the tool is temporarily down for maintenance',
      'Try again in a few minutes - this may be a temporary issue',
      'Contact system administrator if the problem persists',
      'Use an alternative tool if available',
    ],
    severity: 'error',
  },
  
  PERMISSION_DENIED: {
    icon: <ErrorOutline color="error" />,
    suggestions: [
      'Verify you have the necessary permissions to use this tool',
      'Contact your administrator to request access',
      'Check if your account has the required roles or licenses',
      'Ensure you are logged in with the correct credentials',
    ],
    severity: 'error',
  },
  
  RATE_LIMITED: {
    icon: <Warning color="warning" />,
    suggestions: [
      'Wait a few minutes before trying again',
      'Reduce the frequency of your requests',
      'Consider batching multiple operations together',
      'Contact support to discuss rate limit adjustments',
    ],
    severity: 'warning',
  },
  
  VALIDATION_FAILED: {
    icon: <Warning color="warning" />,
    suggestions: [
      'Review all input fields for completeness and accuracy',
      'Check data types match expected formats (numbers, dates, etc.)',
      'Ensure required fields are not empty',
      'Verify input values are within acceptable ranges',
    ],
    severity: 'warning',
  },
  
  INTERNAL_ERROR: {
    icon: <ErrorOutline color="error" />,
    suggestions: [
      'This appears to be a system error - try again in a few minutes',
      'If the problem persists, please report this issue',
      'Check system status page for any known issues',
      'Contact technical support with error details',
    ],
    severity: 'error',
  },
  
  EXECUTION_CANCELLED: {
    icon: <Info color="info" />,
    suggestions: [
      'The execution was cancelled by user request',
      'You can restart the execution with the same or modified parameters',
      'Check if the cancellation was intentional',
    ],
    severity: 'info',
  },
};

export function ExecutionErrorHandler({
  error,
  onRetry,
  onReport,
  sx
}: ExecutionErrorHandlerProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [report, setReport] = useState<Partial<ErrorReport>>({
    errorCode: error.code,
    userDescription: '',
    errorType: 'bug',
    includeContext: true,
  });

  const errorInfo = errorSuggestions[error.code] || {
    icon: <ErrorOutline color="error" />,
    suggestions: ['This is an unexpected error. Please report this issue for investigation.'],
    severity: 'error' as const,
  };

  const handleSubmitReport = () => {
    if (onReport && report.userDescription) {
      onReport(report as ErrorReport);
      setReportDialogOpen(false);
      setReport({
        errorCode: error.code,
        userDescription: '',
        errorType: 'bug',
        includeContext: true,
      });
    }
  };

  const getAlertSeverity = () => {
    return errorInfo.severity;
  };

  const formatErrorTimestamp = (timestamp?: Date) => {
    if (!timestamp) return 'Unknown';
    return timestamp.toLocaleString();
  };

  return (
    <Box sx={sx}>
      <Alert severity={getAlertSeverity()}>
        <AlertTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Execution Failed
            <Chip 
              label={error.code} 
              size="small" 
              color={getAlertSeverity()}
              variant="outlined" 
            />
          </Box>
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          {error.message}
        </Typography>

        {error.timestamp && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Error occurred at: {formatErrorTimestamp(error.timestamp)}
          </Typography>
        )}

        {/* Error Details */}
        {error.details && (
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Technical Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography 
                variant="body2" 
                component="pre"
                sx={{ 
                  fontSize: '0.75rem',
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Suggested Actions */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lightbulb color="primary" />
              <Typography variant="subtitle2">Suggested Actions</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {errorInfo.suggestions.map((suggestion, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={suggestion} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Action Buttons */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {error.retryable && onRetry && (
            <Button 
              onClick={onRetry} 
              variant="contained" 
              startIcon={<Refresh />}
              size="small"
            >
              Retry Execution
            </Button>
          )}
          
          {onReport && (
            <Button 
              onClick={() => setReportDialogOpen(true)} 
              variant="outlined" 
              startIcon={<BugReport />}
              size="small"
            >
              Report Issue
            </Button>
          )}
        </Box>
      </Alert>

      {/* Error Report Dialog */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report Error</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Help us improve by reporting this error. Your feedback is valuable for fixing issues and improving the user experience.
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="Describe what you were trying to do"
            fullWidth
            multiline
            rows={3}
            value={report.userDescription || ''}
            onChange={(e) => setReport(prev => ({ ...prev, userDescription: e.target.value }))}
            placeholder="Please describe the steps that led to this error..."
          />

          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Error Type</FormLabel>
            <RadioGroup
              value={report.errorType}
              onChange={(e) => setReport(prev => ({ ...prev, errorType: e.target.value as any }))}
            >
              <FormControlLabel value="bug" control={<Radio />} label="System Bug" />
              <FormControlLabel value="usability" control={<Radio />} label="Usability Issue" />
              <FormControlLabel value="performance" control={<Radio />} label="Performance Problem" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>

          <TextField
            margin="dense"
            label="Email (optional)"
            fullWidth
            value={report.userEmail || ''}
            onChange={(e) => setReport(prev => ({ ...prev, userEmail: e.target.value }))}
            placeholder="your.email@example.com"
            helperText="Provide your email if you'd like updates on this issue"
          />

          <FormControlLabel
            control={
              <input
                type="checkbox"
                checked={report.includeContext}
                onChange={(e) => setReport(prev => ({ ...prev, includeContext: e.target.checked }))}
              />
            }
            label="Include error context and technical details"
            sx={{ mt: 1 }}
          />

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="caption" color="text.secondary">
            Error Code: {error.code}<br />
            Timestamp: {formatErrorTimestamp(error.timestamp)}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitReport} 
            variant="contained"
            disabled={!report.userDescription}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExecutionErrorHandler;