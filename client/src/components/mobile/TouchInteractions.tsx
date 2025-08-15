import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useResponsive } from '../../theme/responsive';

type SxProps = React.ComponentProps<typeof Box>['sx'];

interface TouchInteractionsProps {
  children: ReactNode;
  sx?: SxProps;
}

/**
 * Wrapper component that applies touch-friendly styles for mobile devices
 */
export function TouchInteractions({ children, sx = {} }: TouchInteractionsProps) {
  const { isTouchDevice } = useResponsive();

  if (!isTouchDevice) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        // Touch-friendly button sizing
        '& .MuiButton-root': {
          minHeight: 44, // WCAG minimum touch target
          minWidth: 44,
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
        
        // Touch-friendly icon buttons
        '& .MuiIconButton-root': {
          minHeight: 44,
          minWidth: 44,
          padding: 12,
        },
        
        // Enhanced touch feedback for clickable elements
        '& .MuiButton-root, & .MuiIconButton-root, & .MuiChip-clickable': {
          '&:active': {
            transform: 'scale(0.96)',
            transition: 'transform 0.1s ease-in-out',
          },
        },
        
        // Touch-friendly chips
        '& .MuiChip-root': {
          minHeight: 32,
          '&.MuiChip-clickable': {
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
            '&:active': {
              backgroundColor: 'rgba(0,0,0,0.08)',
            },
          },
          '& .MuiChip-deleteIcon': {
            minHeight: 24,
            minWidth: 24,
            margin: '0 4px',
          },
        },
        
        // Touch-friendly list items
        '& .MuiListItemButton-root': {
          minHeight: 48,
          paddingY: 1.5,
          '&:active': {
            backgroundColor: 'action.selected',
          },
        },
        
        // Improved touch targets for form controls
        '& .MuiCheckbox-root, & .MuiRadio-root, & .MuiSwitch-root': {
          padding: 12,
        },
        
        // Touch-friendly tabs
        '& .MuiTab-root': {
          minHeight: 48,
          '&:active': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
        
        // Prevent text selection on touch interactions
        '& .MuiButton-root, & .MuiIconButton-root, & .MuiChip-root, & .MuiTab-root': {
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
        },
        
        // Custom styles
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Component that provides visual feedback for touch interactions
 */
interface TouchFeedbackProps {
  children: ReactNode;
  disabled?: boolean;
  sx?: SxProps;
}

export function TouchFeedback({ children, disabled = false, sx = {} }: TouchFeedbackProps) {
  const { isTouchDevice } = useResponsive();

  if (!isTouchDevice || disabled) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        
        // Add ripple-like effect on touch
        '&:active::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'action.selected',
          borderRadius: 'inherit',
          opacity: 0.12,
          animation: 'touchRipple 0.6s ease-out',
        },
        
        '@keyframes touchRipple': {
          '0%': {
            transform: 'scale(0)',
            opacity: 0.12,
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 0,
          },
        },
        
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Component for touch-optimized scrollable areas
 */
interface TouchScrollAreaProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical' | 'both';
  sx?: SxProps;
}

export function TouchScrollArea({ 
  children, 
  direction = 'vertical',
  sx = {} 
}: TouchScrollAreaProps) {
  const { isTouchDevice } = useResponsive();

  const scrollStyles = {
    // Smooth scrolling on touch devices
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'thin',
    
    // Custom scrollbar for webkit
    '&::-webkit-scrollbar': {
      width: isTouchDevice ? 2 : 8,
      height: isTouchDevice ? 2 : 8,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: 4,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
  };

  const overflowStyles = {
    horizontal: { overflowX: 'auto', overflowY: 'hidden' },
    vertical: { overflowY: 'auto', overflowX: 'hidden' },
    both: { overflow: 'auto' },
  };

  return (
    <Box
      sx={{
        ...overflowStyles[direction],
        ...scrollStyles,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Component that prevents zoom on double-tap while preserving accessibility
 */
interface TouchZoomPreventionProps {
  children: ReactNode;
  sx?: SxProps;
}

export function TouchZoomPrevention({ children, sx = {} }: TouchZoomPreventionProps) {
  const { isTouchDevice } = useResponsive();

  if (!isTouchDevice) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        touchAction: 'manipulation', // Prevents zoom on double-tap
        ...sx,
      }}
      onTouchStart={(e) => {
        // Prevent zoom on double-tap while preserving single taps
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </Box>
  );
}