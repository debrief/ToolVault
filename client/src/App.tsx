import { Typography, Box, Paper } from '@mui/material';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <MainLayout>
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h3" gutterBottom>
            Welcome to ToolVault
          </Typography>
          <Typography variant="body1" paragraph>
            This is the Phase 1 UI mockup for ToolVault - a portable, self-contained service
            that delivers curated collections of analysis tools.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Navigate using the menu to explore the tool catalog and features.
          </Typography>
        </Paper>
      </Box>
    </MainLayout>
  );
}

export default App;