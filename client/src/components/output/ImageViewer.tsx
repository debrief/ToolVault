/**
 * ImageViewer component for displaying images with zoom, gallery, and optimization features
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  Alert,
  Typography,
  ButtonGroup,
  Button,
  Slider,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as FitToScreenIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { ImageViewerProps } from '../../types/output';

export const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt = 'Image',
  maxHeight = 400,
  zoomable = true,
  galleryMode = false,
  exportable = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset transforms when src changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setLoading(true);
    setError(null);
  }, [src]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setLoading(false);
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  }, []);

  // Handle image error
  const handleImageError = useCallback(() => {
    setLoading(false);
    setError('Failed to load image');
  }, []);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  // Rotation functions
  const handleRotateLeft = useCallback(() => {
    setRotation(prev => prev - 90);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => prev + 90);
  }, []);

  // Download function
  const handleDownload = useCallback(async () => {
    if (!exportable || !src) return;

    try {
      const link = document.createElement('a');
      link.href = src;
      link.download = alt || 'image';
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }, [exportable, src, alt]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!zoomable || zoom <= 1) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [zoomable, zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !zoomable) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart, zoomable]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!zoomable) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  }, [zoomable]);

  const renderImageControls = (isFullscreenMode = false) => (
    <Box sx={{ 
      position: 'absolute', 
      top: 10, 
      right: 10, 
      zIndex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 1,
      display: 'flex',
      flexDirection: isFullscreenMode ? 'row' : 'column',
      gap: 0.5,
      p: 0.5
    }}>
      {zoomable && (
        <>
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn} sx={{ color: 'white' }}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut} sx={{ color: 'white' }}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Fit to Screen">
            <IconButton size="small" onClick={handleFitToScreen} sx={{ color: 'white' }}>
              <FitToScreenIcon />
            </IconButton>
          </Tooltip>
        </>
      )}

      <Tooltip title="Rotate Left">
        <IconButton size="small" onClick={handleRotateLeft} sx={{ color: 'white' }}>
          <RotateLeftIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Rotate Right">
        <IconButton size="small" onClick={handleRotateRight} sx={{ color: 'white' }}>
          <RotateRightIcon />
        </IconButton>
      </Tooltip>

      {!isFullscreenMode && (
        <Tooltip title="Fullscreen">
          <IconButton size="small" onClick={() => setIsFullscreen(true)} sx={{ color: 'white' }}>
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      )}

      {exportable && (
        <Tooltip title="Download">
          <IconButton size="small" onClick={handleDownload} sx={{ color: 'white' }}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  const renderZoomSlider = (isFullscreenMode = false) => (
    zoomable && (
      <Paper sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 1,
        p: 2,
        minWidth: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}>
        <Typography variant="caption" gutterBottom>
          Zoom: {Math.round(zoom * 100)}%
        </Typography>
        <Slider
          value={zoom}
          onChange={(_, value) => setZoom(value as number)}
          min={0.1}
          max={5}
          step={0.1}
          size="small"
        />
      </Paper>
    )
  );

  const renderImage = (isFullscreenMode = false) => (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        height: isFullscreenMode ? '80vh' : maxHeight,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: zoomable && zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading image...
          </Typography>
        </Box>
      )}

      {error ? (
        <Alert severity="error" sx={{ maxWidth: 300 }}>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `
              translate(${position.x}px, ${position.y}px) 
              scale(${zoom}) 
              rotate(${rotation}deg)
            `,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      )}

      {renderImageControls(isFullscreenMode)}
      {!loading && !error && renderZoomSlider(isFullscreenMode)}
    </Box>
  );

  const renderImageInfo = () => (
    <Paper sx={{ 
      position: 'absolute', 
      top: 10, 
      left: 10, 
      zIndex: 1,
      p: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      maxWidth: 200
    }}>
      <Typography variant="caption" color="text.secondary">
        {imageDimensions.width} × {imageDimensions.height}
      </Typography>
      {alt && (
        <Typography variant="caption" display="block" color="text.secondary">
          {alt}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ position: 'relative', height: maxHeight, width: '100%' }}>
      {renderImage()}
      {!loading && !error && renderImageInfo()}

      {/* Fullscreen Modal */}
      <Dialog
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { 
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            height: '90vh'
          }
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 2 
        }}>
          <IconButton 
            onClick={() => setIsFullscreen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {renderImage(true)}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ImageViewer;