import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClientProvider } from './contexts/QueryClientProvider'
import { AppRouter } from './router/AppRouter'
import { createAccessibleTheme, getPreferredThemeMode } from './theme/accessibleTheme'
import { initWebVitals } from './utils/performance'

// Error handling components
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { NotificationProvider } from './components/common/NotificationProvider'
import { OfflineBanner } from './components/common/OfflineBanner'
import { PageLoader } from './components/common/LoadingSpinner'

// Accessibility components
import { LiveRegion } from './components/common/LiveRegion'
import { HelpSystem } from './components/help/HelpSystem'
import { useGlobalKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

import './index.css'

// Initialize performance monitoring
initWebVitals();

// Start performance budget monitoring in development
if (process.env.NODE_ENV === 'development') {
  import('./utils/performance').then(({ performanceBudgetMonitor }) => {
    performanceBudgetMonitor.startMonitoring(30000); // Check every 30 seconds
  });
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Prevent default browser error handling in development
  if (process.env.NODE_ENV === 'development') {
    event.preventDefault();
  }
});

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Accessibility-enhanced App component with all providers and error boundaries
function App() {
  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts();
  
  // Get preferred theme based on system preferences
  const preferredTheme = createAccessibleTheme(getPreferredThemeMode());
  
  return (
    <StrictMode>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Root error boundary:', { error, errorInfo });
        }}
        resetOnPropsChange
      >
        <BrowserRouter>
          <QueryClientProvider>
            <ThemeProvider theme={preferredTheme}>
              <CssBaseline />
              {/* Screen reader announcements */}
              <LiveRegion />
              
              <NotificationProvider
                maxNotifications={3}
                defaultDuration={6000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transition="slide"
              >
                <OfflineBanner
                  showReconnectButton
                  showConnectionQuality
                  showReconnectAttempts
                  dismissible={false}
                  position="top"
                />
                
                <Suspense 
                  fallback={
                    <PageLoader 
                      message="Loading application..." 
                      show 
                      delay={200}
                    />
                  }
                >
                  <ErrorBoundary
                    onError={(error, errorInfo) => {
                      console.error('App router error boundary:', { error, errorInfo });
                    }}
                  >
                    {/* Main application content with skip link */}
                    <div role="application" aria-label="ToolVault Analysis Tools Catalog">
                      <a 
                        href="#main-content" 
                        className="skip-link"
                        style={{
                          position: 'absolute',
                          top: '-40px',
                          left: '6px',
                          background: '#000',
                          color: '#fff',
                          padding: '8px',
                          textDecoration: 'none',
                          borderRadius: '0 0 4px 4px',
                          zIndex: 9999,
                          transition: 'top 0.2s ease-in-out',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.top = '0';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.top = '-40px';
                        }}
                      >
                        Skip to main content
                      </a>
                      <AppRouter />
                    </div>
                  </ErrorBoundary>
                </Suspense>
                
                {/* Global help system */}
                <HelpSystem />
              </NotificationProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  );
}

// Render the app with error boundary protection
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is an element with id="root" in your HTML.');
}

const root = createRoot(rootElement);

// Additional safety wrapper for catastrophic failures
try {
  root.render(<App />);
} catch (error) {
  console.error('Fatal error during app initialization:', error);
  
  // Fallback error UI
  rootElement.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        max-width: 500px;
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <h1 style="color: #e74c3c; margin-bottom: 20px;">Application Failed to Load</h1>
        <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
          We're sorry, but the application encountered a critical error during startup. 
          Please try refreshing the page or contact support if the problem persists.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-right: 10px;
          "
        >
          Refresh Page
        </button>
        <button 
          onclick="window.location.href = '/'" 
          style="
            background: #95a5a6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          "
        >
          Go Home
        </button>
      </div>
    </div>
  `;
}
