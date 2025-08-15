import { useRef, useCallback, useEffect } from 'react';
import { FocusManager } from '../utils/focusManagement';

/**
 * Hook for managing focus in components
 * Provides utilities to save and restore focus, particularly useful for modals and dialogs
 */
export function useFocusManagement() {
  const restoreFocus = useRef<HTMLElement | null>(null);
  const trapCleanup = useRef<(() => void) | null>(null);

  /**
   * Save the currently focused element
   */
  const saveFocus = useCallback(() => {
    restoreFocus.current = document.activeElement as HTMLElement;
  }, []);

  /**
   * Restore focus to the previously saved element
   */
  const restoreFocusTo = useCallback(() => {
    if (restoreFocus.current && document.body.contains(restoreFocus.current)) {
      try {
        restoreFocus.current.focus();
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      }
    }
  }, []);

  /**
   * Trap focus within a container element
   * @param container - The element to trap focus within
   */
  const trapFocus = useCallback((container: HTMLElement | null) => {
    // Clean up previous trap
    if (trapCleanup.current) {
      trapCleanup.current();
      trapCleanup.current = null;
    }

    if (container) {
      trapCleanup.current = FocusManager.trapFocus(container);
    }
  }, []);

  /**
   * Release focus trap
   */
  const releaseFocusTrap = useCallback(() => {
    if (trapCleanup.current) {
      trapCleanup.current();
      trapCleanup.current = null;
    }
  }, []);

  /**
   * Focus the first focusable element in a container
   * @param container - The container to search within
   */
  const focusFirstElement = useCallback((container: HTMLElement | null) => {
    if (container) {
      FocusManager.focusFirstElement(container);
    }
  }, []);

  /**
   * Focus the last focusable element in a container
   * @param container - The container to search within
   */
  const focusLastElement = useCallback((container: HTMLElement | null) => {
    if (container) {
      FocusManager.focusLastElement(container);
    }
  }, []);

  // Clean up focus trap on unmount
  useEffect(() => {
    return () => {
      if (trapCleanup.current) {
        trapCleanup.current();
      }
    };
  }, []);

  return {
    saveFocus,
    restoreFocus: restoreFocusTo,
    trapFocus,
    releaseFocusTrap,
    focusFirstElement,
    focusLastElement,
  };
}

/**
 * Hook for managing focus within a specific container element
 * @param containerRef - Ref to the container element
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  const { trapFocus, releaseFocusTrap } = useFocusManagement();

  useEffect(() => {
    if (containerRef.current) {
      trapFocus(containerRef.current);
    }

    return releaseFocusTrap;
  }, [trapFocus, releaseFocusTrap, containerRef]);
}

/**
 * Hook for managing focus restoration when a component unmounts
 */
export function useFocusRestore() {
  const { saveFocus, restoreFocus } = useFocusManagement();

  useEffect(() => {
    // Save focus when component mounts
    saveFocus();

    // Restore focus when component unmounts
    return restoreFocus;
  }, [saveFocus, restoreFocus]);

  return { saveFocus, restoreFocus };
}