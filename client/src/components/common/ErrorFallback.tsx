import React, { ErrorInfo } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
  Stack,
} from '@mui/material';
import {
  ErrorOutline as ErrorOutlineIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';

export interface ErrorFallbackProps {
  error: Error;
  retry?: () => void;
  errorInfo?: ErrorInfo | null;
  eventId?: string | null;
}

export function ErrorFallback({ 
  error, 
  retry, 
  errorInfo, 
  eventId 
}: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRetry = () => {
    if (retry) {
      retry();
    } else {
      // Fallback to page reload if no retry function provided
      handleReload();
    }
  };

  const isNetworkError = error.name === 'NetworkError' || 
    error.message.includes('fetch') || 
    error.message.includes('network');

  const isChunkLoadError = error.message.includes('Loading chunk') ||
    error.message.includes('Loading CSS chunk');

  const getErrorType = () => {
    if (isNetworkError) return 'Network Error';
    if (isChunkLoadError) return 'Loading Error';
    return 'Application Error';
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    }
    if (isChunkLoadError) {
      return 'Failed to load application resources. This usually happens after an update. Please refresh the page.';
    }
    return 'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.';
  };

  const getActionButtons = () => {
    if (isChunkLoadError) {
      return (
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleReload}
            startIcon={<RefreshIcon />}
            size="large"
          >
            Refresh Page
          </Button>
          <Button
            variant="outlined"
            onClick={handleGoHome}
            startIcon={<HomeIcon />}
            size="large"
          >
            Go Home
          </Button>
        </Stack>
      );
    }

    return (
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={handleRetry}
          startIcon={<RefreshIcon />}
          size="large"
        >
          {retry ? 'Try Again' : 'Reload Page'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleGoHome}
          startIcon={<HomeIcon />}
          size="large"
        >
          Go Home
        </Button>
      </Stack>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: '50vh' }}>
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <ErrorOutlineIcon 
          sx={{ 
            fontSize: 80, 
            color: 'error.main', 
            mb: 3,
            opacity: 0.8 
          }} 
        />
        
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
          Oops! Something went wrong
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
          {getErrorType()}
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
        >
          {getErrorMessage()}
        </Typography>

        {eventId && (
          <Alert 
            severity="info" 
            sx={{ mb: 3, textAlign: 'left', maxWidth: 500, mx: 'auto' }}
          >
            <AlertTitle>Error ID</AlertTitle>
            Reference this ID when contacting support: <code>{eventId}</code>
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          {getActionButtons()}
        </Box>

        {/* Development-only error details */}
        {process.env.NODE_ENV === 'development' && (
          <Accordion 
            sx={{ 
              textAlign: 'left', 
              maxWidth: 800, 
              mx: 'auto',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReportIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Error Details (Development Only)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Error Message:
                  </Typography>
                  <Typography 
                    component="pre" 
                    sx={{ 
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      bgcolor: 'background.paper',
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {error.message}
                  </Typography>
                </Box>

                {error.stack && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Stack Trace:
                    </Typography>
                    <Typography 
                      component="pre" 
                      sx={{ 
                        fontSize: '0.75rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        bgcolor: 'background.paper',
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      {error.stack}
                    </Typography>
                  </Box>
                )}

                {errorInfo && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Component Stack:
                    </Typography>
                    <Typography 
                      component="pre" 
                      sx={{ 
                        fontSize: '0.75rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        bgcolor: 'background.paper',
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      {errorInfo.componentStack}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Production-only support message */}
        {process.env.NODE_ENV === 'production' && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              If this problem continues, please contact our support team with the error ID above.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

// Simple error fallback for minimal cases
export function SimpleErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 200,
        p: 3,
        textAlign: 'center' 
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {error.message}
      </Typography>
      <Button 
        variant="outlined" 
        onClick={retry || (() => window.location.reload())}
        size="small"
      >
        Try again
      </Button>
    </Box>
  );
}