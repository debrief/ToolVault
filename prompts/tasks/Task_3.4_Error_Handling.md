# APM Task Assignment: Implement Error Handling and Loading States

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 3, Task 3.4** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Implement comprehensive error handling and user feedback systems with loading states and graceful degradation.

**Prerequisites:** Tasks 3.1, 3.2, and 3.3 completed - Testing infrastructure and performance optimizations should be in place.

## 2. Detailed Action Steps

1. **Create Global Error Boundary System:**
   - Implement root error boundary:
     ```typescript
     // src/components/common/ErrorBoundary.tsx
     export class ErrorBoundary extends React.Component<
       { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
       { hasError: boolean; error: Error | null }
     > {
       constructor(props: any) {
         super(props);
         this.state = { hasError: false, error: null };
       }

       static getDerivedStateFromError(error: Error) {
         return { hasError: true, error };
       }

       componentDidCatch(error: Error, errorInfo: ErrorInfo) {
         console.error('Error boundary caught an error:', error, errorInfo);
         // Send to error reporting service
         this.reportError(error, errorInfo);
       }

       reportError = (error: Error, errorInfo: ErrorInfo) => {
         // Implement error reporting to analytics service
         const errorReport = {
           message: error.message,
           stack: error.stack,
           componentStack: errorInfo.componentStack,
           timestamp: new Date().toISOString(),
         };
         console.error('Error Report:', errorReport);
       };

       render() {
         if (this.state.hasError) {
           const FallbackComponent = this.props.fallback || ErrorFallback;
           return <FallbackComponent error={this.state.error!} />;
         }

         return this.props.children;
       }
     }
     ```
   - Create route-specific error boundaries for better error isolation
   - Implement error recovery mechanisms

2. **Build Error Display Components:**
   - Create comprehensive error fallback component:
     ```typescript
     // src/components/common/ErrorFallback.tsx
     export function ErrorFallback({ error }: { error: Error }) {
       return (
         <Container maxWidth="md" sx={{ py: 4 }}>
           <Paper sx={{ p: 4, textAlign: 'center' }}>
             <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
             <Typography variant="h4" gutterBottom>
               Something went wrong
             </Typography>
             <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
               We encountered an unexpected error. Please try refreshing the page.
             </Typography>
             <Box sx={{ mb: 3 }}>
               <Button
                 variant="contained"
                 onClick={() => window.location.reload()}
                 sx={{ mr: 2 }}
               >
                 Reload Page
               </Button>
               <Button
                 variant="outlined"
                 onClick={() => (window.location.href = '/')}
               >
                 Go Home
               </Button>
             </Box>
             {process.env.NODE_ENV === 'development' && (
               <Accordion>
                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                   <Typography>Error Details</Typography>
                 </AccordionSummary>
                 <AccordionDetails>
                   <Typography component="pre" sx={{ fontSize: '0.75rem' }}>
                     {error.stack}
                   </Typography>
                 </AccordionDetails>
               </Accordion>
             )}
           </Paper>
         </Container>
       );
     }
     ```
   - Create network error component:
     ```typescript
     // src/components/common/NetworkError.tsx
     export function NetworkError({ onRetry }: { onRetry: () => void }) {
       return (
         <Alert
           severity="error"
           action={
             <Button color="inherit" size="small" onClick={onRetry}>
               Retry
             </Button>
           }
         >
           Unable to load data. Please check your connection and try again.
         </Alert>
       );
     }
     ```
   - Create inline error messages for form validation

