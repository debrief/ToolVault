import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Collapse,
  Badge,
  useTheme,
} from '@mui/material';
import {
  GridView,
  ViewList,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchToolVaultIndex } from '../../services/toolVaultService';
import { useResponsive } from '../../theme/responsive';
import { useConnectionOptimization } from '../../hooks/useConnectionAware';
import { usePullToRefresh } from '../../hooks/useSwipeGestures';
import { TouchInteractions, TouchScrollArea } from '../mobile/TouchInteractions';
import { SwipeableToolCard } from '../mobile/SwipeableToolCard';
import { ToolCard } from '../tools/ToolCard';
import { 
  filterTools, 
  sortTools, 
  getUniqueCategories, 
  getUniqueTags,
  type SearchFilters,
  type SortOption,
} from '../../utils/searchUtils';
import type { Tool } from '../../types/index';

interface ResponsiveToolListProps {
  onViewDetails: (tool: Tool) => void;
  onBookmark?: (tool: Tool) => void;
  bookmarkedTools?: string[];
  searchFilters?: SearchFilters;
  sortOption?: SortOption;
  onFiltersChange?: (filters: SearchFilters) => void;
  onSortChange?: (sort: SortOption) => void;
}

export const ResponsiveToolList = memo<ResponsiveToolListProps>(({ 
  onViewDetails,
  onBookmark,
  bookmarkedTools = [],
  searchFilters = { query: '' },
  sortOption = { field: 'name', direction: 'asc' },
  onFiltersChange,
  onSortChange,
}: ResponsiveToolListProps) => {
  const theme = useTheme();
  const { isMobile, isTablet, isDesktop, getColumns, getSpacing } = useResponsive();
  const { getBatchSize, shouldPreload } = useConnectionOptimization();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobile ? 'list' : 'grid');
  const [visibleCount, setVisibleCount] = useState(() => getBatchSize(isMobile ? 10 : 20));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  const scrollRef = useRef<HTMLElement>(null);

  const { data: toolVaultData, isLoading, error, refetch } = useQuery({
    queryKey: ['toolVaultIndex'],
    queryFn: fetchToolVaultIndex,
  });

  const tools = toolVaultData?.tools || [];
  
  // Memoize filtered and sorted tools
  const filteredAndSortedTools = useMemo(() => {
    const filtered = filterTools(tools, searchFilters);
    return sortTools(filtered, sortOption);
  }, [tools, searchFilters, sortOption]);

  // Get visible tools with pagination
  const visibleTools = useMemo(() => {
    return filteredAndSortedTools.slice(0, visibleCount);
  }, [filteredAndSortedTools, visibleCount]);

  // Pull to refresh functionality
  const pullToRefreshHandlers = usePullToRefresh(
    async () => {
      await refetch();
    },
    { disabled: !isMobile }
  );

  // Load more tools
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || visibleCount >= filteredAndSortedTools.length) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setVisibleCount(prev => prev + getBatchSize(isMobile ? 5 : 12));
    setIsLoadingMore(false);
  }, [isLoadingMore, visibleCount, filteredAndSortedTools.length, getBatchSize, isMobile]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;
      
      if (isNearBottom && visibleCount < filteredAndSortedTools.length) {
        handleLoadMore();
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleLoadMore, isLoadingMore, visibleCount, filteredAndSortedTools.length]);

  // View mode handlers
  const handleViewModeChange = useCallback((event: React.MouseEvent<HTMLElement>, newMode: 'grid' | 'list' | null) => {
    if (newMode) {
      setViewMode(newMode);
    }
  }, []);

  // Get responsive grid columns
  const getGridColumns = useCallback(() => {
    if (viewMode === 'list') return 1;
    return getColumns(1, 2, 3);
  }, [viewMode, getColumns]);

  // Get card height based on view mode and device
  const getCardHeight = useCallback(() => {
    if (viewMode === 'list') return 'auto';
    if (isMobile) return 200;
    if (isTablet) return 240;
    return 280;
  }, [viewMode, isMobile, isTablet]);

  // Filter summary for mobile
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (searchFilters.category) count++;
    if (searchFilters.tags && searchFilters.tags.length > 0) count += searchFilters.tags.length;
    return count;
  }, [searchFilters]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading tools...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Error loading tools: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <TouchInteractions>
      <Box sx={{ width: '100%', height: '100%' }}>
        {/* Mobile Header with Filters Toggle */}
        {isMobile && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2,
            px: 1,
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tools ({filteredAndSortedTools.length})
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                size="small"
                sx={{ position: 'relative' }}
              >
                <FilterListIcon />
                {getActiveFilterCount() > 0 && (
                  <Badge
                    badgeContent={getActiveFilterCount()}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                    }}
                  />
                )}
              </IconButton>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                sx={{ ml: 1 }}
              >
                <ToggleButton value="list" aria-label="list view">
                  <ViewList fontSize="small" />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="grid view">
                  <GridView fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        )}

        {/* Desktop View Mode Controls */}
        {!isMobile && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Tools ({filteredAndSortedTools.length})
            </Typography>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridView />
                <Typography variant="caption" sx={{ ml: 1 }}>Grid</Typography>
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewList />
                <Typography variant="caption" sx={{ ml: 1 }}>List</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Mobile Filters Collapse */}
        {isMobile && (
          <Collapse in={filtersExpanded}>
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 2 }}>
              {/* Add mobile filter components here */}
              <Typography variant="body2" color="text.secondary">
                Filters panel - implement mobile-optimized filters
              </Typography>
            </Box>
          </Collapse>
        )}

        {/* Results Summary */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: getSpacing(2, 2, 3) }}
        >
          {visibleCount < filteredAndSortedTools.length 
            ? `Showing ${visibleCount} of ${filteredAndSortedTools.length} tools`
            : `${filteredAndSortedTools.length} tools`
          }
        </Typography>

        {/* Tools Grid/List */}
        <TouchScrollArea
          ref={scrollRef}
          sx={{ 
            height: isMobile ? 'calc(100vh - 200px)' : 'auto',
            maxHeight: isMobile ? undefined : '70vh',
          }}
          {...(isMobile ? pullToRefreshHandlers.handlers : {})}
        >
          {/* Pull to refresh indicator */}
          {isMobile && pullToRefreshHandlers.isPulling && (
            <Box
              sx={{
                textAlign: 'center',
                py: 2,
                transform: `translateY(${pullToRefreshHandlers.pullDistance}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {pullToRefreshHandlers.shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
              </Typography>
            </Box>
          )}

          {filteredAndSortedTools.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tools found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={getSpacing(1, 2, 3)}>
              {visibleTools.map((tool) => (
                <Grid 
                  item 
                  xs={12}
                  sm={viewMode === 'list' ? 12 : 6}
                  md={viewMode === 'list' ? 12 : 4}
                  lg={viewMode === 'list' ? 12 : getGridColumns()}
                  key={tool.id}
                >
                  {isMobile && onBookmark ? (
                    <SwipeableToolCard
                      tool={tool}
                      onView={onViewDetails}
                      onBookmark={onBookmark}
                      isBookmarked={bookmarkedTools.includes(tool.id)}
                    />
                  ) : (
                    <ToolCard
                      tool={tool}
                      onViewDetails={onViewDetails}
                      variant={viewMode === 'list' || isMobile ? 'compact' : 'default'}
                      elevation={isMobile ? 1 : 2}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          )}

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Loading more tools...
              </Typography>
            </Box>
          )}

          {/* Load More Button (fallback for manual loading) */}
          {!isLoadingMore && visibleCount < filteredAndSortedTools.length && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={handleLoadMore}
              >
                Load {Math.min(getBatchSize(), filteredAndSortedTools.length - visibleCount)} more tools
              </Typography>
            </Box>
          )}
        </TouchScrollArea>

        {/* Mobile FAB for quick actions */}
        {isMobile && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
            onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} />
          </Fab>
        )}
      </Box>
    </TouchInteractions>
  );
});

ResponsiveToolList.displayName = 'ResponsiveToolList';