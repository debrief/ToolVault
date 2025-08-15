import { useState, useEffect, useCallback, useRef } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  downlink?: number; // Connection downlink speed in Mbps
  effectiveType?: string; // Connection effective type (4g, 3g, etc.)
  rtt?: number; // Round-trip time in ms
  saveData?: boolean; // Data saver mode
  lastOnlineTime?: Date;
  lastOfflineTime?: Date;
  reconnectionAttempts: number;
}

export interface UseNetworkStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  onReconnect?: () => void;
  heartbeatUrl?: string;
  heartbeatInterval?: number;
  enableHeartbeat?: boolean;
  maxReconnectionAttempts?: number;
}

export function useNetworkStatus(options: UseNetworkStatusOptions = {}) {
  const {
    onOnline,
    onOffline,
    onReconnect,
    heartbeatUrl = '/api/health',
    heartbeatInterval = 30000, // 30 seconds
    enableHeartbeat = false,
    maxReconnectionAttempts = 5,
  } = options;

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => {
    const connection = getConnectionInfo();
    return {
      isOnline: navigator.onLine,
      wasOffline: false,
      ...connection,
      reconnectionAttempts: 0,
    };
  });

  const heartbeatTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatControllerRef = useRef<AbortController>();

  // Get connection information from navigator
  function getConnectionInfo() {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    
    return {};
  }

  // Perform heartbeat check
  const performHeartbeat = useCallback(async () => {
    if (!enableHeartbeat) return true;

    try {
      // Cancel previous heartbeat if still running
      if (heartbeatControllerRef.current) {
        heartbeatControllerRef.current.abort();
      }

      heartbeatControllerRef.current = new AbortController();
      
      const response = await fetch(heartbeatUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: heartbeatControllerRef.current.signal,
        timeout: 10000, // 10 second timeout
      } as RequestInit);

      return response.ok;
    } catch (error) {
      // Network error or request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return true; // Don't treat aborted requests as network failures
      }
      return false;
    }
  }, [enableHeartbeat, heartbeatUrl]);

  // Schedule next heartbeat
  const scheduleHeartbeat = useCallback(() => {
    if (!enableHeartbeat || !networkStatus.isOnline) return;

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setTimeout(async () => {
      const isConnected = await performHeartbeat();
      
      if (!isConnected && networkStatus.isOnline) {
        // Heartbeat failed but browser thinks we're online
        // Trigger offline event manually
        setNetworkStatus(prev => ({
          ...prev,
          isOnline: false,
          wasOffline: true,
          lastOfflineTime: new Date(),
        }));
        
        onOffline?.();
        scheduleReconnectionAttempt();
      } else if (isConnected) {
        // Reset reconnection attempts on successful heartbeat
        setNetworkStatus(prev => ({
          ...prev,
          reconnectionAttempts: 0,
        }));
        scheduleHeartbeat();
      }
    }, heartbeatInterval);
  }, [enableHeartbeat, networkStatus.isOnline, heartbeatInterval, performHeartbeat, onOffline]);

  // Schedule reconnection attempt
  const scheduleReconnectionAttempt = useCallback(() => {
    if (networkStatus.reconnectionAttempts >= maxReconnectionAttempts) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, networkStatus.reconnectionAttempts), 30000); // Exponential backoff, max 30s
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(async () => {
      const isConnected = await performHeartbeat();
      
      setNetworkStatus(prev => ({
        ...prev,
        reconnectionAttempts: prev.reconnectionAttempts + 1,
      }));

      if (isConnected) {
        // Successfully reconnected
        setNetworkStatus(prev => ({
          ...prev,
          isOnline: true,
          reconnectionAttempts: 0,
          lastOnlineTime: new Date(),
        }));
        
        onReconnect?.();
        scheduleHeartbeat();
      } else {
        // Still offline, try again
        scheduleReconnectionAttempt();
      }
    }, delay);
  }, [networkStatus.reconnectionAttempts, maxReconnectionAttempts, performHeartbeat, onReconnect, scheduleHeartbeat]);

  // Handle online event
  const handleOnline = useCallback(() => {
    const connection = getConnectionInfo();
    const wasOffline = networkStatus.wasOffline;
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: true,
      wasOffline: false,
      ...connection,
      lastOnlineTime: new Date(),
      reconnectionAttempts: 0,
    }));

    if (wasOffline) {
      onReconnect?.();
    }
    
    onOnline?.();
    scheduleHeartbeat();
  }, [networkStatus.wasOffline, onOnline, onReconnect, scheduleHeartbeat]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    const connection = getConnectionInfo();
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: false,
      wasOffline: true,
      ...connection,
      lastOfflineTime: new Date(),
    }));

    onOffline?.();
    
    // Cancel any pending heartbeat
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    
    // Start reconnection attempts
    if (enableHeartbeat) {
      scheduleReconnectionAttempt();
    }
  }, [onOffline, enableHeartbeat, scheduleReconnectionAttempt]);

  // Handle connection change
  const handleConnectionChange = useCallback(() => {
    const connection = getConnectionInfo();
    
    setNetworkStatus(prev => ({
      ...prev,
      ...connection,
    }));
  }, []);

  // Force refresh network status
  const refreshNetworkStatus = useCallback(async () => {
    const connection = getConnectionInfo();
    const isConnected = await performHeartbeat();
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine && isConnected,
      ...connection,
    }));
  }, [performHeartbeat]);

  // Setup event listeners
  useEffect(() => {
    // Browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Connection change events
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Start heartbeat if enabled and online
    if (enableHeartbeat && navigator.onLine) {
      scheduleHeartbeat();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }

      // Clean up timeouts
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Cancel any pending heartbeat
      if (heartbeatControllerRef.current) {
        heartbeatControllerRef.current.abort();
      }
    };
  }, [handleOnline, handleOffline, handleConnectionChange, enableHeartbeat, scheduleHeartbeat]);

  return {
    ...networkStatus,
    refreshNetworkStatus,
  };
}

// Simple hook for basic online/offline detection
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Hook for connection quality assessment
export function useConnectionQuality() {
  const networkStatus = useNetworkStatus();

  const getConnectionQuality = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' => {
    if (!networkStatus.isOnline) return 'offline';
    
    const { effectiveType, downlink, rtt } = networkStatus;
    
    // Use effective type if available
    if (effectiveType) {
      switch (effectiveType) {
        case '4g':
          return 'excellent';
        case '3g':
          return 'good';
        case '2g':
          return 'fair';
        case 'slow-2g':
          return 'poor';
        default:
          break;
      }
    }
    
    // Use downlink and RTT if available
    if (typeof downlink === 'number' && typeof rtt === 'number') {
      if (downlink >= 10 && rtt <= 100) return 'excellent';
      if (downlink >= 5 && rtt <= 200) return 'good';
      if (downlink >= 1.5 && rtt <= 500) return 'fair';
      return 'poor';
    }
    
    // Default to good if we can't determine quality
    return 'good';
  }, [networkStatus]);

  return {
    ...networkStatus,
    quality: getConnectionQuality(),
  };
}