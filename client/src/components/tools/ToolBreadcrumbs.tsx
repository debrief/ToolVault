import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Home, Build } from '@mui/icons-material';

interface ToolBreadcrumbsProps {
  toolName: string;
  onNavigateHome?: () => void;
  onNavigateToTools?: () => void;
}

export function ToolBreadcrumbs({ 
  toolName, 
  onNavigateHome,
  onNavigateToTools 
}: ToolBreadcrumbsProps) {
  return (
    <Breadcrumbs 
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <Link
        component="button"
        variant="body2"
        onClick={onNavigateHome}
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            textDecoration: 'underline',
          },
        }}
      >
        <Home sx={{ mr: 0.5, fontSize: 16 }} />
        Home
      </Link>
      
      <Link
        component="button"
        variant="body2"
        onClick={onNavigateToTools}
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            textDecoration: 'underline',
          },
        }}
      >
        <Build sx={{ mr: 0.5, fontSize: 16 }} />
        Tools
      </Link>
      
      <Typography 
        variant="body2" 
        color="text.primary"
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 500,
        }}
      >
        {toolName}
      </Typography>
    </Breadcrumbs>
  );
}