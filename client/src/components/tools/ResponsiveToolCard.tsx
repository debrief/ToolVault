import React, { memo, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Collapse,
  Fade,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useResponsive } from '../../theme/responsive';
import { KEYBOARD_KEYS, isKeyPressed } from '../../utils/focusManagement';
import { TouchFeedback } from '../mobile/TouchInteractions';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';
import { ToolBadges } from './ToolBadges';
import { highlightMatches, type SearchMatch, type ToolMetadata } from '../../utils/searchUtils';
import type { Tool } from '../../types/index';

interface ResponsiveToolCardProps {
  tool: Tool;
  onViewDetails: (tool: Tool) => void;
  onBookmark?: (tool: Tool) => void;
  onShare?: (tool: Tool) => void;
  isBookmarked?: boolean;
  elevation?: number;
  variant?: 'default' | 'compact' | 'expanded';
  metadata?: ToolMetadata;
  searchMatches?: SearchMatch[];
  showBadges?: boolean;
  enableSwipeGestures?: boolean;
  showQuickActions?: boolean;
}

/**
 * Enhanced tool card with responsive design and mobile-optimized interactions
 */
export const ResponsiveToolCard = memo<ResponsiveToolCardProps>(({ 
  tool, 
  onViewDetails, 
  onBookmark,
  onShare,
  isBookmarked = false,
  elevation = 1,
  variant = 'default',
  metadata,
  searchMatches,
  showBadges = true,
  enableSwipeGestures = true,
  showQuickActions = true,
}: ResponsiveToolCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { isMobile, isTablet, isTouchDevice, getSpacing } = useResponsive();
  
  const [expanded, setExpanded] = React.useState(variant === 'expanded');
  const [showActions, setShowActions] = React.useState(false);

  // Swipe gesture handlers for mobile
  const handleSwipeLeft = useCallback(() => {
    if (onBookmark) {
      onBookmark(tool);
    }
  }, [tool, onBookmark]);

  const handleSwipeRight = useCallback(() => {
    onViewDetails(tool);
  }, [tool, onViewDetails]);

  const { handlers: swipeHandlers, gestureState } = useSwipeGestures(
    handleSwipeLeft,
    handleSwipeRight,
    undefined,
    undefined,
    { 
      disabled: !enableSwipeGestures || !isTouchDevice,
      threshold: 60,
    }
  );

  // Click handlers
  const handleClick = useCallback((event: React.MouseEvent) => {
    // Don't trigger view if swiping
    if (gestureState.isActive) {
      event.preventDefault();
      return;
    }
    onViewDetails(tool);
  }, [tool, onViewDetails, gestureState.isActive]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (isKeyPressed(event.nativeEvent, KEYBOARD_KEYS.ENTER) || 
        isKeyPressed(event.nativeEvent, KEYBOARD_KEYS.SPACE)) {
      event.preventDefault();
      onViewDetails(tool);
    }
  }, [tool, onViewDetails]);

  // Action handlers
  const handleBookmark = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (onBookmark) {
      onBookmark(tool);
    }
  }, [tool, onBookmark]);

  const handleShare = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (onShare) {
      onShare(tool);
    }
  }, [tool, onShare]);

  const handleExpand = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setExpanded(prev => !prev);
  }, []);

  // Memoized computations
  const visibleTags = useMemo(() => {
    if (!tool.tags || tool.tags.length === 0) return [];
    const maxTags = isMobile ? 2 : variant === 'compact' ? 2 : 3;
    return tool.tags.slice(0, maxTags);
  }, [tool.tags, isMobile, variant]);

  const remainingTagsCount = useMemo(() => {
    if (!tool.tags) return 0;
    const maxTags = isMobile ? 2 : variant === 'compact' ? 2 : 3;
    return Math.max(0, tool.tags.length - maxTags);
  }, [tool.tags, isMobile, variant]);

  const highlightedName = useMemo(() => {
    const nameMatch = searchMatches?.find(match => match.field === 'name');
    return nameMatch ? highlightMatches(tool.name, nameMatch.indices) : tool.name;
  }, [tool.name, searchMatches]);

  const highlightedDescription = useMemo(() => {
    const descMatch = searchMatches?.find(match => match.field === 'description');
    return descMatch ? highlightMatches(tool.description, descMatch.indices) : tool.description;
  }, [tool.description, searchMatches]);

  // Responsive styles
  const getCardStyles = useMemo(() => {
    const baseStyles = {
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' as const,
      cursor: 'pointer',
      position: 'relative' as const,
      transition: prefersReducedMotion ? 'none' : 'all 0.3s ease-in-out',
      transform: gestureState.isActive 
        ? `translateX(${Math.max(-30, Math.min(30, gestureState.distance.x * 0.2))}px)`
        : 'translateX(0)',
      
      '&:hover': {
        transform: prefersReducedMotion 
          ? 'none' 
          : gestureState.isActive 
            ? `translateX(${Math.max(-30, Math.min(30, gestureState.distance.x * 0.2))}px)`
            : 'translateY(-2px)',
        boxShadow: (theme) => theme.shadows[Math.min(elevation + 3, 24)],
      },
      
      '&:focus': {
        outline: '2px solid',
        outlineColor: 'primary.main',
        outlineOffset: '2px',
      },
      
      '&:focus:not(:focus-visible)': {
        outline: 'none',
      },
      
      // Touch-specific styles
      ...(isTouchDevice && {
        '&:active': {
          transform: 'scale(0.98)',
        },
      }),
    };

    // Mobile-specific adjustments
    if (isMobile) {
      return {
        ...baseStyles,
        borderRadius: 3,
        margin: '4px 0',
      };
    }

    return baseStyles;
  }, [elevation, prefersReducedMotion, gestureState, isTouchDevice, isMobile]);

  const contentPadding = isMobile ? 2 : variant === 'compact' ? 1.5 : 2;
  const titleVariant = isMobile ? 'subtitle1' : variant === 'compact' ? 'subtitle1' : 'h6';
  const bodyVariant = isMobile ? 'body2' : 'body2';

  return (
    <TouchFeedback disabled={!isTouchDevice}>
      <Card 
        component="article"
        role="button"
        tabIndex={0}
        sx={getCardStyles}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...(isTouchDevice ? swipeHandlers : {})}
        data-testid={`responsive-tool-card-${tool.id}`}
        elevation={gestureState.isActive ? elevation + 2 : elevation}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Swipe indicators for touch devices */}
        {isTouchDevice && gestureState.isActive && (
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
              zIndex: 1,
              backgroundColor: 'rgba(0,0,0,0.05)',
              pointerEvents: 'none',
            }}
          >
            <Fade in={gestureState.direction.horizontal === 'right'}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                <VisibilityIcon sx={{ mr: 1 }} />
                <Typography variant="caption" fontWeight={600}>View</Typography>
              </Box>
            </Fade>
            
            {onBookmark && (
              <Fade in={gestureState.direction.horizontal === 'left'}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'secondary.main' }}>
                  <Typography variant="caption" fontWeight={600} sx={{ mr: 1 }}>
                    {isBookmarked ? 'Remove' : 'Save'}
                  </Typography>
                  {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </Box>
              </Fade>
            )}
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, p: contentPadding, position: 'relative', zIndex: 2 }}>
          {/* Header with title and quick actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography 
              variant={titleVariant} 
              component="h3" 
              sx={{ 
                fontWeight: 600,
                flexGrow: 1,
                mr: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: isMobile || variant === 'compact' ? 1 : 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {highlightedName}
            </Typography>
            
            {/* Quick actions */}
            {showQuickActions && !isMobile && (
              <Fade in={showActions} timeout={200}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {onBookmark && (
                    <IconButton
                      size="small"
                      onClick={handleBookmark}
                      sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                    >
                      {isBookmarked ? 
                        <BookmarkIcon fontSize="small" color="primary" /> : 
                        <BookmarkBorderIcon fontSize="small" />
                      }
                    </IconButton>
                  )}
                  
                  {onShare && (
                    <IconButton
                      size="small"
                      onClick={handleShare}
                      sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  )}
                  
                  {variant !== 'compact' && tool.description.length > 100 && (
                    <IconButton
                      size="small"
                      onClick={handleExpand}
                      sx={{ 
                        opacity: 0.7, 
                        '&:hover': { opacity: 1 },
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s ease-in-out',
                      }}
                    >
                      <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Fade>
            )}
          </Box>

          {/* Badges */}
          {showBadges && (
            <Box sx={{ mb: getSpacing(1, 1.5, 2) }}>
              <ToolBadges 
                tool={tool} 
                metadata={metadata}
                size={isMobile || variant === 'compact' ? 'small' : 'small'}
                maxBadges={isMobile ? 2 : variant === 'compact' ? 2 : 3}
              />
            </Box>
          )}
          
          {/* Description */}
          <Typography 
            variant={bodyVariant}
            color="text.secondary" 
            sx={{ 
              mb: getSpacing(1.5, 2, 2),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: expanded 
                ? 'unset' 
                : isMobile || variant === 'compact' ? 2 : 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {highlightedDescription}
          </Typography>

          {/* Expandable content for mobile */}
          {isMobile && tool.description.length > 100 && (
            <Collapse in={expanded}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Additional details about {tool.name} and its capabilities...
              </Typography>
            </Collapse>
          )}

          {/* Tags and category */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            <Chip 
              label={tool.category} 
              variant="outlined" 
              size="small" 
              sx={{ 
                borderRadius: isMobile ? 2 : 1.5,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
              }}
            />
            
            {visibleTags.map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                sx={{ 
                  borderRadius: isMobile ? 2 : 1.5,
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                }}
              />
            ))}
            
            {remainingTagsCount > 0 && (
              <Chip 
                label={`+${remainingTagsCount}`} 
                size="small" 
                variant="outlined"
                sx={{ 
                  borderRadius: isMobile ? 2 : 1.5,
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  opacity: 0.7,
                }}
              />
            )}
          </Box>

          {/* Tool ID for non-compact variants */}
          {variant !== 'compact' && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ opacity: 0.7 }}
            >
              ID: {tool.id}
            </Typography>
          )}
        </CardContent>

        {/* Mobile bookmark indicator */}
        {isMobile && isBookmarked && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 3,
            }}
          >
            <BookmarkIcon color="primary" fontSize="small" />
          </Box>
        )}
      </Card>
    </TouchFeedback>
  );
});

ResponsiveToolCard.displayName = 'ResponsiveToolCard';