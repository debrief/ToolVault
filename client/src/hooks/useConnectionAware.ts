import { useState, useEffect, useCallback } from 'react';

// Network connection types
export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

export interface NetworkConnection {
  effectiveType: ConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface ConnectionAwareState {
  connectionType: ConnectionType;
  isOnline: boolean;
  saveData: boolean;
  isSlowConnection: boolean;
  shouldOptimize: boolean;
  downlink: number;
  rtt: number;
}

/**
 * Hook to detect network connection characteristics and adapt behavior accordingly
 */
export function useConnectionAware(): ConnectionAwareState {
  const [connectionState, setConnectionState] = useState<ConnectionAwareState>({
    connectionType: 'unknown',
    isOnline: navigator.onLine,
    saveData: false,
    isSlowConnection: false,
    shouldOptimize: false,
    downlink: 0,
    rtt: 0,
  });

  const updateConnectionInfo = useCallback(() => {
    const isOnline = navigator.onLine;
    
    // Default values
    let connectionType: ConnectionType = 'unknown';
    let saveData = false;
    let downlink = 0;
    let rtt = 0;

    // Check for Network Information API support
    if ('connection' in navigator) {
      const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
      
      if (connection) {
        connectionType = connection.effectiveType || 'unknown';
        saveData = connection.saveData || false;
        downlink = connection.downlink || 0;
        rtt = connection.rtt || 0;
      }
    }

    // Check for Data Saver API
    if ('connection' in navigator && (navigator as any).connection?.saveData) {
      saveData = true;
    }

    const isSlowConnection = ['slow-2g', '2g'].includes(connectionType);
    const shouldOptimize = saveData || isSlowConnection || !isOnline;

    setConnectionState({
      connectionType,
      isOnline,
      saveData,
      isSlowConnection,
      shouldOptimize,
      downlink,
      rtt,
    });
  }, []);

  useEffect(() => {
    // Initial connection check
    updateConnectionInfo();

    // Listen for online/offline events
    const handleOnline = () => updateConnectionInfo();
    const handleOffline = () => updateConnectionInfo();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', updateConnectionInfo);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', updateConnectionInfo);
        }
      }
    };
  }, [updateConnectionInfo]);

  return connectionState;
}

/**
 * Hook to get connection-aware loading strategies
 */
export function useConnectionOptimization() {
  const connection = useConnectionAware();

  const getImageQuality = useCallback(() => {
    if (connection.shouldOptimize) return 'low';
    if (connection.connectionType === '3g') return 'medium';
    return 'high';
  }, [connection]);

  const getBatchSize = useCallback((defaultSize: number = 20) => {
    if (connection.isSlowConnection) return Math.max(5, Math.floor(defaultSize / 4));
    if (connection.saveData) return Math.max(8, Math.floor(defaultSize / 2));
    return defaultSize;
  }, [connection]);

  const shouldPreload = useCallback(() => {
    return !connection.shouldOptimize && connection.connectionType !== '3g';
  }, [connection]);

  const getRetryDelay = useCallback((attempt: number = 1) => {
    const baseDelay = 1000;
    if (connection.isSlowConnection) return baseDelay * Math.pow(2, attempt) * 2;
    if (connection.connectionType === '3g') return baseDelay * Math.pow(2, attempt) * 1.5;
    return baseDelay * Math.pow(2, attempt);
  }, [connection]);

  return {
    ...connection,
    getImageQuality,
    getBatchSize,
    shouldPreload,
    getRetryDelay,
  };
}