import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user prefers reduced motion
 * Respects the prefers-reduced-motion media query for accessibility
 * @returns boolean indicating if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if the browser supports the media query
    if (!window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial state
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Use the modern addEventListener if available, fallback to deprecated addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup function
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get animation configuration based on reduced motion preference
 * @returns Animation configuration object
 */
export function useAnimationConfig() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    
    // Animation duration - shorter or zero if reduced motion is preferred
    duration: prefersReducedMotion ? 0 : 200,
    
    // Transition styles
    transition: prefersReducedMotion ? 'none' : undefined,
    
    // Transform styles for hover effects
    hoverTransform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
    
    // Scale transform for button press effects
    pressedScale: prefersReducedMotion ? 1 : 0.98,
    
    // General animation configuration
    config: {
      duration: prefersReducedMotion ? 0 : 200,
      easing: prefersReducedMotion ? 'linear' : 'ease-in-out',
      transform: prefersReducedMotion ? 'none' : undefined,
    },
  };
}

/**
 * Utility function to get safe animation styles based on reduced motion preference
 * @param styles - Animation styles to apply
 * @param reducedMotionStyles - Alternative styles for reduced motion
 * @returns Safe styles object
 */
export function getSafeAnimationStyles(
  styles: React.CSSProperties,
  reducedMotionStyles?: React.CSSProperties
) {
  // This is a utility function that components can use
  // The actual reduced motion detection should happen in the component using the hook
  return {
    getSafeStyles: (prefersReducedMotion: boolean) => 
      prefersReducedMotion ? (reducedMotionStyles || {}) : styles,
  };
}