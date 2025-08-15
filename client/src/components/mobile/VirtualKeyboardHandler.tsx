import React, { ReactNode, useEffect, useState, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import { useResponsive } from '../../theme/responsive';
import { useViewportOptimization, useKeyboardAwareScrolling } from '../../hooks/useViewportOptimization';

type SxProps = React.ComponentProps<typeof Box>['sx'];

interface VirtualKeyboardHandlerProps {
  children: ReactNode;
  adjustmentMode?: 'padding' | 'margin' | 'translate' | 'none';
  adjustmentAmount?: number | 'auto';
  scrollToActiveInput?: boolean;
  sx?: SxProps;
}

/**
 * Component that handles virtual keyboard interactions and viewport adjustments
 */
export function VirtualKeyboardHandler({
  children,
  adjustmentMode = 'padding',
  adjustmentAmount = 'auto',
  scrollToActiveInput = true,
  sx = {},
}: VirtualKeyboardHandlerProps) {
  const { isMobile } = useResponsive();
  const { isKeyboardOpen, keyboardHeight, visualHeight } = useViewportOptimization();
  const { scrollIntoView } = useKeyboardAwareScrolling();
  
  const [activeInput, setActiveInput] = useState<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track active input elements
  useEffect(() => {
    if (!isMobile) return;

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      )) {
        setActiveInput(target);
      }
    };

    const handleFocusOut = () => {
      setActiveInput(null);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isMobile]);

  // Scroll active input into view when keyboard appears
  useEffect(() => {
    if (!scrollToActiveInput || !activeInput || !isKeyboardOpen) return;

    const scrollTimer = setTimeout(() => {
      scrollIntoView(activeInput, { behavior: 'smooth', block: 'center' });
    }, 300); // Delay to allow keyboard animation

    return () => clearTimeout(scrollTimer);
  }, [isKeyboardOpen, activeInput, scrollToActiveInput, scrollIntoView]);

  // Calculate adjustment amount
  const getAdjustmentAmount = useCallback(() => {
    if (!isMobile || !isKeyboardOpen) return 0;
    
    if (adjustmentAmount === 'auto') {
      return Math.min(keyboardHeight * 0.6, 200); // Cap at 200px
    }
    
    return typeof adjustmentAmount === 'number' ? adjustmentAmount : 0;
  }, [isMobile, isKeyboardOpen, keyboardHeight, adjustmentAmount]);

  // Generate adjustment styles
  const getAdjustmentStyles = useCallback(() => {
    const adjustment = getAdjustmentAmount();
    
    if (!adjustment || adjustmentMode === 'none') return {};

    const styles: Record<string, any> = {
      transition: 'all 0.3s ease-in-out',
    };

    switch (adjustmentMode) {
      case 'padding':
        styles.paddingBottom = `${adjustment}px`;
        break;
      case 'margin':
        styles.marginBottom = `${adjustment}px`;
        break;
      case 'translate':
        styles.transform = `translateY(-${adjustment}px)`;
        break;
    }

    return styles;
  }, [adjustmentMode, getAdjustmentAmount]);

  // Don't apply any adjustments on non-mobile devices
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        ...getAdjustmentStyles(),
        
        // Ensure content doesn't overflow when keyboard is open
        ...(isKeyboardOpen && {
          maxHeight: `${visualHeight}px`,
          overflow: 'hidden',
        }),
        
        ...sx,
      }}
    >
      {children}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            top: 50,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: 0.5,
            borderRadius: 1,
            fontSize: '0.7rem',
            zIndex: 9999,
            fontFamily: 'monospace',
          }}
        >
          <div>Keyboard: {isKeyboardOpen ? 'Open' : 'Closed'}</div>
          <div>Height: {keyboardHeight}px</div>
          <div>Adjustment: {getAdjustmentAmount()}px</div>
          <div>Active Input: {activeInput?.tagName || 'None'}</div>
        </Box>
      )}
    </Box>
  );
}

/**
 * Hook for manual virtual keyboard detection and handling
 */
export function useVirtualKeyboard() {
  const { isMobile } = useResponsive();
  const { isKeyboardOpen, keyboardHeight } = useViewportOptimization();
  const [inputElement, setInputElement] = useState<HTMLElement | null>(null);

  // Method to register an input element for keyboard-aware behavior
  const registerInput = useCallback((element: HTMLElement) => {
    setInputElement(element);
  }, []);

  // Method to handle input focus with keyboard awareness
  const focusInput = useCallback((element: HTMLElement) => {
    if (!isMobile) {
      element.focus();
      return;
    }

    element.focus();
    
    // Scroll input into view after keyboard appears
    setTimeout(() => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      
      if (rect.bottom > viewportHeight - 20) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 300);
  }, [isMobile]);

  // Method to adjust layout for keyboard
  const getKeyboardAwareStyle = useCallback((offset: number = 20): React.CSSProperties => {
    if (!isMobile || !isKeyboardOpen) return {};

    return {
      paddingBottom: `${keyboardHeight * 0.3 + offset}px`,
      transition: 'padding-bottom 0.3s ease-in-out',
    };
  }, [isMobile, isKeyboardOpen, keyboardHeight]);

  return {
    isKeyboardOpen,
    keyboardHeight,
    registerInput,
    focusInput,
    getKeyboardAwareStyle,
    inputElement,
  };
}

/**
 * Higher-order component that wraps components with virtual keyboard handling
 */
export function withVirtualKeyboardHandler<P extends object>(
  Component: React.ComponentType<P>,
  options: Partial<VirtualKeyboardHandlerProps> = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <VirtualKeyboardHandler {...options}>
        <Component {...props} />
      </VirtualKeyboardHandler>
    );
  };

  WrappedComponent.displayName = `withVirtualKeyboardHandler(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}