import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Skeleton,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';

export interface ToolListSkeletonProps {
  count?: number;
  showFilters?: boolean;
  showSearchBar?: boolean;
  showHeader?: boolean;
  animate?: boolean;
}

export function ToolListSkeleton({
  count = 6,
  showFilters = true,
  showSearchBar = true,
  showHeader = true,
  animate = true,
}: ToolListSkeletonProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const skeletonProps = {
    animation: animate ? 'wave' : false,
  } as const;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {showHeader && (
        <Box sx={{ mb: 4 }}>
          <Skeleton 
            variant="text" 
            width="40%" 
            height={60} 
            sx={{ mb: 2 }} 
            {...skeletonProps}
          />
          <Skeleton 
            variant="text" 
            width="100%" 
            height={24} 
            sx={{ mb: 1 }} 
            {...skeletonProps}
          />
          <Skeleton 
            variant="text" 
            width="80%" 
            height={24} 
            {...skeletonProps}
          />
        </Box>
      )}

      {(showSearchBar || showFilters) && (
        <Box sx={{ mb: 3 }}>
          {showSearchBar && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={56}
              sx={{ mb: 2, borderRadius: 1 }}
              {...skeletonProps}
            />
          )}

          {showFilters && (
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
              <Skeleton
                variant="rectangular"
                width={isMobile ? 120 : 160}
                height={40}
                sx={{ borderRadius: 1 }}
                {...skeletonProps}
              />
              <Skeleton
                variant="rectangular"
                width={isMobile ? 100 : 140}
                height={40}
                sx={{ borderRadius: 1 }}
                {...skeletonProps}
              />
              <Skeleton
                variant="rectangular"
                width={isMobile ? 80 : 120}
                height={40}
                sx={{ borderRadius: 1 }}
                {...skeletonProps}
              />
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                {...skeletonProps}
              />
            </Box>
          )}

          {/* Results count placeholder */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton
              variant="text"
              width={200}
              height={20}
              {...skeletonProps}
            />
            <Skeleton
              variant="text"
              width={100}
              height={20}
              {...skeletonProps}
            />
          </Box>
        </Box>
      )}

      {/* Tools grid skeleton */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}>
        {Array.from({ length: count }).map((_, index) => (
          <ToolCardSkeleton key={index} animate={animate} />
        ))}
      </Box>

      {/* Load more button skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Skeleton
          variant="rectangular"
          width={120}
          height={40}
          sx={{ borderRadius: 1 }}
          {...skeletonProps}
        />
      </Box>
    </Container>
  );
}

interface ToolCardSkeletonProps {
  animate?: boolean;
}

export function ToolCardSkeleton({ animate = true }: ToolCardSkeletonProps) {
  const skeletonProps = {
    animation: animate ? 'wave' : false,
  } as const;

  return (
    <Card
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Tool name */}
        <Skeleton
          variant="text"
          width="80%"
          height={28}
          sx={{ mb: 1, fontWeight: 600 }}
          {...skeletonProps}
        />

        {/* Tool description */}
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Skeleton
            variant="text"
            width="100%"
            height={20}
            {...skeletonProps}
          />
          <Skeleton
            variant="text"
            width="90%"
            height={20}
            {...skeletonProps}
          />
          <Skeleton
            variant="text"
            width="70%"
            height={20}
            {...skeletonProps}
          />
        </Stack>

        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          <Skeleton
            variant="rectangular"
            width={60}
            height={24}
            sx={{ borderRadius: 12 }}
            {...skeletonProps}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 12 }}
            {...skeletonProps}
          />
          <Skeleton
            variant="rectangular"
            width={45}
            height={24}
            sx={{ borderRadius: 12 }}
            {...skeletonProps}
          />
        </Box>

        {/* Tool metadata */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton
              variant="circular"
              width={16}
              height={16}
              {...skeletonProps}
            />
            <Skeleton
              variant="text"
              width={60}
              height={16}
              {...skeletonProps}
            />
          </Box>
          
          <Skeleton
            variant="text"
            width={40}
            height={16}
            {...skeletonProps}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

// Compact version for list view
export function CompactToolListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Stack spacing={1}>
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="60%" height={16} />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 10 }} />
              <Skeleton variant="rectangular" width={40} height={20} sx={{ borderRadius: 10 }} />
            </Box>
            
            <Skeleton variant="text" width={60} height={16} />
          </Box>
        ))}
      </Stack>
    </Container>
  );
}

// Loading skeleton for individual tool card updates
export function ToolCardLoadingSkeleton() {
  return (
    <Card sx={{ height: 200, position: 'relative' }}>
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={100} height={16} />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}