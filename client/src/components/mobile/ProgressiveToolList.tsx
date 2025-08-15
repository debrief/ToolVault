import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Skeleton } from '@mui/material';
import { useConnectionOptimization } from '../../hooks/useConnectionAware';
import { useResponsive } from '../../theme/responsive';
import { ResponsiveToolList } from '../layout/ResponsiveToolList';
import type { Tool } from '../../types';

interface ProgressiveToolListProps {
  tools: Tool[];
  onViewDetails: (tool: Tool) => void;
  onBookmark?: (tool: Tool) => void;
  bookmarkedTools?: string[];
  initialBatchSize?: number;
}

/**
 * Progressive loading tool list that adapts to connection speed and device capabilities
 */
export function ProgressiveToolList({
  tools,
  onViewDetails,
  onBookmark,
  bookmarkedTools = [],
  initialBatchSize,
}: ProgressiveToolListProps) {
  const { getBatchSize, shouldOptimize, connectionType } = useConnectionOptimization();
  const { isMobile } = useResponsive();
  
  const [visibleCount, setVisibleCount] = useState(() => {
    const defaultBatch = initialBatchSize || (isMobile ? 8 : 16);
    return getBatchSize(defaultBatch);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get visible tools
  const visibleTools = tools.slice(0, visibleCount);
  const hasMore = visibleCount < tools.length;
  const remainingCount = tools.length - visibleCount;

  // Calculate next batch size based on connection
  const getNextBatchSize = useCallback(() => {
    if (shouldOptimize) {
      return getBatchSize(3); // Very small batches for slow connections
    }
    if (connectionType === '3g') {
      return getBatchSize(6);
    }
    return getBatchSize(12);
  }, [shouldOptimize, connectionType, getBatchSize]);

  // Load more tools with progressive enhancement
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      // Simulate network delay based on connection type
      const delay = shouldOptimize ? 800 : connectionType === '3g' ? 400 : 200;
      
      loadTimeoutRef.current = setTimeout(() => {
        const nextBatch = getNextBatchSize();
        setVisibleCount(prev => Math.min(prev + nextBatch, tools.length));
        setIsLoading(false);
      }, delay);
      
    } catch (error) {
      setLoadError('Failed to load more tools. Please try again.');
      setIsLoading(false);
    }
  }, [isLoading, hasMore, shouldOptimize, connectionType, getNextBatchSize, tools.length]);

  // Intersection observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '100px', // Start loading before element is visible
        threshold: 0.1,
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  // Preload next batch if connection is good
  useEffect(() => {
    if (!shouldOptimize && hasMore && !isLoading) {
      const preloadDelay = setTimeout(() => {
        if (visibleCount < tools.length * 0.7) { // Preload up to 70% of tools
          loadMore();
        }
      }, 1000);

      return () => clearTimeout(preloadDelay);
    }
  }, [shouldOptimize, hasMore, isLoading, visibleCount, tools.length, loadMore]);

  // Loading skeleton for initial load
  const LoadingSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: getBatchSize(isMobile ? 4 : 8) }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={isMobile ? 120 : 200} sx={{ borderRadius: 2 }} />
          <Box sx={{ pt: 1 }}>
            <Skeleton width="60%" />
            <Skeleton width="80%" />
          </Box>
        </Box>
      ))}
    </Box>
  );

  // Connection indicator
  const ConnectionIndicator = () => {
    if (!shouldOptimize) return null;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 1,
          mb: 2,
          backgroundColor: 'warning.light',
          borderRadius: 1,
          color: 'warning.contrastText',
        }}
      >
        <Typography variant="caption">
          {connectionType === 'slow-2g' || connectionType === '2g'
            ? 'Slow connection detected - loading optimized'
            : 'Data saver mode - loading efficiently'}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <ConnectionIndicator />
      
      {visibleTools.length === 0 ? (
        <LoadingSkeleton />
      ) : (
        <ResponsiveToolList
          onViewDetails={onViewDetails}
          onBookmark={onBookmark}
          bookmarkedTools={bookmarkedTools}
        />
      )}

      {/* Load More Section */}
      {hasMore && (
        <Box
          ref={loadMoreRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            gap: 2,
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Loading {getNextBatchSize()} more tools...
              </Typography>
            </>
          ) : loadError ? (
            <>
              <Typography variant="body2" color="error" gutterBottom>
                {loadError}
              </Typography>
              <Button
                variant="outlined"
                onClick={loadMore}
                size="small"
              >
                Retry
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              onClick={loadMore}
              disabled={isLoading}
              sx={{
                minWidth: 200,
                borderRadius: 3,
              }}
            >
              Load {Math.min(getNextBatchSize(), remainingCount)} more tools
              {shouldOptimize && (
                <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                  ({remainingCount} remaining)
                </Typography>
              )}
            </Button>
          )}
        </Box>
      )}

      {/* End of results */}
      {!hasMore && tools.length > 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            You've seen all {tools.length} tools
          </Typography>
        </Box>
      )}

      {/* Performance info for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: 1,
            borderRadius: 1,
            fontSize: '0.75rem',
            zIndex: 9999,
          }}
        >
          <div>Connection: {connectionType}</div>
          <div>Should Optimize: {shouldOptimize ? 'Yes' : 'No'}</div>
          <div>Visible: {visibleCount}/{tools.length}</div>
          <div>Batch Size: {getNextBatchSize()}</div>
        </Box>
      )}
    </Box>
  );
}