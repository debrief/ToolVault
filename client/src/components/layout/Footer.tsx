import { Box, Container, Typography, Link } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' ToolVault - '}
          <Link color="inherit" href="https://github.com/yourusername/toolvault">
            GitHub
          </Link>
          {' | Version 1.0.0 (Phase 1)'}
        </Typography>
      </Container>
    </Box>
  );
};