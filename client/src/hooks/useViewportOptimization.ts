import { useState, useEffect, useCallback } from 'react';
import { useResponsive } from '../theme/responsive';

export interface ViewportState {
  width: number;
  height: number;
  visualWidth: number;
  visualHeight: number;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Hook to optimize viewport handling for mobile devices, including virtual keyboard
 */
export function useViewportOptimization() {
  const { isMobile } = useResponsive();
  const [viewportState, setViewportState] = useState<ViewportState>({
    width: window.innerWidth,
    height: window.innerHeight,
    visualWidth: window.innerWidth,
    visualHeight: window.innerHeight,
    keyboardHeight: 0,
    isKeyboardOpen: false,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });

  // Get CSS custom properties for safe area insets
  const getSafeAreaInsets = useCallback(() => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
    
    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
      bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
      left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10),
      right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
    };
  }, []);

  // Update viewport state
  const updateViewportState = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const safeAreaInsets = getSafeAreaInsets();
    
    let visualWidth = width;
    let visualHeight = height;
    let keyboardHeight = 0;
    let isKeyboardOpen = false;

    // Use Visual Viewport API if available (better for keyboard detection)
    if ('visualViewport' in window && window.visualViewport) {
      const vv = window.visualViewport;
      visualWidth = vv.width;
      visualHeight = vv.height;
      
      // Detect virtual keyboard by comparing window height with visual viewport height
      if (isMobile) {
        keyboardHeight = height - visualHeight;
        isKeyboardOpen = keyboardHeight > 150; // Threshold for keyboard detection
      }
    } else if (isMobile) {
      // Fallback: detect keyboard by significant height change
      const heightDifference = screen.height - height;
      isKeyboardOpen = heightDifference > 150;
      keyboardHeight = isKeyboardOpen ? heightDifference : 0;
    }

    setViewportState({
      width,
      height,
      visualWidth,
      visualHeight,
      keyboardHeight,
      isKeyboardOpen,
      safeAreaInsets,
    });

    // Update CSS custom properties for viewport units
    if (isMobile) {
      const vh = height * 0.01;
      const vw = width * 0.01;
      const svh = visualHeight * 0.01;
      
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--vw', `${vw}px`);
      document.documentElement.style.setProperty('--svh', `${svh}px`);
    }
  }, [isMobile, getSafeAreaInsets]);

  // Initialize CSS environment variables for safe areas
  const initializeSafeAreaCSS = useCallback(() => {
    const style = document.documentElement.style;
    
    // Set safe area inset CSS custom properties
    style.setProperty('--sat', 'env(safe-area-inset-top)');
    style.setProperty('--sar', 'env(safe-area-inset-right)');
    style.setProperty('--sab', 'env(safe-area-inset-bottom)');
    style.setProperty('--sal', 'env(safe-area-inset-left)');
    
    // Add body padding for safe areas on mobile
    if (isMobile) {
      document.body.style.paddingTop = 'var(--sat)';
      document.body.style.paddingBottom = 'var(--sab)';
      document.body.style.paddingLeft = 'var(--sal)';
      document.body.style.paddingRight = 'var(--sar)';
    }
  }, [isMobile]);

  // Prevent zoom on double tap for iOS
  const preventZoom = useCallback(() => {
    if (isMobile) {
      // Prevent default zoom behavior on double tap
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, { passive: false });
    }
  }, [isMobile]);

  // Handle virtual keyboard events
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => updateViewportState();
    const handleOrientationChange = () => {
      // Delay to account for orientation change completion
      setTimeout(updateViewportState, 100);
    };

    // Listen for various viewport changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Visual Viewport API events
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', updateViewportState);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', updateViewportState);
      }
    };
  }, [isMobile, updateViewportState]);

  // Initialize on mount
  useEffect(() => {
    updateViewportState();
    initializeSafeAreaCSS();
    preventZoom();
  }, [updateViewportState, initializeSafeAreaCSS, preventZoom]);

  // Utility function to get responsive dimensions
  const getResponsiveDimensions = useCallback((
    mobile: { width?: number | string; height?: number | string } = {},
    tablet: { width?: number | string; height?: number | string } = {},
    desktop: { width?: number | string; height?: number | string } = {}
  ) => {
    const width = viewportState.width;
    
    if (width < 600) return mobile;
    if (width >= 600 && width < 1200) return tablet;
    return desktop;
  }, [viewportState.width]);

  return {
    ...viewportState,
    getResponsiveDimensions,
    
    // Utility functions
    isLandscape: viewportState.width > viewportState.height,
    isPortrait: viewportState.height > viewportState.width,
    
    // CSS viewport units
    vh: viewportState.height / 100,
    vw: viewportState.width / 100,
    svh: viewportState.visualHeight / 100, // Safe viewport height
    
    // Responsive breakpoints
    isMobile: viewportState.width < 600,
    isTablet: viewportState.width >= 600 && viewportState.width < 1200,
    isDesktop: viewportState.width >= 1200,
    
    // Safe area utilities
    hasSafeArea: Object.values(viewportState.safeAreaInsets).some(inset => inset > 0),
    
    // Keyboard utilities for forms
    adjustForKeyboard: (elementRef: React.RefObject<HTMLElement>) => {
      if (viewportState.isKeyboardOpen && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const visibleHeight = viewportState.visualHeight;
        
        if (rect.bottom > visibleHeight) {
          const scrollOffset = rect.bottom - visibleHeight + 20; // 20px padding
          window.scrollBy(0, scrollOffset);
        }
      }
    },
  };
}

/**
 * Hook to manage virtual keyboard aware scrolling
 */
export function useKeyboardAwareScrolling() {
  const { isKeyboardOpen, keyboardHeight, visualHeight } = useViewportOptimization();

  const scrollIntoView = useCallback((element: HTMLElement, options: ScrollIntoViewOptions = {}) => {
    if (!element) return;

    if (isKeyboardOpen) {
      // Custom scroll behavior that accounts for virtual keyboard
      const rect = element.getBoundingClientRect();
      const availableHeight = visualHeight - 20; // 20px padding
      
      if (rect.bottom > availableHeight) {
        const scrollOffset = rect.bottom - availableHeight;
        window.scrollBy({
          top: scrollOffset,
          behavior: options.behavior || 'smooth',
        });
      }
    } else {
      // Standard scroll behavior
      element.scrollIntoView(options);
    }
  }, [isKeyboardOpen, visualHeight]);

  const focusWithScroll = useCallback((element: HTMLElement) => {
    element.focus();
    // Delay scroll to allow keyboard to appear
    setTimeout(() => scrollIntoView(element), 300);
  }, [scrollIntoView]);

  return {
    scrollIntoView,
    focusWithScroll,
    keyboardHeight,
    isKeyboardOpen,
  };
}