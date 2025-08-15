import { Container, Typography, Paper, Button, Box } from '@mui/material';
import { Home, Search, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h1" color="primary" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2 }} data-testid="404-heading">
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom data-testid="not-found-title">
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            The page you're looking for doesn't exist. It may have been moved, deleted, 
            or you might have entered the wrong URL.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={() => navigate(-1)}
              variant="outlined"
              startIcon={<ArrowBack />}
              data-testid="go-back-btn"
            >
              Go Back
            </Button>
            
            <Button
              component={Link}
              to="/"
              variant="contained"
              startIcon={<Home />}
              data-testid="home-btn"
            >
              Home
            </Button>
            
            <Button
              component={Link}
              to="/tools"
              variant="outlined"
              startIcon={<Search />}
              data-testid="browse-tools-btn"
            >
              Browse Tools
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}