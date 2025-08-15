import { useState, useEffect, useCallback } from 'react';

export interface OfflineData {
  data: any;
  timestamp: number;
  version: string;
}

export interface OfflineState {
  isOnline: boolean;
  isOfflineReady: boolean;
  pendingSync: any[];
  lastSync: number | null;
}

/**
 * Hook to provide offline support with data caching and sync capabilities
 */
export function useOfflineSupport() {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOfflineReady: false,
    pendingSync: [],
    lastSync: null,
  });

  // Cache data to localStorage with versioning
  const cacheData = useCallback((key: string, data: any, version: string = '1.0') => {
    try {
      const cacheItem: OfflineData = {
        data,
        timestamp: Date.now(),
        version,
      };
      localStorage.setItem(`offline_${key}`, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      console.warn('Failed to cache data:', error);
      return false;
    }
  }, []);

  // Retrieve cached data with age validation
  const getCachedData = useCallback((key: string, maxAge: number = 24 * 60 * 60 * 1000) => {
    try {
      const cached = localStorage.getItem(`offline_${key}`);
      if (cached) {
        const cacheItem: OfflineData = JSON.parse(cached);
        const isExpired = Date.now() - cacheItem.timestamp > maxAge;
        
        if (!isExpired) {
          return cacheItem.data;
        } else {
          // Clean up expired data
          localStorage.removeItem(`offline_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
    }
    return null;
  }, []);

  // Clear specific cached data
  const clearCachedData = useCallback((key?: string) => {
    try {
      if (key) {
        localStorage.removeItem(`offline_${key}`);
      } else {
        // Clear all offline data
        const keys = Object.keys(localStorage).filter(k => k.startsWith('offline_'));
        keys.forEach(k => localStorage.removeItem(k));
      }
    } catch (error) {
      console.warn('Failed to clear cached data:', error);
    }
  }, []);

  // Queue actions for when online
  const queueForSync = useCallback((action: any) => {
    setOfflineState(prev => ({
      ...prev,
      pendingSync: [...prev.pendingSync, { ...action, timestamp: Date.now() }],
    }));
    
    // Store in localStorage for persistence
    try {
      const existing = localStorage.getItem('pending_sync') || '[]';
      const pending = JSON.parse(existing);
      pending.push({ ...action, timestamp: Date.now() });
      localStorage.setItem('pending_sync', JSON.stringify(pending));
    } catch (error) {
      console.warn('Failed to queue sync action:', error);
    }
  }, []);

  // Process pending sync actions
  const processPendingSync = useCallback(async () => {
    if (!offlineState.isOnline || offlineState.pendingSync.length === 0) {
      return;
    }

    try {
      const pending = [...offlineState.pendingSync];
      
      // Process each pending action
      for (const action of pending) {
        try {
          // Here you would implement the actual sync logic
          // For example: await executeAction(action);
          console.log('Processing sync action:', action);
        } catch (error) {
          console.warn('Failed to sync action:', action, error);
          // Keep failed actions in queue for retry
          continue;
        }
      }

      // Clear successfully synced actions
      setOfflineState(prev => ({
        ...prev,
        pendingSync: [],
        lastSync: Date.now(),
      }));
      
      localStorage.removeItem('pending_sync');
    } catch (error) {
      console.warn('Failed to process pending sync:', error);
    }
  }, [offlineState.isOnline, offlineState.pendingSync]);

  // Initialize offline state and load pending sync
  useEffect(() => {
    try {
      const pendingSync = JSON.parse(localStorage.getItem('pending_sync') || '[]');
      const lastSync = parseInt(localStorage.getItem('last_sync') || '0') || null;
      
      setOfflineState(prev => ({
        ...prev,
        pendingSync,
        lastSync,
        isOfflineReady: true,
      }));
    } catch (error) {
      console.warn('Failed to initialize offline state:', error);
      setOfflineState(prev => ({ ...prev, isOfflineReady: true }));
    }
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: true }));
    };
    
    const handleOffline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process pending sync when coming back online
  useEffect(() => {
    if (offlineState.isOnline && offlineState.pendingSync.length > 0) {
      processPendingSync();
    }
  }, [offlineState.isOnline, processPendingSync]);

  // Get cache size and storage info
  const getCacheInfo = useCallback(() => {
    try {
      let totalSize = 0;
      let itemCount = 0;
      
      for (let key in localStorage) {
        if (key.startsWith('offline_')) {
          totalSize += localStorage[key].length;
          itemCount++;
        }
      }
      
      return {
        itemCount,
        totalSize,
        availableSpace: ('storage' in navigator && 'estimate' in navigator.storage) 
          ? navigator.storage.estimate() 
          : null,
      };
    } catch (error) {
      return { itemCount: 0, totalSize: 0, availableSpace: null };
    }
  }, []);

  return {
    ...offlineState,
    cacheData,
    getCachedData,
    clearCachedData,
    queueForSync,
    processPendingSync,
    getCacheInfo,
  };
}

/**
 * Hook to provide offline-first data fetching with automatic caching
 */
export function useOfflineFirstData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  options: {
    maxAge?: number;
    enableSync?: boolean;
  } = {}
) {
  const { maxAge = 24 * 60 * 60 * 1000, enableSync = true } = options;
  const { isOnline, cacheData, getCachedData, queueForSync } = useOfflineSupport();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get cached data first
      const cachedData = getCachedData(key, maxAge);
      
      if (cachedData && !forceRefresh) {
        setData(cachedData);
        setIsFromCache(true);
        setIsLoading(false);
        
        // If online, try to refresh in background
        if (isOnline) {
          try {
            const freshData = await fetchFunction();
            if (JSON.stringify(freshData) !== JSON.stringify(cachedData)) {
              setData(freshData);
              setIsFromCache(false);
              cacheData(key, freshData);
            }
          } catch (error) {
            // Ignore background refresh errors
            console.warn('Background refresh failed:', error);
          }
        }
        return;
      }

      // If online, fetch fresh data
      if (isOnline) {
        const freshData = await fetchFunction();
        setData(freshData);
        setIsFromCache(false);
        cacheData(key, freshData);
      } else if (cachedData) {
        // Offline but have cached data (even if expired)
        setData(cachedData);
        setIsFromCache(true);
      } else {
        // Offline and no cached data
        throw new Error('No cached data available offline');
      }
    } catch (err) {
      setError(err as Error);
      
      // Try to use cached data as fallback
      const cachedData = getCachedData(key, Infinity); // Accept any age as fallback
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, maxAge, isOnline, fetchFunction, getCachedData, cacheData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when coming back online
  useEffect(() => {
    if (isOnline && isFromCache) {
      loadData(true);
    }
  }, [isOnline, isFromCache, loadData]);

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refresh: () => loadData(true),
    isOnline,
  };
}