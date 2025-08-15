import { Container, Typography, Paper, Button, Box } from '@mui/material';
import { Build, Explore } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

export function HomePage() {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h2" gutterBottom color="primary" data-testid="welcome-heading">
            Welcome to ToolVault
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Your curated collection of analysis tools, ready to use
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
            ToolVault provides a portable, self-contained service for accessing and running 
            analysis tools. Browse our catalog of tools, view detailed information about 
            inputs and outputs, and execute tools with your data.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/tools"
              variant="contained"
              size="large"
              startIcon={<Explore />}
              sx={{ minWidth: 160 }}
              data-testid="browse-tools-btn"
            >
              Browse Tools
            </Button>
            
            <Button
              component={Link}
              to="/tools"
              variant="outlined"
              size="large"
              startIcon={<Build />}
              sx={{ minWidth: 160 }}
              data-testid="tool-catalog-btn"
            >
              Tool Catalog
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" data-testid="phase-info">
              This is Phase 1 of ToolVault - a metadata-driven interface for tool discovery and execution.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}