import React, { useState, useCallback, useEffect } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Badge,
  SwipeableDrawer,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Build as BuildIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../../theme/responsive';
import { TouchInteractions } from '../mobile/TouchInteractions';

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: number;
}

interface AdaptiveNavigationProps {
  onMenuClick?: () => void;
  notifications?: number;
}

const primaryMenuItems: NavigationItem[] = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Tools', icon: <BuildIcon />, path: '/tools' },
  { text: 'Search', icon: <SearchIcon />, path: '/search' },
];

const secondaryMenuItems: NavigationItem[] = [
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'About', icon: <InfoIcon />, path: '/about' },
];

/**
 * Adaptive navigation that switches between mobile drawer and desktop sidebar
 */
export function AdaptiveNavigation({ notifications = 0 }: AdaptiveNavigationProps) {
  const theme = useTheme();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleDesktopToggle = useCallback(() => {
    setDesktopCollapsed(prev => !prev);
  }, []);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [navigate, isMobile]);

  const isActive = useCallback((path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Navigation content component
  const NavigationContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <TouchInteractions>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" noWrap>
              {desktopCollapsed && isDesktop ? '' : 'ToolVault'}
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={onItemClick} size="small">
              <CloseIcon />
            </IconButton>
          )}
          {isDesktop && !isMobile && (
            <IconButton onClick={handleDesktopToggle} size="small">
              <ChevronLeftIcon 
                sx={{ 
                  transform: desktopCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-in-out',
                }}
              />
            </IconButton>
          )}
        </Box>
        
        <Divider />
        
        {/* Primary Menu */}
        <List sx={{ flexGrow: 1 }}>
          {primaryMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  handleNavigation(item.path);
                  onItemClick?.();
                }}
                selected={isActive(item.path)}
                sx={{
                  minHeight: 48,
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: desktopCollapsed && isDesktop ? 'auto' : 56,
                    color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.badge && item.badge > 0 ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                {(!desktopCollapsed || !isDesktop) && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive(item.path) ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider />
        
        {/* Secondary Menu */}
        <List>
          {secondaryMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  handleNavigation(item.path);
                  onItemClick?.();
                }}
                selected={isActive(item.path)}
                sx={{
                  minHeight: 48,
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: desktopCollapsed && isDesktop ? 'auto' : 56,
                    color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!desktopCollapsed || !isDesktop) && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive(item.path) ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        {/* Version info */}
        {(!desktopCollapsed || !isDesktop) && (
          <Box sx={{ p: 2, mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              ToolVault v1.0
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Phase 4 - Responsive
            </Typography>
          </Box>
        )}
      </Box>
    </TouchInteractions>
  );

  // Mobile Navigation (Swipeable Drawer)
  if (isMobile) {
    return (
      <>
        <MuiAppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <BuildIcon sx={{ mr: 2 }} />
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              ToolVault
            </Typography>
            {notifications > 0 && (
              <Badge badgeContent={notifications} color="error">
                <Box sx={{ width: 24, height: 24 }} />
              </Badge>
            )}
          </Toolbar>
        </MuiAppBar>
        
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpen={() => setMobileOpen(true)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              backgroundColor: 'background.paper',
            },
          }}
          disableSwipeToOpen={false}
        >
          <Toolbar /> {/* Spacer for AppBar */}
          <NavigationContent onItemClick={handleDrawerToggle} />
        </SwipeableDrawer>
      </>
    );
  }

  // Tablet Navigation (Temporary Drawer with AppBar)
  if (isTablet) {
    return (
      <>
        <MuiAppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <BuildIcon sx={{ mr: 2 }} />
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              ToolVault
            </Typography>
            {notifications > 0 && (
              <Badge badgeContent={notifications} color="error">
                <Box sx={{ width: 24, height: 24 }} />
              </Badge>
            )}
          </Toolbar>
        </MuiAppBar>
        
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 240,
              backgroundColor: 'background.paper',
            },
          }}
        >
          <Toolbar /> {/* Spacer for AppBar */}
          <NavigationContent />
        </Drawer>
      </>
    );
  }

  // Desktop Navigation (Permanent Drawer)
  const drawerWidth = desktopCollapsed ? 80 : 240;
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderRightColor: 'divider',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <NavigationContent />
    </Drawer>
  );
}

/**
 * Adaptive AppBar that adjusts based on navigation state
 */
export function AdaptiveAppBar({ onMenuClick, notifications = 0 }: AdaptiveNavigationProps) {
  const { isMobile, isTablet } = useResponsive();
  
  // Only render AppBar for mobile and tablet (desktop uses integrated navigation)
  if (!isMobile && !isTablet) {
    return null;
  }

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
        {notifications > 0 && (
          <Badge badgeContent={notifications} color="error">
            <Box sx={{ width: 24, height: 24 }} />
          </Badge>
        )}
      </Toolbar>
    </MuiAppBar>
  );
}