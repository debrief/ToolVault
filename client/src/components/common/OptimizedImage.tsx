import { useState, useCallback, CSSProperties } from 'react';
import { Box, Skeleton } from '@mui/material';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  width = '100%',
  height = 'auto',
  loading = 'lazy',
  className,
  style,
  sizes,
  priority = false,
  onLoad,
  onError,
  fallbackSrc,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
      return;
    }
    
    onError?.();
  }, [onError, fallbackSrc, currentSrc]);

  // Generate WebP and AVIF source URLs if the original src supports it
  const generateModernFormats = (originalSrc: string) => {
    // This is a simple implementation - in a real app, you'd have a CDN or image service
    // that can convert formats on the fly
    const isExternal = originalSrc.startsWith('http');
    
    if (isExternal) {
      // For external images, we can't guarantee format conversion
      return {
        webp: null,
        avif: null,
      };
    }

    // For local images, assume we have a build process that generates modern formats
    const basePath = originalSrc.replace(/\.(jpe?g|png)$/i, '');
    return {
      webp: `${basePath}.webp`,
      avif: `${basePath}.avif`,
    };
  };

  const { webp, avif } = generateModernFormats(currentSrc);

  // Calculate aspect ratio for layout stability
  const aspectRatioStyle: CSSProperties = {};
  if (typeof width === 'number' && typeof height === 'number') {
    aspectRatioStyle.aspectRatio = `${width}/${height}`;
  }

  const imageStyle: CSSProperties = {
    width,
    height,
    objectFit: 'cover',
    transition: 'opacity 0.3s ease',
    ...aspectRatioStyle,
    ...style,
  };

  if (hasError && !fallbackSrc) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          color: 'grey.500',
          fontSize: '0.875rem',
          ...aspectRatioStyle,
        }}
        className={className}
      >
        Failed to load image
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        ...aspectRatioStyle,
      }}
      className={className}
    >
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            ...aspectRatioStyle,
          }}
        />
      )}
      
      <picture style={{ display: 'block', width: '100%', height: '100%' }}>
        {avif && (
          <source
            srcSet={avif}
            type="image/avif"
            sizes={sizes}
          />
        )}
        {webp && (
          <source
            srcSet={webp}
            type="image/webp"
            sizes={sizes}
          />
        )}
        <img
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : loading}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            ...imageStyle,
            opacity: isLoading ? 0 : 1,
          }}
          // Add preload link for priority images
          {...(priority && {
            fetchPriority: 'high' as const,
          })}
        />
      </picture>
    </Box>
  );
}