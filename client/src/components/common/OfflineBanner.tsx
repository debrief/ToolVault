import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  SignalWifiConnectedNoInternet4 as NoInternetIcon,
  NetworkCheck as NetworkCheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  SignalWifi4Bar as StrongSignalIcon,
  SignalWifi3Bar as GoodSignalIcon,
  SignalWifi2Bar as FairSignalIcon,
  SignalWifi1Bar as PoorSignalIcon,
} from '@mui/icons-material';
import { useNetworkStatus, useConnectionQuality } from '../../hooks/useNetworkStatus';
import { useNotification } from './NotificationProvider';

export interface OfflineBannerProps {
  showReconnectButton?: boolean;
  showConnectionQuality?: boolean;
  showReconnectAttempts?: boolean;
  dismissible?: boolean;
  persistent?: boolean;
  position?: 'top' | 'bottom';
  onReconnect?: () => void;
}

export function OfflineBanner({
  showReconnectButton = true,
  showConnectionQuality = true,
  showReconnectAttempts = true,
  dismissible = false,
  persistent = false,
  position = 'top',
  onReconnect,
}: OfflineBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  
  const networkStatus = useNetworkStatus({
    enableHeartbeat: true,
    heartbeatInterval: 10000, // Check every 10 seconds
    onReconnect: () => {
      showNotification('Connection restored', 'success', { duration: 3000 });
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 5000);
      onReconnect?.();
    },
    onOffline: () => {
      setDismissed(false); // Show banner when going offline
      showNotification('Connection lost', 'warning', { persist: true });
    },
  });

  const connectionQuality = useConnectionQuality();
  const { showNotification } = useNotification();
  const theme = useTheme();

  // Auto-dismiss reconnection message
  useEffect(() => {
    if (showReconnected) {
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showReconnected]);

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleRetry = () => {
    networkStatus.refreshNetworkStatus();
  };

  const getConnectionIcon = () => {
    if (!networkStatus.isOnline) return <WifiOffIcon />;
    
    if (showConnectionQuality) {
      switch (connectionQuality.quality) {
        case 'excellent':
          return <StrongSignalIcon />;
        case 'good':
          return <GoodSignalIcon />;
        case 'fair':
          return <FairSignalIcon />;
        case 'poor':
          return <PoorSignalIcon />;
        default:
          return <WifiIcon />;
      }
    }
    
    return <WifiIcon />;
  };

  const getSeverity = () => {
    if (!networkStatus.isOnline) return 'error';
    if (showReconnected) return 'success';
    if (connectionQuality.quality === 'poor') return 'warning';
    return 'info';
  };

  const getTitle = () => {
    if (showReconnected) return 'Connection Restored';
    if (!networkStatus.isOnline) return 'No Internet Connection';
    if (connectionQuality.quality === 'poor') return 'Slow Connection';
    return 'Connection Status';
  };

  const getMessage = () => {
    if (showReconnected) {
      return 'You\'re back online! All features are now available.';
    }
    
    if (!networkStatus.isOnline) {
      return 'Some features may not be available. We\'ll restore full functionality when your connection returns.';
    }
    
    if (connectionQuality.quality === 'poor') {
      return 'Your connection is slow. Some features may load more slowly than usual.';
    }
    
    return 'Connection is stable.';
  };

  // Don't show if dismissed (and dismissible), or if online and not showing quality info
  if (dismissed || (!showReconnected && networkStatus.isOnline && !showConnectionQuality)) {
    return null;
  }

  // Don't show if online and connection quality is good (unless persistent)
  if (!persistent && !showReconnected && networkStatus.isOnline && connectionQuality.quality !== 'poor') {
    return null;
  }

  const isOffline = !networkStatus.isOnline;

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        [position]: 0,
        zIndex: theme.zIndex.appBar + 1,
        borderRadius: 0,
      }}
    >
      <Collapse in timeout={300}>
        <Alert
          severity={getSeverity()}
          icon={getConnectionIcon()}
          sx={{
            borderRadius: 0,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
          action={
            <Stack direction="row" alignItems="center" spacing={1}>
              {showConnectionQuality && networkStatus.isOnline && (
                <Chip
                  size="small"
                  label={connectionQuality.quality}
                  color={connectionQuality.quality === 'poor' ? 'warning' : 'default'}
                  variant="outlined"
                />
              )}
              
              {showReconnectAttempts && isOffline && networkStatus.reconnectionAttempts > 0 && (
                <Chip
                  size="small"
                  label={`Attempt ${networkStatus.reconnectionAttempts}`}
                  color="error"
                  variant="outlined"
                />
              )}
              
              {showReconnectButton && isOffline && (
                <Button
                  size="small"
                  color="inherit"
                  onClick={handleRetry}
                  startIcon={<RefreshIcon />}
                >
                  Retry
                </Button>
              )}
              
              {dismissible && (
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={handleDismiss}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          }
        >
          <AlertTitle sx={{ mb: 0.5 }}>{getTitle()}</AlertTitle>
          <Typography variant="body2">
            {getMessage()}
          </Typography>
          
          {/* Show reconnection progress for offline state */}
          {isOffline && networkStatus.reconnectionAttempts > 0 && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress 
                color="inherit" 
                sx={{ 
                  height: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'currentColor',
                  },
                }} 
              />
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                Attempting to reconnect...
              </Typography>
            </Box>
          )}
          
          {/* Show connection details in development */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" component="div">
                Debug: Online: {networkStatus.isOnline ? 'Yes' : 'No'}
                {networkStatus.effectiveType && ` | Type: ${networkStatus.effectiveType}`}
                {networkStatus.downlink && ` | Speed: ${networkStatus.downlink}Mbps`}
                {networkStatus.rtt && ` | RTT: ${networkStatus.rtt}ms`}
              </Typography>
            </Box>
          )}
        </Alert>
      </Collapse>
    </Box>
  );
}

// Compact version for inline use
export function InlineOfflineIndicator() {
  const networkStatus = useNetworkStatus();
  
  if (networkStatus.isOnline) return null;
  
  return (
    <Chip
      icon={<WifiOffIcon />}
      label="Offline"
      color="error"
      size="small"
      variant="outlined"
    />
  );
}

// Network status indicator for app bar or toolbar
export function NetworkStatusIndicator({ 
  showWhenOnline = false,
  size = 'small',
}: { 
  showWhenOnline?: boolean;
  size?: 'small' | 'medium';
}) {
  const connectionQuality = useConnectionQuality();
  
  if (!showWhenOnline && connectionQuality.isOnline) return null;
  
  const getIcon = () => {
    if (!connectionQuality.isOnline) return <WifiOffIcon />;
    
    switch (connectionQuality.quality) {
      case 'excellent':
        return <StrongSignalIcon />;
      case 'good':
        return <GoodSignalIcon />;
      case 'fair':
        return <FairSignalIcon />;
      case 'poor':
        return <PoorSignalIcon />;
      default:
        return <WifiIcon />;
    }
  };

  const getColor = () => {
    if (!connectionQuality.isOnline) return 'error';
    if (connectionQuality.quality === 'poor') return 'warning';
    return 'success';
  };

  const getLabel = () => {
    if (!connectionQuality.isOnline) return 'Offline';
    return connectionQuality.quality;
  };

  return (
    <Chip
      icon={getIcon()}
      label={getLabel()}
      color={getColor()}
      size={size}
      variant="outlined"
      sx={{
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 16 : 20,
        },
      }}
    />
  );
}