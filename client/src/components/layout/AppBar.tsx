import { AppBar as MuiAppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import BuildIcon from '@mui/icons-material/Build';

interface AppBarProps {
  onMenuClick: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  return (
    <MuiAppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <BuildIcon sx={{ mr: 2 }} />
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          ToolVault
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Phase 1 - UI Mockup
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
};