3. **Implement Loading State System:**
   - Create skeleton screen components:
     ```typescript
     // src/components/common/ToolListSkeleton.tsx
     export function ToolListSkeleton() {
       return (
         <Container maxWidth="lg" sx={{ py: 3 }}>
           <Box sx={{ mb: 4 }}>
             <Skeleton variant="text" width="40%" height={60} sx={{ mb: 2 }} />
             <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
             <Skeleton variant="text" width="80%" height={24} />
           </Box>
           <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
             {Array.from({ length: 6 }).map((_, index) => (
               <Card key={index}>
                 <CardContent>
                   <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
                   <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
                   <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
                   <Skeleton variant="text" width="60%" height={16} sx={{ mb: 2 }} />
                   <Box sx={{ display: 'flex', gap: 1 }}>
                     <Skeleton variant="rounded" width={60} height={24} />
                     <Skeleton variant="rounded" width={80} height={24} />
                   </Box>
                 </CardContent>
               </Card>
             ))}
           </Box>
         </Container>
       );
     }
     ```
   - Create progress indicators for data fetching:
     ```typescript
     // src/components/common/LoadingSpinner.tsx
     export function LoadingSpinner({ 
       size = 40, 
       message = 'Loading...',
       fullScreen = false 
     }: LoadingSpinnerProps) {
       const content = (
         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
           <CircularProgress size={size} />
           <Typography variant="body2" color="text.secondary">
             {message}
           </Typography>
         </Box>
       );

       if (fullScreen) {
         return (
           <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
             {content}
           </Backdrop>
         );
       }

       return content;
     }
     ```
   - Implement progressive loading with suspense boundaries

4. **Create Notification System:**
   - Build toast notification system:
     ```typescript
     // src/components/common/NotificationProvider.tsx
     interface NotificationContextType {
       showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
     }

     export const NotificationContext = createContext<NotificationContextType | null>(null);

     export function NotificationProvider({ children }: { children: ReactNode }) {
       const [notification, setNotification] = useState<{
         message: string;
         type: 'success' | 'error' | 'info' | 'warning';
       } | null>(null);

       const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
         setNotification({ message, type });
       }, []);

       const handleClose = () => {
         setNotification(null);
       };

       return (
         <NotificationContext.Provider value={{ showNotification }}>
           {children}
           <Snackbar
             open={!!notification}
             autoHideDuration={6000}
             onClose={handleClose}
             anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
           >
             <Alert onClose={handleClose} severity={notification?.type} variant="filled">
               {notification?.message}
             </Alert>
           </Snackbar>
         </NotificationContext.Provider>
       );
     }

     export const useNotification = () => {
       const context = useContext(NotificationContext);
       if (!context) {
         throw new Error('useNotification must be used within NotificationProvider');
       }
       return context;
     };
     ```
   - Add inline error messages for forms
   - Create success confirmations for user actions

## 3. Enhanced Data Service Error Handling

**Robust Error Handling in Services:**
```typescript
// src/services/toolVaultService.ts - Enhanced error handling
export interface ServiceError {
  type: 'network' | 'validation' | 'not_found' | 'server' | 'unknown';
  message: string;
  code?: string;
  retryable: boolean;
}

export class ToolVaultServiceError extends Error {
  constructor(
    message: string,
    public readonly serviceError: ServiceError
  ) {
    super(message);
    this.name = 'ToolVaultServiceError';
  }
}

export const fetchToolVaultIndex = async (retries = 3): Promise<ToolVaultIndex> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('/data/index.json');
      
      if (!response.ok) {
        throw new ToolVaultServiceError(
          `HTTP ${response.status}: ${response.statusText}`,
          {
            type: response.status === 404 ? 'not_found' : 'server',
            message: `Failed to fetch tool data (${response.status})`,
            code: response.status.toString(),
            retryable: response.status >= 500 && response.status < 600,
          }
        );
      }
      
      const data = await response.json();
      
      // Validate data structure
      if (!isValidToolVaultIndex(data)) {
        throw new ToolVaultServiceError(
          'Invalid data structure received',
          {
            type: 'validation',
            message: 'The received data does not match the expected format',
            retryable: false,
          }
        );
      }
      
      return data;
    } catch (error) {
      if (error instanceof ToolVaultServiceError) {
        if (!error.serviceError.retryable || attempt === retries) {
          throw error;
        }
      } else {
        // Network or other errors
        if (attempt === retries) {
          throw new ToolVaultServiceError(
            'Failed to load tool data after multiple attempts',
            {
              type: 'network',
              message: 'Unable to connect to the server. Please check your internet connection.',
              retryable: true,
            }
          );
        }
      }
      
      // Exponential backoff delay
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new ToolVaultServiceError(
    'Unexpected error in retry logic',
    {
      type: 'unknown',
      message: 'An unexpected error occurred',
      retryable: false,
    }
  );
};
```

## 4. Offline Detection and Fallbacks

