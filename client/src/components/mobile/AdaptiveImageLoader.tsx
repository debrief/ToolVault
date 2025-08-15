import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Skeleton, IconButton, Typography } from '@mui/material';
import { ImageNotSupported, Refresh } from '@mui/icons-material';
import { useConnectionOptimization } from '../../hooks/useConnectionAware';
import { useResponsive } from '../../theme/responsive';

interface AdaptiveImageLoaderProps {
  src: string;
  alt: string;
  lowQualitySrc?: string;
  placeholderSrc?: string;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  sx?: any;
}

interface ImageState {
  loaded: boolean;
  error: boolean;
  currentSrc: string;
  isLowQuality: boolean;
}

/**
 * Adaptive image loader that optimizes based on connection speed and device capabilities
 */
export function AdaptiveImageLoader({
  src,
  alt,
  lowQualitySrc,
  placeholderSrc,
  width = '100%',
  height = 'auto',
  borderRadius = 0,
  objectFit = 'cover',
  priority = false,
  onLoad,
  onError,
  sx = {},
}: AdaptiveImageLoaderProps) {
  const { getImageQuality, shouldOptimize, connectionType, saveData } = useConnectionOptimization();
  const { isMobile, isRetina } = useResponsive();
  
  const [imageState, setImageState] = useState<ImageState>({
    loaded: false,
    error: false,
    currentSrc: placeholderSrc || '',
    isLowQuality: false,
  });
  const [showRetry, setShowRetry] = useState(false);
  
  const imageRef = useRef<HTMLImageElement | null>(null);
  const intersectionRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Determine optimal image source based on connection and device
  const getOptimalSrc = useCallback(() => {
    const quality = getImageQuality();
    
    // Use low quality source if available and connection is poor
    if (quality === 'low' && lowQualitySrc) {
      return { src: lowQualitySrc, isLowQuality: true };
    }
    
    // For retina displays on good connections, prefer high quality
    if (quality === 'high' && isRetina && !saveData) {
      return { src, isLowQuality: false };
    }
    
    return { src, isLowQuality: false };
  }, [src, lowQualitySrc, getImageQuality, isRetina, saveData]);

  // Load image with progressive enhancement
  const loadImage = useCallback(async (imageSrc: string, isLowQuality: boolean) => {
    if (!imageSrc) return;

    try {
      const img = new Image();
      
      // Set loading strategy based on priority
      if ('loading' in img && !priority) {
        img.loading = 'lazy';
      }
      
      img.onload = () => {
        setImageState(prev => ({
          ...prev,
          loaded: true,
          error: false,
          currentSrc: imageSrc,
          isLowQuality,
        }));
        onLoad?.();
        
        // If we loaded low quality and connection improves, load high quality
        if (isLowQuality && !shouldOptimize && src !== imageSrc) {
          setTimeout(() => {
            loadImage(src, false);
          }, 1000);
        }
      };
      
      img.onerror = (error) => {
        setImageState(prev => ({
          ...prev,
          error: true,
          loaded: false,
        }));
        setShowRetry(true);
        onError?.(error);
      };
      
      img.src = imageSrc;
      imageRef.current = img;
      
    } catch (error) {
      console.error('Image loading failed:', error);
      setImageState(prev => ({ ...prev, error: true }));
      setShowRetry(true);
    }
  }, [src, priority, shouldOptimize, onLoad, onError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!intersectionRef.current || priority) {
      // Load immediately if priority or no intersection ref
      const { src: optimalSrc, isLowQuality } = getOptimalSrc();
      loadImage(optimalSrc, isLowQuality);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !imageState.loaded && !imageState.error) {
          const { src: optimalSrc, isLowQuality } = getOptimalSrc();
          loadImage(optimalSrc, isLowQuality);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1,
      }
    );

    observerRef.current.observe(intersectionRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, imageState.loaded, imageState.error, getOptimalSrc, loadImage]);

  // Retry loading
  const handleRetry = useCallback(() => {
    setImageState(prev => ({ ...prev, error: false }));
    setShowRetry(false);
    const { src: optimalSrc, isLowQuality } = getOptimalSrc();
    loadImage(optimalSrc, isLowQuality);
  }, [getOptimalSrc, loadImage]);

  // Connection change effect
  useEffect(() => {
    // If connection improves and we're showing low quality, upgrade
    if (imageState.loaded && imageState.isLowQuality && !shouldOptimize) {
      setTimeout(() => {
        loadImage(src, false);
      }, 500);
    }
  }, [shouldOptimize, imageState.loaded, imageState.isLowQuality, src, loadImage]);

  const containerStyles = {
    position: 'relative',
    width,
    height,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: 'grey.100',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...sx,
  };

  // Error state
  if (imageState.error && !imageState.loaded) {
    return (
      <Box sx={containerStyles}>
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <ImageNotSupported sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="caption" color="text.secondary" display="block">
            Failed to load image
          </Typography>
          {showRetry && (
            <IconButton onClick={handleRetry} size="small" sx={{ mt: 1 }}>
              <Refresh />
            </IconButton>
          )}
        </Box>
      </Box>
    );
  }

  // Loading state
  if (!imageState.loaded) {
    return (
      <Box ref={intersectionRef} sx={containerStyles}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ borderRadius }}
        />
        {/* Connection indicator for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontSize: '0.6rem',
              padding: '2px 4px',
              borderRadius: 0.5,
            }}
          >
            {connectionType}
          </Box>
        )}
      </Box>
    );
  }

  // Loaded state
  return (
    <Box ref={intersectionRef} sx={containerStyles}>
      <Box
        component="img"
        src={imageState.currentSrc}
        alt={alt}
        sx={{
          width: '100%',
          height: '100%',
          objectFit,
          borderRadius,
          transition: 'opacity 0.3s ease-in-out',
          opacity: imageState.loaded ? 1 : 0,
        }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      
      {/* Quality indicator */}
      {imageState.isLowQuality && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontSize: '0.6rem',
            padding: '2px 4px',
            borderRadius: 0.5,
          }}
        >
          Low Quality
        </Box>
      )}
      
      {/* Connection indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '0.6rem',
            padding: '2px 4px',
            borderRadius: 0.5,
          }}
        >
          {connectionType} {imageState.isLowQuality ? '(LQ)' : '(HQ)'}
        </Box>
      )}
    </Box>
  );
}