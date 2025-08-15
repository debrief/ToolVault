import React, { 
  createContext, 
  useContext, 
  ReactNode, 
  useState, 
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide,
  SlideProps,
  Grow,
  GrowProps,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  persist?: boolean;
  action?: React.ReactNode;
  onClose?: () => void;
  preventDuplicate?: boolean;
}

export interface Notification extends Required<Omit<NotificationOptions, 'action' | 'onClose'>> {
  id: string;
  timestamp: number;
  action?: React.ReactNode;
  onClose?: () => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  showNotification: (options: NotificationOptions) => string;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showSuccess: (message: string, options?: Partial<NotificationOptions>) => string;
  showError: (message: string, options?: Partial<NotificationOptions>) => string;
  showWarning: (message: string, options?: Partial<NotificationOptions>) => string;
  showInfo: (message: string, options?: Partial<NotificationOptions>) => string;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Transition components
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

function GrowTransition(props: GrowProps) {
  return <Grow {...props} />;
}

export interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  transition?: 'slide' | 'grow';
}

export function NotificationProvider({
  children,
  maxNotifications = 3,
  defaultDuration = 6000,
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  transition = 'slide',
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const notificationQueue = useRef<Notification[]>([]);

  // Generate unique ID for notifications
  const generateId = useCallback(() => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Clear timeout for a notification
  const clearNotificationTimeout = useCallback((id: string) => {
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  // Remove notification from queue and state
  const removeNotification = useCallback((id: string) => {
    clearNotificationTimeout(id);
    
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== id);
      
      // If this was the current notification, show next in queue
      if (currentNotification?.id === id) {
        setCurrentNotification(null);
        setIsOpen(false);
      }
      
      return filtered;
    });
  }, [currentNotification, clearNotificationTimeout]);

  // Process notification queue
  useEffect(() => {
    if (!currentNotification && notifications.length > 0) {
      const nextNotification = notifications[0];
      setCurrentNotification(nextNotification);
      setIsOpen(true);

      // Set timeout for auto-dismiss
      if (!nextNotification.persist) {
        const timeout = setTimeout(() => {
          removeNotification(nextNotification.id);
        }, nextNotification.duration);
        
        timeoutRefs.current.set(nextNotification.id, timeout);
      }
    }
  }, [currentNotification, notifications, removeNotification]);

  const showNotification = useCallback((options: NotificationOptions): string => {
    const id = generateId();
    
    const notification: Notification = {
      id,
      type: options.type,
      message: options.message,
      title: options.title || '',
      duration: options.duration ?? defaultDuration,
      persist: options.persist ?? false,
      timestamp: Date.now(),
      action: options.action,
      onClose: options.onClose,
      preventDuplicate: options.preventDuplicate ?? false,
    };

    setNotifications(prev => {
      // Check for duplicates if enabled
      if (notification.preventDuplicate) {
        const isDuplicate = prev.some(n => 
          n.message === notification.message && 
          n.type === notification.type &&
          (Date.now() - n.timestamp) < 5000 // Within 5 seconds
        );
        
        if (isDuplicate) {
          return prev;
        }
      }

      // Limit number of notifications
      let newNotifications = [...prev, notification];
      if (newNotifications.length > maxNotifications) {
        const removedNotifications = newNotifications.slice(0, newNotifications.length - maxNotifications);
        removedNotifications.forEach(n => clearNotificationTimeout(n.id));
        newNotifications = newNotifications.slice(-maxNotifications);
      }

      return newNotifications;
    });

    return id;
  }, [generateId, defaultDuration, maxNotifications, clearNotificationTimeout]);

  const hideNotification = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  const clearAllNotifications = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    
    setNotifications([]);
    setCurrentNotification(null);
    setIsOpen(false);
  }, []);

  // Helper methods for different notification types
  const showSuccess = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return showNotification({ ...options, type: 'success', message });
  }, [showNotification]);

  const showError = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return showNotification({ 
      ...options, 
      type: 'error', 
      message,
      duration: options?.duration ?? 8000, // Errors stay longer
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return showNotification({ ...options, type: 'warning', message });
  }, [showNotification]);

  const showInfo = useCallback((message: string, options?: Partial<NotificationOptions>) => {
    return showNotification({ ...options, type: 'info', message });
  }, [showNotification]);

  const handleClose = useCallback((event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    
    if (currentNotification) {
      currentNotification.onClose?.();
      removeNotification(currentNotification.id);
    }
  }, [currentNotification, removeNotification]);

  const handleExited = useCallback(() => {
    // Process next notification in queue after exit animation completes
    setCurrentNotification(null);
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  const TransitionComponent = transition === 'slide' ? SlideTransition : GrowTransition;

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      <Snackbar
        open={isOpen}
        autoHideDuration={currentNotification?.persist ? null : currentNotification?.duration}
        onClose={handleClose}
        onExited={handleExited}
        anchorOrigin={anchorOrigin}
        TransitionComponent={TransitionComponent}
        sx={{
          '& .MuiSnackbarContent-root': {
            padding: 0,
          },
        }}
      >
        {currentNotification && (
          <Alert
            onClose={handleClose}
            severity={currentNotification.type}
            variant="filled"
            action={
              currentNotification.action || (
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={handleClose}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )
            }
            sx={{ minWidth: 300 }}
          >
            {currentNotification.title && (
              <AlertTitle>{currentNotification.title}</AlertTitle>
            )}
            {currentNotification.message}
          </Alert>
        )}
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Hook for error notifications with automatic error parsing
export const useErrorNotification = () => {
  const { showError } = useNotification();

  const notifyError = useCallback((error: Error | string, options?: Partial<NotificationOptions>) => {
    const message = typeof error === 'string' ? error : error.message;
    const title = typeof error === 'object' && 'name' in error ? error.name : undefined;
    
    return showError(message, { title, ...options });
  }, [showError]);

  return { notifyError };
};