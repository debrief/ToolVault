import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import type { Tool } from '../../types/index';

interface ToolCardProps {
  tool: Tool;
  onViewDetails: (tool: Tool) => void;
}

export function ToolCard({ tool, onViewDetails }: ToolCardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
      onClick={() => onViewDetails(tool)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {tool.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2, minHeight: '2.5em' }}
        >
          {tool.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip 
            label={tool.category} 
            variant="outlined" 
            size="small" 
            sx={{ mr: 1 }}
          />
          {tool.tags?.slice(0, 3).map((tag) => (
            <Chip 
              key={tag} 
              label={tag} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
          {tool.tags && tool.tags.length > 3 && (
            <Chip 
              label={`+${tool.tags.length - 3} more`} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          ID: {tool.id}
        </Typography>
      </CardContent>

    </Card>
  );
}