import { useEffect, useCallback } from 'react';
import { KEYBOARD_KEYS, isKeyPressed, hasModifierKey } from '../utils/focusManagement';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcuts to register
 * @param enabled - Whether the shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[], 
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't handle shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    const isInputElement = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';

    // Allow Escape key even in input fields
    if (isInputElement && event.key !== KEYBOARD_KEYS.ESCAPE) {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;

      return keyMatches && ctrlMatches && metaMatches && altMatches && shiftMatches;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      matchingShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

/**
 * Hook for global application keyboard shortcuts
 */
export function useGlobalKeyboardShortcuts() {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('[aria-label*="Search"], [placeholder*="Search"], input[type="search"]') as HTMLElement;
        searchInput?.focus();
      },
    },
    {
      key: 'k',
      metaKey: true,
      description: 'Focus search (Mac)',
      action: () => {
        const searchInput = document.querySelector('[aria-label*="Search"], [placeholder*="Search"], input[type="search"]') as HTMLElement;
        searchInput?.focus();
      },
    },
    {
      key: '/',
      ctrlKey: true,
      description: 'Open help',
      action: () => {
        const helpButton = document.querySelector('[aria-label*="help" i], [title*="help" i]') as HTMLElement;
        helpButton?.click();
      },
    },
    {
      key: '/',
      metaKey: true,
      description: 'Open help (Mac)',
      action: () => {
        const helpButton = document.querySelector('[aria-label*="help" i], [title*="help" i]') as HTMLElement;
        helpButton?.click();
      },
    },
    {
      key: 'h',
      ctrlKey: true,
      description: 'Go to homepage',
      action: () => {
        window.location.href = '/';
      },
    },
    {
      key: 'h',
      metaKey: true,
      description: 'Go to homepage (Mac)',
      action: () => {
        window.location.href = '/';
      },
    },
    {
      key: KEYBOARD_KEYS.ESCAPE,
      description: 'Close dialogs or clear focus',
      action: () => {
        // Close any open dialogs
        const dialogs = document.querySelectorAll('[role="dialog"]:not([aria-hidden="true"])');
        if (dialogs.length > 0) {
          const topDialog = dialogs[dialogs.length - 1];
          const closeButton = topDialog.querySelector('[aria-label*="close" i], button[data-testid*="close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
            return;
          }
        }

        // Close any open menus
        const menus = document.querySelectorAll('[role="menu"]:not([aria-hidden="true"])');
        if (menus.length > 0) {
          const topMenu = menus[menus.length - 1];
          const button = document.querySelector(`[aria-expanded="true"][aria-controls="${topMenu.id}"]`) as HTMLElement;
          if (button) {
            button.click();
            return;
          }
        }

        // Clear focus from search inputs
        const searchInputs = document.querySelectorAll('input[type="search"], [aria-label*="Search"]') as NodeListOf<HTMLInputElement>;
        searchInputs.forEach(input => {
          if (document.activeElement === input && input.value === '') {
            input.blur();
          }
        });
      },
      preventDefault: false, // Allow default Escape behavior for input fields
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

/**
 * Hook for list navigation with arrow keys
 * @param items - Array of items
 * @param onSelect - Function called when an item is selected
 * @param containerRef - Ref to the list container
 */
export function useListNavigation<T>(
  items: T[],
  onSelect: (item: T, index: number) => void,
  containerRef: React.RefObject<HTMLElement>
) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: KEYBOARD_KEYS.ARROW_DOWN,
      description: 'Move to next item',
      action: () => {
        const container = containerRef.current;
        if (!container) return;

        const focusableItems = Array.from(container.querySelectorAll('[role="option"], [role="menuitem"], button, [tabindex="0"]')) as HTMLElement[];
        const currentIndex = focusableItems.findIndex(item => item === document.activeElement);
        const nextIndex = Math.min(currentIndex + 1, focusableItems.length - 1);
        
        if (focusableItems[nextIndex]) {
          focusableItems[nextIndex].focus();
        }
      },
    },
    {
      key: KEYBOARD_KEYS.ARROW_UP,
      description: 'Move to previous item',
      action: () => {
        const container = containerRef.current;
        if (!container) return;

        const focusableItems = Array.from(container.querySelectorAll('[role="option"], [role="menuitem"], button, [tabindex="0"]')) as HTMLElement[];
        const currentIndex = focusableItems.findIndex(item => item === document.activeElement);
        const prevIndex = Math.max(currentIndex - 1, 0);
        
        if (focusableItems[prevIndex]) {
          focusableItems[prevIndex].focus();
        }
      },
    },
    {
      key: KEYBOARD_KEYS.HOME,
      description: 'Move to first item',
      action: () => {
        const container = containerRef.current;
        if (!container) return;

        const focusableItems = Array.from(container.querySelectorAll('[role="option"], [role="menuitem"], button, [tabindex="0"]')) as HTMLElement[];
        if (focusableItems[0]) {
          focusableItems[0].focus();
        }
      },
    },
    {
      key: KEYBOARD_KEYS.END,
      description: 'Move to last item',
      action: () => {
        const container = containerRef.current;
        if (!container) return;

        const focusableItems = Array.from(container.querySelectorAll('[role="option"], [role="menuitem"], button, [tabindex="0"]')) as HTMLElement[];
        const lastItem = focusableItems[focusableItems.length - 1];
        if (lastItem) {
          lastItem.focus();
        }
      },
    },
    {
      key: KEYBOARD_KEYS.ENTER,
      description: 'Select current item',
      action: () => {
        const activeElement = document.activeElement as HTMLElement;
        const container = containerRef.current;
        if (!activeElement || !container) return;

        const focusableItems = Array.from(container.querySelectorAll('[role="option"], [role="menuitem"], button, [tabindex="0"]')) as HTMLElement[];
        const currentIndex = focusableItems.findIndex(item => item === activeElement);
        
        if (currentIndex >= 0 && currentIndex < items.length) {
          onSelect(items[currentIndex], currentIndex);
        }
      },
    },
    {
      key: KEYBOARD_KEYS.SPACE,
      description: 'Select current item',
      action: () => {
        const activeElement = document.activeElement as HTMLElement;
        const container = containerRef.current;
        if (!activeElement || !container) return;

        const focusableItems = Array.from(container.querySelectorAll('[role="option"], [role="menuitem"], button, [tabindex="0"]')) as HTMLElement[];
        const currentIndex = focusableItems.findIndex(item => item === activeElement);
        
        if (currentIndex >= 0 && currentIndex < items.length) {
          onSelect(items[currentIndex], currentIndex);
        }
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
}