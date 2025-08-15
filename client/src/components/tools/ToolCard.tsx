import { memo, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { KEYBOARD_KEYS, isKeyPressed } from '../../utils/focusManagement';
import { ToolBadges } from './ToolBadges';
import { highlightMatches, type SearchMatch, type ToolMetadata } from '../../utils/searchUtils';
import type { Tool } from '../../types/index';

interface ToolCardProps {
  tool: Tool;
  onViewDetails: (tool: Tool) => void;
  elevation?: number;
  variant?: 'default' | 'compact';
  metadata?: ToolMetadata;
  searchMatches?: SearchMatch[];
  showBadges?: boolean;
}

export const ToolCard = memo<ToolCardProps>(({ 
  tool, 
  onViewDetails, 
  elevation = 1,
  variant = 'default',
  metadata,
  searchMatches,
  showBadges = true,
}: ToolCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Memoize the click handler to prevent recreating on each render
  const handleClick = useCallback(() => {
    onViewDetails(tool);
  }, [tool, onViewDetails]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (isKeyPressed(event.nativeEvent, KEYBOARD_KEYS.ENTER) || isKeyPressed(event.nativeEvent, KEYBOARD_KEYS.SPACE)) {
      event.preventDefault();
      onViewDetails(tool);
    }
  }, [tool, onViewDetails]);

  // Memoize the visible tags computation
  const visibleTags = useMemo(() => {
    if (!tool.tags || tool.tags.length === 0) return [];
    return tool.tags.slice(0, 3);
  }, [tool.tags]);

  // Memoize the remaining tags count
  const remainingTagsCount = useMemo(() => {
    if (!tool.tags || tool.tags.length <= 3) return 0;
    return tool.tags.length - 3;
  }, [tool.tags]);

  // Memoize highlighted content
  const highlightedName = useMemo(() => {
    const nameMatch = searchMatches?.find(match => match.field === 'name');
    return nameMatch ? highlightMatches(tool.name, nameMatch.indices) : tool.name;
  }, [tool.name, searchMatches]);

  const highlightedDescription = useMemo(() => {
    const descMatch = searchMatches?.find(match => match.field === 'description');
    return descMatch ? highlightMatches(tool.description, descMatch.indices) : tool.description;
  }, [tool.description, searchMatches]);

  // Memoize the card styles based on variant
  const cardStyles = useMemo(() => ({
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    cursor: 'pointer',
    transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
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
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    },
  }), [elevation, prefersReducedMotion]);

  const contentPadding = variant === 'compact' ? 1.5 : 2;
  const titleVariant = variant === 'compact' ? 'subtitle1' : 'h6';
  const bodyVariant = variant === 'compact' ? 'body2' : 'body2';

  return (
    <Card 
      component="article"
      role="button"
      tabIndex={0}
      sx={cardStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={`tool-card-${tool.id}`}
      elevation={elevation}
      aria-labelledby={`tool-title-${tool.id}`}
      aria-describedby={`tool-desc-${tool.id}`}
    >
      <CardContent sx={{ flexGrow: 1, p: contentPadding }}>
        {/* Badges */}
        {showBadges && (
          <Box sx={{ mb: 1 }}>
            <ToolBadges 
              tool={tool} 
              metadata={metadata}
              size={variant === 'compact' ? 'small' : 'small'}
              maxBadges={variant === 'compact' ? 2 : 3}
            />
          </Box>
        )}

        <Typography 
          id={`tool-title-${tool.id}`}
          variant={titleVariant} 
          component="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: variant === 'compact' ? 1 : 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {highlightedName}
        </Typography>
        
        <Typography 
          id={`tool-desc-${tool.id}`}
          variant={bodyVariant}
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            minHeight: variant === 'compact' ? '1.5em' : '2.5em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: variant === 'compact' ? 2 : 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {highlightedDescription}
        </Typography>

        <Box 
          sx={{ mb: variant === 'compact' ? 1 : 2 }}
          role="list"
          aria-label="Tool categories and tags"
        >
          <Chip 
            label={tool.category} 
            variant="outlined" 
            size="small" 
            sx={{ mr: 1, mb: 0.5 }}
            role="listitem"
            aria-label={`Category: ${tool.category}`}
          />
          {visibleTags.map((tag) => (
            <Chip 
              key={tag} 
              label={tag} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5 }}
              role="listitem"
              aria-label={`Tag: ${tag}`}
            />
          ))}
          {remainingTagsCount > 0 && (
            <Chip 
              label={`+${remainingTagsCount} more`} 
              size="small" 
              variant="outlined"
              sx={{ mb: 0.5 }}
              role="listitem"
              aria-label={`${remainingTagsCount} additional tags available`}
            />
          )}
        </Box>

        {variant !== 'compact' && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            aria-label={`Tool ID: ${tool.id}`}
          >
            ID: {tool.id}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});

ToolCard.displayName = 'ToolCard';