**Offline Capability:**
```typescript
// src/hooks/useNetworkStatus.ts
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setWasOffline(false);
        // Show reconnection notification
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// src/components/common/OfflineBanner.tsx
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <Alert severity="warning" sx={{ borderRadius: 0 }}>
      <AlertTitle>You're offline</AlertTitle>
      Some features may not be available. We'll restore full functionality when your connection returns.
    </Alert>
  );
}
```

## 5. Form Validation and Error States

**Input Validation System:**
```typescript
// src/utils/validation.ts
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateToolInput(input: ToolInput, value: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (input.required && (value === undefined || value === null || value === '')) {
    errors[input.name] = `${input.label} is required`;
  }

  if (value !== undefined && value !== null && value !== '') {
    switch (input.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors[input.name] = `${input.label} must be a valid number`;
        } else {
          const num = Number(value);
          if (input.minimum !== undefined && num < input.minimum) {
            errors[input.name] = `${input.label} must be at least ${input.minimum}`;
          }
          if (input.maximum !== undefined && num > input.maximum) {
            errors[input.name] = `${input.label} must be at most ${input.maximum}`;
          }
        }
        break;
      case 'string':
        if (input.minLength !== undefined && value.length < input.minLength) {
          errors[input.name] = `${input.label} must be at least ${input.minLength} characters`;
        }
        if (input.maxLength !== undefined && value.length > input.maxLength) {
          errors[input.name] = `${input.label} must be at most ${input.maxLength} characters`;
        }
        break;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

## 6. Error Recovery and Retry Mechanisms

**Smart Retry System:**
```typescript
// src/hooks/useRetry.ts
export function useRetry<T>(
  asyncFn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
  } = {}
) {
  const { maxAttempts = 3, delay = 1000, backoff = 'exponential' } = options;
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async () => {
    if (attempts >= maxAttempts) {
      throw new Error(`Max retry attempts (${maxAttempts}) exceeded`);
    }

    setIsRetrying(true);
    setAttempts(prev => prev + 1);

    try {
      const result = await asyncFn();
      setAttempts(0);
      return result;
    } catch (error) {
      if (attempts + 1 < maxAttempts) {
        const retryDelay = backoff === 'exponential' 
          ? delay * Math.pow(2, attempts)
          : delay;
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return retry();
      }
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [asyncFn, attempts, maxAttempts, delay, backoff]);

  return { retry, attempts, isRetrying, canRetry: attempts < maxAttempts };
}
```

## 7. Expected Output & Deliverables

**Success Criteria:**
- Graceful handling of all error scenarios
- Comprehensive loading states throughout the application
- User-friendly error messages with recovery options
- Offline detection and appropriate fallbacks
- Form validation with clear error feedback
- No unhandled promise rejections or console errors

**Deliverables:**
1. **Error Handling Components:**
   - `src/components/common/ErrorBoundary.tsx`
   - `src/components/common/ErrorFallback.tsx`
   - `src/components/common/NetworkError.tsx`
   - `src/components/common/NotificationProvider.tsx`

2. **Loading State Components:**
   - `src/components/common/ToolListSkeleton.tsx`
   - `src/components/common/ToolDetailSkeleton.tsx`
   - `src/components/common/LoadingSpinner.tsx`
   - `src/components/common/PageSkeleton.tsx`

3. **Utility Functions and Hooks:**
   - `src/utils/validation.ts`
   - `src/hooks/useNetworkStatus.ts`
   - `src/hooks/useRetry.ts`
   - Enhanced `src/services/toolVaultService.ts`

4. **UI Enhancements:**
   - `src/components/common/OfflineBanner.tsx`
   - Updated form components with validation states
   - Enhanced error boundaries in routing

## 8. Integration Requirements

**Update Main App Structure:**
```typescript
// src/main.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <NotificationProvider>
              <OfflineBanner />
              <AppRouter />
            </NotificationProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

## 9. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_3_Testing_Polish/Task_3.4_Error_Handling_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_Frontend_Dev)
- Task reference (Phase 3 / Task 3.4)
- Error handling strategy implemented
- Loading states and user feedback systems
- Validation and retry mechanisms
- Integration with existing components
- Testing approach for error scenarios

Please acknowledge receipt and proceed with implementation.