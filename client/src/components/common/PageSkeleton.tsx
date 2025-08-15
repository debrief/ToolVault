import { Box, Container, Skeleton, Toolbar } from '@mui/material';
import { MainLayout } from '../layout/MainLayout';

interface PageSkeletonProps {
  variant?: 'home' | 'toolList' | 'toolDetail' | 'default';
}

export function PageSkeleton({ variant = 'default' }: PageSkeletonProps) {
  const renderSkeletonContent = () => {
    switch (variant) {
      case 'home':
        return (
          <Box>
            {/* Hero section skeleton */}
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Skeleton variant="text" width="60%" height={80} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width="80%" height={32} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="70%" height={32} sx={{ mx: 'auto', mb: 4 }} />
              <Skeleton variant="rectangular" width={200} height={48} sx={{ mx: 'auto' }} />
            </Box>
            
            {/* Features grid skeleton */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: 3,
              mt: 6 
            }}>
              {[1, 2, 3, 4].map(i => (
                <Box key={i} sx={{ p: 3 }}>
                  <Skeleton variant="rectangular" width={64} height={64} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={24} />
                  <Skeleton variant="text" width="90%" height={24} />
                </Box>
              ))}
            </Box>
          </Box>
        );
        
      case 'toolList':
        return (
          <Box>
            {/* Search and filters skeleton */}
            <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Skeleton variant="rectangular" width={120} height={56} />
                <Skeleton variant="rectangular" width={200} height={56} />
                <Skeleton variant="rectangular" width={120} height={56} />
                <Skeleton variant="rectangular" width={48} height={56} />
              </Box>
            </Box>
            
            {/* Results summary skeleton */}
            <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
            
            {/* Tools grid skeleton */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 3 
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={70} height={24} />
                  </Box>
                  <Skeleton variant="text" width="60%" height={16} />
                </Box>
              ))}
            </Box>
          </Box>
        );
        
      case 'toolDetail':
        return (
          <Box>
            {/* Breadcrumbs skeleton */}
            <Skeleton variant="text" width={300} height={24} sx={{ mb: 2 }} />
            
            {/* Tool header skeleton */}
            <Box sx={{ mb: 4 }}>
              <Skeleton variant="text" width="60%" height={48} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Skeleton variant="rectangular" width={80} height={32} />
                <Skeleton variant="rectangular" width={60} height={32} />
                <Skeleton variant="rectangular" width={70} height={32} />
              </Box>
            </Box>
            
            {/* Content tabs skeleton */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Skeleton variant="rectangular" width={80} height={40} />
                <Skeleton variant="rectangular" width={80} height={40} />
                <Skeleton variant="rectangular" width={80} height={40} />
              </Box>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 3 }}>
                <Skeleton variant="rectangular" width="100%" height={400} />
              </Box>
            </Box>
          </Box>
        );
        
      default:
        return (
          <Box sx={{ py: 3 }}>
            <Skeleton variant="text" width="40%" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 4 }} />
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 3 
            }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} variant="rectangular" height={200} />
              ))}
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar skeleton */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <Skeleton variant="rectangular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width={120} height={32} sx={{ flexGrow: 1 }} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </Box>
        </Container>
      </Box>

      {/* Main content skeleton */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Container maxWidth="lg">
          {renderSkeletonContent()}
        </Container>
      </Box>

      {/* Footer skeleton */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderTop: '1px solid', 
        borderColor: 'divider', 
        py: 2 
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width={200} height={24} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={32} height={32} />
              <Skeleton variant="rectangular" width={32} height={32} />
              <Skeleton variant="rectangular" width={32} height={32} />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}