import {
  Box,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import {
  ArrowBack,
} from '@mui/icons-material';
import type { Tool } from '../../types/index';

interface ToolHeaderProps {
  tool: Tool;
  onBackClick?: () => void;
}

export function ToolHeader({ tool, onBackClick }: ToolHeaderProps) {
  return (
    <Box sx={{ mb: 4 }} data-testid="tool-header">
      {/* Back button */}
      {onBackClick && (
        <Button
          startIcon={<ArrowBack />}
          onClick={onBackClick}
          sx={{ mb: 2 }}
          variant="text"
          color="primary"
          data-testid="back-button"
        >
          Back to Tools
        </Button>
      )}

      {/* Tool name */}
      <Typography variant="h3" component="h1" sx={{ mb: 2 }} data-testid="tool-name">
        {tool.name}
      </Typography>

      {/* Description */}
      <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, lineHeight: 1.6 }}>
        {tool.description}
      </Typography>

      {/* Category and tags */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {tool.category && (
          <Chip 
            label={tool.category} 
            variant="filled" 
            color="primary"
            sx={{ fontWeight: 500 }}
          />
        )}
        
        {tool.tags?.map((tag) => (
          <Chip 
            key={tag} 
            label={tag} 
            variant="outlined"
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
}