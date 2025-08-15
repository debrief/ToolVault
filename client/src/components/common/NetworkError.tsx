import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  WifiOff as WifiOffIcon,
  SignalWifiConnectedNoInternet4 as NoInternetIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export interface NetworkErrorProps {
  onRetry: () => void | Promise<void>;
  error?: Error;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  title?: string;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
  variant?: 'standard' | 'filled' | 'outlined';
  showRetryCount?: boolean;
  autoRetry?: boolean;
  autoRetryDelay?: number;
}

export function NetworkError({
  onRetry,
  error,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  title,
  message,
  severity = 'error',
  variant = 'standard',
  showRetryCount = true,
  autoRetry = false,
  autoRetryDelay = 5000,
}: NetworkErrorProps) {
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);

  // Auto-retry functionality
  React.useEffect(() => {
    if (autoRetry && !isRetrying && retryCount < maxRetries) {
      let countdown = Math.floor(autoRetryDelay / 1000);
      setAutoRetryCountdown(countdown);

      const countdownInterval = setInterval(() => {
        countdown--;
        setAutoRetryCountdown(countdown);

        if (countdown <= 0) {
          clearInterval(countdownInterval);
          setAutoRetryCountdown(null);
          onRetry();
        }
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
        setAutoRetryCountdown(null);
      };
    }
  }, [autoRetry, isRetrying, retryCount, maxRetries, autoRetryDelay, onRetry]);

  const getErrorType = () => {
    if (!error) return 'network';
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'network';
    }
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      return 'timeout';
    }
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'not-found';
    }
    if (error.message.includes('500') || error.message.includes('Internal Server')) {
      return 'server';
    }
    return 'unknown';
  };

  const getIcon = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case 'network':
        return <WifiOffIcon />;
      case 'timeout':
        return <NoInternetIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  const getDefaultTitle = () => {
    if (title) return title;
    
    const errorType = getErrorType();
    switch (errorType) {
      case 'network':
        return 'Connection Problem';
      case 'timeout':
        return 'Request Timeout';
      case 'not-found':
        return 'Not Found';
      case 'server':
        return 'Server Error';
      default:
        return 'Network Error';
    }
  };

  const getDefaultMessage = () => {
    if (message) return message;
    
    const errorType = getErrorType();
    switch (errorType) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case 'timeout':
        return 'The request took too long to complete. Please try again.';
      case 'not-found':
        return 'The requested resource could not be found.';
      case 'server':
        return 'The server encountered an error. Please try again later.';
      default:
        return 'A network error occurred. Please check your connection and try again.';
    }
  };

  const handleRetry = async () => {
    if (isRetrying) return;
    
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const canRetry = retryCount < maxRetries && !isRetrying;

  return (
    <Alert
      severity={severity}
      variant={variant}
      icon={getIcon()}
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          {showRetryCount && retryCount > 0 && (
            <Chip
              size="small"
              label={`${retryCount}/${maxRetries}`}
              color={retryCount >= maxRetries ? 'error' : 'default'}
              variant="outlined"
            />
          )}
          
          {canRetry && (
            <Button
              color="inherit"
              size="small"
              onClick={handleRetry}
              disabled={isRetrying}
              startIcon={
                isRetrying ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon />
                )
              }
            >
              {autoRetryCountdown !== null
                ? `Retry in ${autoRetryCountdown}s`
                : isRetrying
                ? 'Retrying...'
                : 'Retry'}
            </Button>
          )}
          
          {retryCount >= maxRetries && (
            <Typography variant="caption" color="text.secondary">
              Max retries reached
            </Typography>
          )}
        </Stack>
      }
      sx={{ width: '100%' }}
    >
      <AlertTitle>{getDefaultTitle()}</AlertTitle>
      {getDefaultMessage()}
      
      {error && process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
            Debug: {error.message}
          </Typography>
        </Box>
      )}
    </Alert>
  );
}

// Inline network error for smaller spaces
export function InlineNetworkError({
  onRetry,
  error,
  isRetrying = false,
  message = 'Failed to load data',
}: Pick<NetworkErrorProps, 'onRetry' | 'error' | 'isRetrying' | 'message'>) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 2,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <WifiOffIcon fontSize="small" />
      <Typography variant="body2">{message}</Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={onRetry}
        disabled={isRetrying}
        startIcon={isRetrying ? <CircularProgress size={16} /> : <RefreshIcon />}
      >
        {isRetrying ? 'Retrying...' : 'Retry'}
      </Button>
    </Box>
  );
}

// Network error for full page scenarios
export function PageNetworkError({
  onRetry,
  error,
  isRetrying = false,
  title = 'Unable to Load Page',
  message = 'Please check your internet connection and try again.',
}: Pick<NetworkErrorProps, 'onRetry' | 'error' | 'isRetrying' | 'title' | 'message'>) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        p: 4,
        textAlign: 'center',
      }}
    >
      <WifiOffIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
        {message}
      </Typography>
      <Button
        variant="contained"
        onClick={onRetry}
        disabled={isRetrying}
        startIcon={isRetrying ? <CircularProgress size={20} /> : <RefreshIcon />}
        size="large"
      >
        {isRetrying ? 'Retrying...' : 'Try Again'}
      </Button>
      
      {error && process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: 600 }}>
          <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
            Debug: {error.message}
          </Typography>
        </Box>
      )}
    </Box>
  );
}