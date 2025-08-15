import React, { useState, useEffect, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  Offline as OfflineIcon,
  Speed as SpeedIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useResponsive } from '../../theme/responsive';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  appName?: string;
  showFeatures?: boolean;
  autoShow?: boolean;
  delay?: number;
}

/**
 * PWA installation prompt component with enhanced UX for mobile devices
 */
export function PWAInstallPrompt({
  appName = 'ToolVault',
  showFeatures = true,
  autoShow = true,
  delay = 30000, // 30 seconds delay
}: PWAInstallPromptProps) {
  const { isMobile, isTablet } = useResponsive();
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationStatus, setInstallationStatus] = useState<'idle' | 'installing' | 'installed' | 'failed'>('idle');

  // Check if app is already installed
  useEffect(() => {
    const checkInstallation = () => {
      // Check if running as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone ||
                           document.referrer.includes('android-app://');
      
      // Check if app was installed via beforeinstallprompt
      const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
      
      setIsInstalled(isStandalone || wasInstalled);
    };

    checkInstallation();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstallation);

    return () => mediaQuery.removeEventListener('change', checkInstallation);
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt after delay if auto-show is enabled
      if (autoShow && !isInstalled) {
        setTimeout(() => {
          setShowPrompt(true);
        }, delay);
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      localStorage.setItem('pwa-installed', 'true');
      setIsInstalled(true);
      setInstallationStatus('installed');
      setShowPrompt(false);
      setShowDialog(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow, delay, isInstalled]);

  // Handle installation
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      setInstallationStatus('installing');
      
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setInstallationStatus('installed');
        localStorage.setItem('pwa-install-attempted', 'true');
      } else {
        console.log('User dismissed the install prompt');
        setInstallationStatus('failed');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      setShowDialog(false);
      
    } catch (error) {
      console.error('Error during PWA installation:', error);
      setInstallationStatus('failed');
    }
  }, [deferredPrompt]);

  // Handle prompt dismissal
  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    localStorage.setItem('pwa-prompt-dismissed-time', Date.now().toString());
  }, []);

  // Show detailed dialog
  const handleShowDetails = useCallback(() => {
    setShowPrompt(false);
    setShowDialog(true);
  }, []);

  // PWA features list
  const pwaFeatures = [
    {
      icon: <OfflineIcon color="primary" />,
      title: 'Work Offline',
      description: 'Access your tools even without an internet connection',
    },
    {
      icon: <SpeedIcon color="primary" />,
      title: 'Faster Performance',
      description: 'Lightning-fast loading and smooth interactions',
    },
    {
      icon: <HomeIcon color="primary" />,
      title: 'Home Screen Access',
      description: 'Add to your home screen for quick access',
    },
    {
      icon: <NotificationsIcon color="primary" />,
      title: 'Push Notifications',
      description: 'Stay updated with new tools and features',
    },
  ];

  // Don't show if already installed or no prompt available
  if (isInstalled || (!deferredPrompt && !showDialog)) {
    return null;
  }

  // Check if prompt was recently dismissed
  const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time');
  const recentlyDismissed = dismissedTime && 
    (Date.now() - parseInt(dismissedTime)) < 7 * 24 * 60 * 60 * 1000; // 7 days

  if (recentlyDismissed && !showDialog) {
    return null;
  }

  return (
    <>
      {/* Simple Snackbar Prompt */}
      <Snackbar
        open={showPrompt && !showDialog}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'top', 
          horizontal: 'center' 
        }}
        onClose={handleDismiss}
        sx={{
          bottom: isMobile ? 80 : undefined, // Account for mobile UI
        }}
      >
        <Alert
          severity="info"
          variant="filled"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleShowDetails}
                sx={{ fontWeight: 600 }}
              >
                Learn More
              </Button>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleInstall}
                startIcon={<InstallIcon />}
                sx={{ fontWeight: 600 }}
              >
                Install
              </Button>
              <IconButton size="small" onClick={handleDismiss} color="inherit">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{
            minWidth: isMobile ? 320 : 400,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
            Install {appName}
          </Typography>
          <Typography variant="caption">
            Get the full app experience with offline access
          </Typography>
        </Alert>
      </Snackbar>

      {/* Detailed Installation Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Install {appName}
            </Typography>
            <IconButton onClick={() => setShowDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Get the best experience with our Progressive Web App. Install {appName} 
            for faster performance and offline access.
          </Typography>

          {showFeatures && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  App Features:
                </Typography>
                
                <List dense>
                  {pwaFeatures.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {feature.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {feature.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {feature.description}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Installation instructions for different devices */}
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Installation tip:
            </Typography>
            <Typography variant="body2">
              {isMobile 
                ? "Tap 'Install' below or use your browser's 'Add to Home Screen' option."
                : "Click 'Install' below or look for the install icon in your browser's address bar."
              }
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setShowDialog(false)} color="inherit">
            Maybe Later
          </Button>
          <Button
            onClick={handleInstall}
            variant="contained"
            startIcon={<InstallIcon />}
            disabled={installationStatus === 'installing'}
            sx={{
              minWidth: 120,
              fontWeight: 600,
            }}
          >
            {installationStatus === 'installing' ? 'Installing...' : 'Install App'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * Hook to manually trigger PWA install prompt
 */
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    // Check initial state
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone;
    setIsInstalled(isStandalone);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return { canInstall, isInstalled };
}