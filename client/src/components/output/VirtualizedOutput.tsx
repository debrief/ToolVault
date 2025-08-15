/**
 * Performance optimization components with virtualization for large datasets
 */

import React, { useMemo, useState, useCallback, Suspense } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip,
  Paper,
} from '@mui/material';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import type { VirtualizedOutputProps, PerformanceConfig } from '../../types/output';

// Performance monitoring hook
const usePerformanceMonitor = (dataLength: number) => {
  const [renderTime, setRenderTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  const startMeasurement = useCallback(() => {
    const start = performance.now();
    
    // Monitor memory usage if available
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      setMemoryUsage(memInfo.usedJSHeapSize / 1024 / 1024); // MB
    }

    return () => {
      const end = performance.now();
      setRenderTime(end - start);
    };
  }, []);

  return {
    renderTime,
    memoryUsage,
    startMeasurement,
    dataLength,
  };
};

// Virtualized list component
export const VirtualizedOutput: React.FC<VirtualizedOutputProps> = ({
  data,
  itemHeight = 50,
  overscan = 5,
  renderItem,
  height = 400,
}) => {
  const virtuosoRef = React.useRef<VirtuosoHandle>(null);
  const { renderTime, memoryUsage, startMeasurement, dataLength } = usePerformanceMonitor(data.length);

  // Memoized item renderer for performance
  const memoizedItemRenderer = useCallback((index: number, item: any) => {
    const endMeasurement = startMeasurement();
    const result = renderItem(item, index);
    endMeasurement();
    return result;
  }, [renderItem, startMeasurement]);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info">
          <Typography variant="body2">
            No data available for virtualization.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%', position: 'relative' }}>
      {/* Performance Metrics */}
      <Box sx={{ 
        position: 'absolute', 
        top: 5, 
        right: 5, 
        zIndex: 1,
        display: 'flex',
        gap: 0.5
      }}>
        <Chip
          size="small"
          label={`${dataLength.toLocaleString()} items`}
          variant="outlined"
          color="primary"
        />
        {renderTime > 0 && (
          <Chip
            size="small"
            label={`${renderTime.toFixed(1)}ms`}
            variant="outlined"
            color="secondary"
          />
        )}
        {memoryUsage > 0 && (
          <Chip
            size="small"
            label={`${memoryUsage.toFixed(1)}MB`}
            variant="outlined"
            color="info"
          />
        )}
      </Box>

      {/* Virtualized List */}
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: '100%' }}
        data={data}
        itemContent={memoizedItemRenderer}
        fixedItemHeight={itemHeight}
        overscan={overscan}
        components={{
          Header: () => (
            <Box sx={{ p: 1, backgroundColor: 'grey.50', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary">
                Showing {data.length.toLocaleString()} items (virtualized)
              </Typography>
            </Box>
          ),
          Footer: () => (
            <Box sx={{ p: 1, backgroundColor: 'grey.50', borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary" align="center">
                End of list
              </Typography>
            </Box>
          ),
          EmptyPlaceholder: () => (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Typography variant="body2" color="text.secondary">
                No items to display
              </Typography>
            </Box>
          ),
        }}
      />
    </Box>
  );
};

// Optimized output renderer with performance controls
export const OptimizedOutputRenderer: React.FC<{
  data: any;
  renderComponent: React.ComponentType<any>;
  performanceConfig?: PerformanceConfig;
  [key: string]: any;
}> = ({
  data,
  renderComponent: Component,
  performanceConfig = {},
  ...props
}) => {
  const [enableVirtualization, setEnableVirtualization] = useState(
    performanceConfig.enableVirtualization ?? true
  );
  const [enableLazyLoading, setEnableLazyLoading] = useState(
    performanceConfig.lazyLoading ?? true
  );
  
  const {
    maxRenderItems = 1000,
    chunkSize = 100,
  } = performanceConfig;

  // Determine if we should use performance optimizations
  const shouldOptimize = useMemo(() => {
    if (Array.isArray(data)) {
      return data.length > maxRenderItems;
    }
    if (typeof data === 'string') {
      return data.length > 50000; // Large text
    }
    return false;
  }, [data, maxRenderItems]);

  // Chunked data processing for large datasets
  const processedData = useMemo(() => {
    if (!shouldOptimize || !Array.isArray(data)) {
      return data;
    }

    if (enableVirtualization) {
      return data; // Let virtualization handle it
    }

    // Chunk the data for progressive rendering
    return data.slice(0, maxRenderItems);
  }, [data, shouldOptimize, enableVirtualization, maxRenderItems]);

  const LoadingFallback = () => (
    <Box sx={{ 
      height: props.height || 400, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 2
    }}>
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        Loading optimized renderer...
      </Typography>
    </Box>
  );

  if (shouldOptimize) {
    return (
      <Box sx={{ width: '100%' }}>
        {/* Performance Controls */}
        <Paper sx={{ p: 1, mb: 1, backgroundColor: 'warning.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Large dataset detected ({Array.isArray(data) ? data.length.toLocaleString() : 'Large'} items)
              </Typography>
              <Chip
                size="small"
                label="Performance Mode"
                color="warning"
                variant="filled"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {Array.isArray(data) && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableVirtualization}
                      onChange={(e) => setEnableVirtualization(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Virtualization"
                />
              )}
              
              <FormControlLabel
                control={
                  <Switch
                    checked={enableLazyLoading}
                    onChange={(e) => setEnableLazyLoading(e.target.checked)}
                    size="small"
                  />
                }
                label="Lazy Loading"
              />
            </Box>
          </Box>
        </Paper>

        {/* Optimized Renderer */}
        {enableLazyLoading ? (
          <Suspense fallback={<LoadingFallback />}>
            <Component data={processedData} {...props} />
          </Suspense>
        ) : (
          <Component data={processedData} {...props} />
        )}
      </Box>
    );
  }

  // Standard rendering for smaller datasets
  return enableLazyLoading ? (
    <Suspense fallback={<LoadingFallback />}>
      <Component data={data} {...props} />
    </Suspense>
  ) : (
    <Component data={data} {...props} />
  );
};

// Memory-efficient data processor for large objects
export const useOptimizedData = <T,>(
  data: T[],
  config: PerformanceConfig = {}
): {
  processedData: T[];
  isOptimized: boolean;
  metrics: {
    originalSize: number;
    processedSize: number;
    memoryReduction: number;
  };
} => {
  return useMemo(() => {
    const originalSize = data.length;
    const maxItems = config.maxRenderItems || 1000;
    
    if (originalSize <= maxItems) {
      return {
        processedData: data,
        isOptimized: false,
        metrics: {
          originalSize,
          processedSize: originalSize,
          memoryReduction: 0,
        },
      };
    }

    // Optimize large datasets
    const processedData = data.slice(0, maxItems);
    const memoryReduction = ((originalSize - maxItems) / originalSize) * 100;

    return {
      processedData,
      isOptimized: true,
      metrics: {
        originalSize,
        processedSize: maxItems,
        memoryReduction,
      },
    };
  }, [data, config.maxRenderItems]);
};

// Progressive loading hook for incremental data rendering
export const useProgressiveLoading = <T,>(
  data: T[],
  chunkSize = 50,
  delay = 100
): {
  visibleData: T[];
  isLoading: boolean;
  loadMore: () => void;
  hasMore: boolean;
} => {
  const [visibleCount, setVisibleCount] = useState(chunkSize);
  const [isLoading, setIsLoading] = useState(false);

  const visibleData = useMemo(() => {
    return data.slice(0, visibleCount);
  }, [data, visibleCount]);

  const hasMore = visibleCount < data.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + chunkSize, data.length));
      setIsLoading(false);
    }, delay);
  }, [isLoading, hasMore, chunkSize, delay, data.length]);

  return {
    visibleData,
    isLoading,
    loadMore,
    hasMore,
  };
};

export default VirtualizedOutput;