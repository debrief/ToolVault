import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Home, Build } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface ToolBreadcrumbsProps {
  toolName: string;
}

export function ToolBreadcrumbs({ toolName }: ToolBreadcrumbsProps) {
  return (
    <Breadcrumbs 
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <Link
        component={RouterLink}
        to="/"
        variant="body2"
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
        component={RouterLink}
        to="/tools"
        variant="body2"
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