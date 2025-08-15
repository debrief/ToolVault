import { useState, useEffect } from 'react';

/**
 * LiveRegion component for screen reader announcements
 * Provides a way to announce dynamic content changes to screen readers
 */
export function LiveRegion() {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  useEffect(() => {
    const announceUpdate = (event: CustomEvent<{ message: string; politeness?: 'polite' | 'assertive' }>) => {
      const { message: newMessage, politeness: newPoliteness = 'polite' } = event.detail;
      
      setPoliteness(newPoliteness);
      setMessage(newMessage);
      
      // Clear message after announcement to allow repeated announcements of the same message
      const timeoutId = setTimeout(() => setMessage(''), 100);
      
      return () => clearTimeout(timeoutId);
    };

    window.addEventListener('announce', announceUpdate as EventListener);
    return () => window.removeEventListener('announce', announceUpdate as EventListener);
  }, []);

  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      role="status"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {message}
    </div>
  );
}

/**
 * Utility function to announce messages to screen readers
 * @param message - The message to announce
 * @param politeness - How urgently to announce ('polite' or 'assertive')
 */
export function announceToScreenReader(
  message: string, 
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  window.dispatchEvent(
    new CustomEvent('announce', { 
      detail: { message, politeness } 
    })
  );
}

/**
 * Hook for announcing messages to screen readers
 */
export function useScreenReaderAnnouncements() {
  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, politeness);
  };

  const announcePolite = (message: string) => {
    announce(message, 'polite');
  };

  const announceAssertive = (message: string) => {
    announce(message, 'assertive');
  };

  const announceError = (message: string) => {
    announce(`Error: ${message}`, 'assertive');
  };

  const announceSuccess = (message: string) => {
    announce(`Success: ${message}`, 'polite');
  };

  const announceLoading = (message: string = 'Loading...') => {
    announce(message, 'polite');
  };

  const announceCompletion = (message: string) => {
    announce(`Completed: ${message}`, 'polite');
  };

  const announceNavigation = (destination: string) => {
    announce(`Navigated to ${destination}`, 'polite');
  };

  const announceSearch = (query: string, resultCount: number) => {
    const message = query 
      ? `Search for "${query}" returned ${resultCount} result${resultCount === 1 ? '' : 's'}`
      : `Showing all ${resultCount} result${resultCount === 1 ? '' : 's'}`;
    announce(message, 'polite');
  };

  const announceFilter = (filterType: string, value: string, resultCount: number) => {
    announce(
      `Filtered by ${filterType}: ${value}. ${resultCount} result${resultCount === 1 ? '' : 's'} found.`, 
      'polite'
    );
  };

  const announceSortChange = (field: string, direction: 'asc' | 'desc') => {
    announce(
      `Sorted by ${field} in ${direction === 'asc' ? 'ascending' : 'descending'} order`, 
      'polite'
    );
  };

  return {
    announce,
    announcePolite,
    announceAssertive,
    announceError,
    announceSuccess,
    announceLoading,
    announceCompletion,
    announceNavigation,
    announceSearch,
    announceFilter,
    announceSortChange,
  };
}

/**
 * Status component for screen reader announcements with visual indicator
 * Useful for status updates that should be visible to all users
 */
export interface StatusAnnouncementProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  politeness?: 'polite' | 'assertive';
  showVisually?: boolean;
  children?: React.ReactNode;
}

export function StatusAnnouncement({ 
  message, 
  type = 'info',
  politeness = 'polite',
  showVisually = false,
  children 
}: StatusAnnouncementProps) {
  useEffect(() => {
    if (message) {
      announceToScreenReader(message, politeness);
    }
  }, [message, politeness]);

  if (!showVisually) {
    return (
      <div
        role="status"
        aria-live={politeness}
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>
    );
  }

  const getAriaLabel = () => {
    switch (type) {
      case 'success':
        return 'Success message';
      case 'warning':
        return 'Warning message';
      case 'error':
        return 'Error message';
      default:
        return 'Information message';
    }
  };

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      aria-label={getAriaLabel()}
    >
      {children || message}
    </div>
  );
}