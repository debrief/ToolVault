import { createTheme, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// Enhanced breakpoints for comprehensive responsive design
export const breakpoints = {
  xs: 0,      // Mobile portrait
  sm: 600,    // Mobile landscape / small tablet
  md: 900,    // Tablet
  lg: 1200,   // Desktop
  xl: 1536,   // Large desktop
};

// Mobile-first responsive theme with touch-friendly overrides
export const responsiveTheme = createTheme({
  breakpoints: {
    values: breakpoints,
  },
  
  // Mobile-first typography scaling
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '1.75rem', // Start smaller for mobile
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
      '@media (min-width:900px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1.75rem',
      },
      '@media (min-width:900px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.75rem',
      },
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
      '@media (min-width:900px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1rem',
      },
    },
    body1: {
      fontSize: '0.875rem',
      '@media (min-width:600px)': {
        fontSize: '1rem',
      },
    },
    body2: {
      fontSize: '0.75rem',
      '@media (min-width:600px)': {
        fontSize: '0.875rem',
      },
    },
  },
  
  // Enhanced spacing for mobile
  spacing: (factor: number) => `${0.5 * factor}rem`,
  
  // Mobile-friendly shape
  shape: {
    borderRadius: 12, // More rounded for touch
  },
  
  // Palette optimized for mobile contrast
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121', // Higher contrast for mobile
      secondary: '#666666',
    },
  },
  
  // Touch-friendly component overrides
  components: {
    // Container responsive padding
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 16,
          paddingRight: 16,
          '@media (min-width: 600px)': {
            paddingLeft: 24,
            paddingRight: 24,
          },
          '@media (min-width: 900px)': {
            paddingLeft: 32,
            paddingRight: 32,
          },
        },
      },
    },
    
    // Touch-friendly buttons
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44, // WCAG minimum touch target
          minWidth: 44,
          padding: '12px 16px',
          fontSize: '0.875rem',
          borderRadius: 12,
          textTransform: 'none', // Better for mobile readability
          '@media (min-width: 600px)': {
            padding: '8px 16px',
            fontSize: '0.875rem',
          },
        },
        startIcon: {
          marginRight: 8,
          '& > *:first-of-type': {
            fontSize: '1.2rem',
          },
        },
      },
    },
    
    // Touch-friendly icon buttons
    MuiIconButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          minWidth: 44,
          padding: 10,
          '@media (min-width: 600px)': {
            minHeight: 40,
            minWidth: 40,
            padding: 8,
          },
        },
      },
    },
    
    // Mobile-optimized cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '@media (max-width: 599px)': {
            margin: '8px 0',
            borderRadius: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    
    // Touch-friendly chips
    MuiChip: {
      styleOverrides: {
        root: {
          minHeight: 32,
          borderRadius: 16,
          '&.MuiChip-clickable': {
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
            '&:active': {
              backgroundColor: 'rgba(0,0,0,0.08)',
            },
          },
        },
        deleteIcon: {
          minHeight: 24,
          minWidth: 24,
          margin: '0 4px',
        },
      },
    },
    
    // Mobile-optimized text fields
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 48, // Touch-friendly input height
            borderRadius: 12,
            '@media (min-width: 600px)': {
              minHeight: 56,
            },
          },
          '& .MuiInputLabel-outlined': {
            transform: 'translate(14px, 16px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          },
        },
      },
    },
    
    // Mobile drawer optimizations
    MuiDrawer: {
      styleOverrides: {
        paper: {
          '@media (max-width: 599px)': {
            width: '85vw',
            maxWidth: 320,
          },
        },
      },
    },
    
    // Touch-friendly list items
    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          paddingTop: 12,
          paddingBottom: 12,
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
          '&:active': {
            backgroundColor: 'rgba(0,0,0,0.08)',
          },
        },
      },
    },
    
    // Mobile-optimized app bar
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          '@media (max-width: 599px)': {
            '& .MuiToolbar-root': {
              minHeight: 56,
              paddingLeft: 16,
              paddingRight: 16,
            },
          },
        },
      },
    },
    
    // Touch-friendly tabs
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          minWidth: 72,
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          '@media (min-width: 600px)': {
            minWidth: 160,
          },
        },
      },
    },
    
    // Mobile-optimized dialog
    MuiDialog: {
      styleOverrides: {
        paper: {
          '@media (max-width: 599px)': {
            margin: 16,
            width: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 32px)',
            borderRadius: 16,
          },
        },
      },
    },
    
    // Touch-friendly switches
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 32,
          padding: 4,
          '& .MuiSwitch-switchBase': {
            padding: 6,
            transform: 'translateX(2px)',
            '&.Mui-checked': {
              transform: 'translateX(18px)',
            },
          },
          '& .MuiSwitch-thumb': {
            width: 20,
            height: 20,
          },
          '& .MuiSwitch-track': {
            borderRadius: 16,
          },
        },
      },
    },
  },
});

// Responsive hook for component logic
export function useResponsive() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isTouchDevice = useMediaQuery('(pointer: coarse)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  // Device capabilities detection
  const hasHover = useMediaQuery('(hover: hover)');
  const isRetina = useMediaQuery('(-webkit-min-device-pixel-ratio: 2)');
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isLandscape,
    prefersReducedMotion,
    hasHover,
    isRetina,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    
    // Utility functions
    getColumns: (mobile: number = 1, tablet: number = 2, desktop: number = 3) => {
      if (isMobile) return mobile;
      if (isTablet) return tablet;
      return desktop;
    },
    
    getSpacing: (mobile: number = 1, tablet: number = 2, desktop: number = 3) => {
      if (isMobile) return mobile;
      if (isTablet) return tablet;
      return desktop;
    },
    
    // Viewport dimensions
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
}

// CSS-in-JS responsive helpers
export const responsive = {
  // Breakpoint utilities
  up: (breakpoint: keyof typeof breakpoints) => 
    `@media (min-width: ${breakpoints[breakpoint]}px)`,
  
  down: (breakpoint: keyof typeof breakpoints) => 
    `@media (max-width: ${breakpoints[breakpoint] - 1}px)`,
  
  between: (start: keyof typeof breakpoints, end: keyof typeof breakpoints) =>
    `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 1}px)`,
  
  only: (breakpoint: keyof typeof breakpoints) => {
    const keys = Object.keys(breakpoints) as (keyof typeof breakpoints)[];
    const index = keys.indexOf(breakpoint);
    const up = (bp: keyof typeof breakpoints) => `@media (min-width: ${breakpoints[bp]}px)`;
    const between = (start: keyof typeof breakpoints, end: keyof typeof breakpoints) =>
      `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 1}px)`;
    
    if (index === keys.length - 1) {
      return up(breakpoint);
    }
    return between(breakpoint, keys[index + 1]);
  },
};

// Common responsive patterns (defined separately to avoid circular reference)
export const responsivePatterns = {
  hideOnMobile: {
    [responsive.down('sm')]: {
      display: 'none !important',
    },
  },
  
  showOnMobile: {
    display: 'none !important',
    [responsive.down('sm')]: {
      display: 'block !important',
    },
  },
  
  mobileFirst: (styles: Record<string, any>) => ({
    ...styles.mobile,
    [responsive.up('sm')]: styles.tablet,
    [responsive.up('md')]: styles.desktop,
    [responsive.up('lg')]: styles.large,
  }),
};

export default responsiveTheme;