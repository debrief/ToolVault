import React, { useState, useCallback, type ReactNode } from 'react';
import { Box, Container, Toolbar, CssBaseline, ThemeProvider } from '@mui/material';
import { AdaptiveNavigation } from '../adaptive/AdaptiveNavigation';
import { Footer } from './Footer';
import { TouchInteractions } from '../mobile/TouchInteractions';
import { useResponsive, responsiveTheme } from '../../theme/responsive';
import { useViewportOptimization } from '../../hooks/useViewportOptimization';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Responsive main layout that adapts to different screen sizes and device capabilities
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isMobile, isTablet, isDesktop, getSpacing } = useResponsive();
  const { isKeyboardOpen, adjustForKeyboard } = useViewportOptimization();
  const [notifications] = useState(0); // Placeholder for notifications

  // Calculate main content margins based on device type
  const getMainContentStyles = useCallback(() => {
    const baseStyles = {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: 0, // Important for flex children
      position: 'relative' as const,
    };

    if (isMobile || isTablet) {
      return {
        ...baseStyles,
        marginLeft: 0,
        padding: getSpacing(2, 3, 3),
        paddingBottom: isKeyboardOpen ? 1 : getSpacing(2, 3, 3),
        transition: 'padding-bottom 0.3s ease-in-out',
      };
    }

    // Desktop with permanent sidebar
    const sidebarWidth = 240; // Default sidebar width
    return {
      ...baseStyles,
      marginLeft: `${sidebarWidth}px`,
      padding: getSpacing(2, 3, 4),
      transition: 'margin-left 0.3s ease-in-out',
    };
  }, [isMobile, isTablet, getSpacing, isKeyboardOpen]);

  const getContainerStyles = useCallback(() => {
    return {
      maxWidth: isMobile ? 'sm' : isTablet ? 'md' : 'lg',
      width: '100%',
      margin: '0 auto',
      paddingX: getSpacing(1, 2, 3),
      paddingY: 0,
    };
  }, [isMobile, isTablet, getSpacing]);

  return (
    <ThemeProvider theme={responsiveTheme}>
      <CssBaseline />
      <TouchInteractions>
        <Box 
          sx={{ 
            display: 'flex', 
            minHeight: '100vh',
            // Handle safe areas on mobile devices
            paddingTop: 'env(safe-area-inset-top)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          {/* Adaptive Navigation */}
          <AdaptiveNavigation notifications={notifications} />
          
          {/* Main Content Area */}
          <Box
            component="main"
            sx={getMainContentStyles()}
          >
            {/* Spacer for mobile/tablet AppBar */}
            {(isMobile || isTablet) && <Toolbar />}
            
            {/* Content Container */}
            <Container 
              maxWidth={false}
              sx={getContainerStyles()}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: getSpacing(2, 3, 4),
                }}
              >
                {children}
              </Box>
            </Container>
          </Box>
        </Box>
        
        {/* Footer - only on desktop, bottom sheet on mobile */}
        {isDesktop && <Footer />}
        
        {/* Mobile-specific elements */}
        {isMobile && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: 'env(safe-area-inset-bottom)',
              zIndex: 1000,
            }}
          >
            {/* Optional: Add mobile-specific bottom navigation or actions */}
          </Box>
        )}
      </TouchInteractions>
    </ThemeProvider>
  );
};