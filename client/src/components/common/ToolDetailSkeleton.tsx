import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Skeleton,
  Stack,
  Divider,
  Tab,
  Tabs,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';

export interface ToolDetailSkeletonProps {
  showBreadcrumbs?: boolean;
  showTabs?: boolean;
  tabCount?: number;
  inputCount?: number;
  outputCount?: number;
  animate?: boolean;
}

export function ToolDetailSkeleton({
  showBreadcrumbs = true,
  showTabs = true,
  tabCount = 3,
  inputCount = 4,
  outputCount = 2,
  animate = true,
}: ToolDetailSkeletonProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const skeletonProps = {
    animation: animate ? 'wave' : false,
  } as const;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <Box sx={{ mb: 3 }}>
          <Skeleton
            variant="text"
            width={300}
            height={20}
            {...skeletonProps}
          />
        </Box>
      )}

      {/* Tool Header */}
      <Box sx={{ mb: 4 }}>
        {/* Tool Title */}
        <Skeleton
          variant="text"
          width="60%"
          height={48}
          sx={{ mb: 2 }}
          {...skeletonProps}
        />

        {/* Tool Description */}
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Skeleton
            variant="text"
            width="100%"
            height={24}
            {...skeletonProps}
          />
          <Skeleton
            variant="text"
            width="85%"
            height={24}
            {...skeletonProps}
          />
          <Skeleton
            variant="text"
            width="70%"
            height={24}
            {...skeletonProps}
          />
        </Stack>

        {/* Tags and Metadata */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} {...skeletonProps} />
            <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 2 }} {...skeletonProps} />
            <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 2 }} {...skeletonProps} />
            <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 2 }} {...skeletonProps} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="text" width={80} height={24} {...skeletonProps} />
            <Skeleton variant="text" width={60} height={24} {...skeletonProps} />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Tabs */}
      {showTabs && (
        <Box sx={{ mb: 3 }}>
          <Tabs value={0} variant={isMobile ? 'scrollable' : 'standard'} scrollButtons="auto">
            {Array.from({ length: tabCount }).map((_, index) => (
              <Tab 
                key={index}
                label={<Skeleton variant="text" width={80} height={20} {...skeletonProps} />}
              />
            ))}
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ mt: 3 }}>
            <ToolExecutionSkeleton
              inputCount={inputCount}
              outputCount={outputCount}
              animate={animate}
            />
          </Box>
        </Box>
      )}
    </Container>
  );
}

interface ToolExecutionSkeletonProps {
  inputCount?: number;
  outputCount?: number;
  animate?: boolean;
}

export function ToolExecutionSkeleton({
  inputCount = 4,
  outputCount = 2,
  animate = true,
}: ToolExecutionSkeletonProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const skeletonProps = {
    animation: animate ? 'wave' : false,
  } as const;

  return (
    <Grid container spacing={3}>
      {/* Input Panel */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="text" width={100} height={28} {...skeletonProps} />
            </Box>

            <Stack spacing={3}>
              {Array.from({ length: inputCount }).map((_, index) => (
                <InputFieldSkeleton key={index} animate={animate} />
              ))}
            </Stack>

            {/* Execute Button */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Skeleton
                variant="rectangular"
                width={120}
                height={40}
                sx={{ borderRadius: 1 }}
                {...skeletonProps}
              />
              <Skeleton
                variant="rectangular"
                width={80}
                height={40}
                sx={{ borderRadius: 1 }}
                {...skeletonProps}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Output Panel */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="text" width={120} height={28} {...skeletonProps} />
            </Box>

            <Stack spacing={2}>
              {Array.from({ length: outputCount }).map((_, index) => (
                <OutputFieldSkeleton key={index} animate={animate} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

interface InputFieldSkeletonProps {
  animate?: boolean;
}

function InputFieldSkeleton({ animate = true }: InputFieldSkeletonProps) {
  const skeletonProps = {
    animation: animate ? 'wave' : false,
  } as const;

  return (
    <Box>
      {/* Field Label */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Skeleton variant="text" width={120} height={20} {...skeletonProps} />
        <Skeleton
          variant="rectangular"
          width={60}
          height={16}
          sx={{ ml: 1, borderRadius: 8 }}
          {...skeletonProps}
        />
      </Box>

      {/* Field Input */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={56}
        sx={{ borderRadius: 1 }}
        {...skeletonProps}
      />

      {/* Help Text */}
      <Skeleton
        variant="text"
        width="70%"
        height={16}
        sx={{ mt: 0.5 }}
        {...skeletonProps}
      />
    </Box>
  );
}

interface OutputFieldSkeletonProps {
  animate?: boolean;
}

function OutputFieldSkeleton({ animate = true }: OutputFieldSkeletonProps) {
  const skeletonProps = {
    animation: animate ? 'wave' : false,
  } as const;

  return (
    <Box>
      {/* Output Label */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Skeleton variant="text" width={100} height={20} {...skeletonProps} />
        <Skeleton variant="rectangular" width={24} height={24} {...skeletonProps} />
      </Box>

      {/* Output Content */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={120}
        sx={{ borderRadius: 1, mb: 1 }}
        {...skeletonProps}
      />

      {/* Output Actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 1 }} {...skeletonProps} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} {...skeletonProps} />
      </Box>
    </Box>
  );
}

// Skeleton for tool documentation tab
export function ToolDocumentationSkeleton({ animate = true }: { animate?: boolean }) {
  const skeletonProps = {
    animation: animate ? 'wave' : false,
  } as const;

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          {/* Table of Contents */}
          <Box>
            <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} {...skeletonProps} />
            <Stack spacing={1}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="text" width={`${60 + Math.random() * 40}%`} height={20} {...skeletonProps} />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Documentation Sections */}
          {Array.from({ length: 3 }).map((_, sectionIndex) => (
            <Box key={sectionIndex}>
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} {...skeletonProps} />
              <Stack spacing={1}>
                {Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map((_, lineIndex) => (
                  <Skeleton 
                    key={lineIndex} 
                    variant="text" 
                    width={`${70 + Math.random() * 30}%`} 
                    height={20} 
                    {...skeletonProps} 
                  />
                ))}
              </Stack>

              {/* Code Block */}
              <Skeleton
                variant="rectangular"
                width="100%"
                height={80}
                sx={{ mt: 2, borderRadius: 1, bgcolor: 'grey.100' }}
                {...skeletonProps}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// Skeleton for tool examples tab
export function ToolExamplesSkeleton({ animate = true }: { animate?: boolean }) {
  const skeletonProps = {
    animation: animate ? 'wave' : false,
  } as const;

  return (
    <Stack spacing={3}>
      {Array.from({ length: 2 }).map((_, exampleIndex) => (
        <Card key={exampleIndex}>
          <CardContent>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} {...skeletonProps} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} {...skeletonProps} />

            {/* Example Input/Output */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={60} height={20} sx={{ mb: 1 }} {...skeletonProps} />
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 1 }} {...skeletonProps} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Skeleton variant="text" width={70} height={20} sx={{ mb: 1 }} {...skeletonProps} />
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 1 }} {...skeletonProps} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}