import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Fade,
  useTheme,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  SwipeRounded as SwipeIcon,
} from '@mui/icons-material';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';
import { useResponsive } from '../../theme/responsive';
import { ToolCard } from '../tools/ToolCard';
import type { Tool } from '../../types';

interface SwipeableToolCardProps {
  tool: Tool;
  onView: (tool: Tool) => void;
  onBookmark?: (tool: Tool) => void;
  isBookmarked?: boolean;
  showSwipeHints?: boolean;
  disabled?: boolean;
}

/**
 * Enhanced tool card with swipe gestures for mobile interactions
 */
export function SwipeableToolCard({
  tool,
  onView,
  onBookmark,
  isBookmarked = false,
  showSwipeHints = true,
  disabled = false,
}: SwipeableToolCardProps) {
  const theme = useTheme();
  const { isTouchDevice } = useResponsive();
  const [showHints, setShowHints] = useState(showSwipeHints && isTouchDevice);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipeLeft = useCallback(() => {
    if (onBookmark) {
      onBookmark(tool);
      setSwipeDirection('left');
      setTimeout(() => setSwipeDirection(null), 300);
    }
  }, [tool, onBookmark]);

  const handleSwipeRight = useCallback(() => {
    onView(tool);
    setSwipeDirection('right');
    setTimeout(() => setSwipeDirection(null), 300);
  }, [tool, onView]);

  const { handlers, gestureState } = useSwipeGestures(
    handleSwipeLeft,
    handleSwipeRight,
    undefined,
    undefined,
    { disabled: disabled || !isTouchDevice }
  );

  const handleCardClick = useCallback((event: React.MouseEvent) => {
    // Prevent default card click when swiping
    if (gestureState.isActive) {
      event.preventDefault();
      return;
    }
    onView(tool);
  }, [tool, onView, gestureState.isActive]);

  const hideHints = useCallback(() => {
    setShowHints(false);
  }, []);

  // Calculate visual feedback based on swipe state
  const getSwipeTransform = () => {
    if (!gestureState.isActive) {
      return swipeDirection === 'left' 
        ? 'translateX(-10px)' 
        : swipeDirection === 'right' 
        ? 'translateX(10px)' 
        : 'translateX(0)';
    }

    const { distance } = gestureState;
    const maxTranslate = 30;
    const translateX = Math.max(-maxTranslate, Math.min(maxTranslate, distance.x * 0.3));
    
    return `translateX(${translateX}px)`;
  };

  const getSwipeBackground = () => {
    if (!gestureState.isActive) return 'transparent';
    
    const { direction, distance } = gestureState;
    const opacity = Math.min(0.1, Math.abs(distance.x) / 200);
    
    if (direction.horizontal === 'right') {
      return `rgba(${theme.palette.primary.main.replace('#', '')}, ${opacity})`;
    } else if (direction.horizontal === 'left' && onBookmark) {
      return `rgba(${theme.palette.secondary.main.replace('#', '')}, ${opacity})`;
    }
    
    return 'transparent';
  };

  // Don't show swipe features on non-touch devices
  if (!isTouchDevice) {
    return (
      <ToolCard
        tool={tool}
        onViewDetails={onView}
      />
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Swipe Hints Overlay */}
      <Fade in={showHints} timeout={300}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 2,
            borderRadius: 2,
            pointerEvents: 'auto',
          }}
          onClick={hideHints}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: 'white',
            opacity: 0.9,
          }}>
            <SwipeIcon sx={{ mr: 1 }} />
            <Typography variant="caption">
              View
            </Typography>
          </Box>
          
          <Typography variant="caption" color="white" sx={{ opacity: 0.7 }}>
            Tap to dismiss
          </Typography>
          
          {onBookmark && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: 'white',
              opacity: 0.9,
            }}>
              <Typography variant="caption" sx={{ mr: 1 }}>
                Bookmark
              </Typography>
              <SwipeIcon sx={{ transform: 'scaleX(-1)' }} />
            </Box>
          )}
        </Box>
      </Fade>

      {/* Main Card with Swipe Interaction */}
      <Card
        {...handlers}
        onClick={handleCardClick}
        sx={{
          position: 'relative',
          cursor: 'pointer',
          transform: getSwipeTransform(),
          backgroundColor: getSwipeBackground(),
          transition: gestureState.isActive ? 'none' : 'all 0.3s ease-out',
          
          // Touch feedback
          '&:active': {
            transform: `${getSwipeTransform()} scale(0.98)`,
          },
          
          // Prevent text selection during swipe
          userSelect: gestureState.isActive ? 'none' : 'auto',
          WebkitUserSelect: gestureState.isActive ? 'none' : 'auto',
        }}
        elevation={gestureState.isActive ? 8 : 2}
      >
        {/* Background Action Indicators */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 2,
            opacity: gestureState.isActive && Math.abs(gestureState.distance.x) > 20 ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            pointerEvents: 'none',
          }}
        >
          {/* Left swipe indicator (View) */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            opacity: gestureState.direction.horizontal === 'right' ? 1 : 0.3,
          }}>
            <ViewIcon 
              sx={{ 
                color: theme.palette.primary.main,
                fontSize: '1.5rem',
              }} 
            />
            <Typography 
              variant="caption" 
              color="primary" 
              sx={{ ml: 0.5, fontWeight: 600 }}
            >
              View
            </Typography>
          </Box>
          
          {/* Right swipe indicator (Bookmark) */}
          {onBookmark && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              opacity: gestureState.direction.horizontal === 'left' ? 1 : 0.3,
            }}>
              <Typography 
                variant="caption" 
                color="secondary" 
                sx={{ mr: 0.5, fontWeight: 600 }}
              >
                {isBookmarked ? 'Remove' : 'Bookmark'}
              </Typography>
              {isBookmarked ? (
                <BookmarkIcon 
                  sx={{ 
                    color: theme.palette.secondary.main,
                    fontSize: '1.5rem',
                  }} 
                />
              ) : (
                <BookmarkBorderIcon 
                  sx={{ 
                    color: theme.palette.secondary.main,
                    fontSize: '1.5rem',
                  }} 
                />
              )}
            </Box>
          )}
        </Box>

        {/* Card Content */}
        <CardContent 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                fontWeight: 600,
                flexGrow: 1,
                mr: 1,
              }}
            >
              {tool.name}
            </Typography>
            
            {/* Quick action buttons for non-swipe interaction */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {onBookmark && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark(tool);
                  }}
                  sx={{ opacity: 0.7 }}
                >
                  {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                </IconButton>
              )}
            </Box>
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {tool.description}
          </Typography>
          
          <Typography 
            variant="caption" 
            color="text.secondary"
          >
            Category: {tool.category}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}