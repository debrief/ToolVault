/**
 * Focus management utilities for accessibility
 * Provides utilities for managing focus, focus trapping, and keyboard navigation
 */

export class FocusManager {
  private static focusHistory: HTMLElement[] = [];

  /**
   * Save the currently focused element to history
   */
  static saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement);
    }
  }

  /**
   * Restore focus to the most recently saved element
   */
  static restoreFocus(): void {
    const lastFocused = this.focusHistory.pop();
    if (lastFocused && document.body.contains(lastFocused)) {
      try {
        lastFocused.focus();
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      }
    }
  }

  /**
   * Clear the focus history
   */
  static clearFocusHistory(): void {
    this.focusHistory = [];
  }

  /**
   * Trap focus within a container element
   * @param container - The element to trap focus within
   * @returns Cleanup function to remove the trap
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) {
      return () => {}; // No focusable elements, no trap needed
    }

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus the first element initially
    firstFocusable.focus();

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab (backward navigation)
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab (forward navigation)
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Get all focusable elements within a container
   * @param container - The container to search within
   * @returns NodeList of focusable elements
   */
  static getFocusableElements(container: HTMLElement): NodeListOf<Element> {
    return container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), [contenteditable="true"]'
    );
  }

  /**
   * Check if an element is currently visible and focusable
   * @param element - The element to check
   * @returns True if the element is focusable
   */
  static isElementFocusable(element: HTMLElement): boolean {
    if (!element || element.hasAttribute('disabled') || element.getAttribute('tabindex') === '-1') {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  /**
   * Find the next focusable element in the DOM
   * @param currentElement - The current element
   * @param direction - Direction to search ('forward' or 'backward')
   * @returns The next focusable element or null
   */
  static findNextFocusableElement(
    currentElement: HTMLElement, 
    direction: 'forward' | 'backward' = 'forward'
  ): HTMLElement | null {
    const allFocusable = Array.from(document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    )) as HTMLElement[];

    const currentIndex = allFocusable.indexOf(currentElement);
    if (currentIndex === -1) return null;

    const nextIndex = direction === 'forward' 
      ? (currentIndex + 1) % allFocusable.length
      : (currentIndex - 1 + allFocusable.length) % allFocusable.length;

    return allFocusable[nextIndex];
  }

  /**
   * Move focus to the first focusable element in a container
   * @param container - The container to search within
   * @returns True if focus was moved, false otherwise
   */
  static focusFirstElement(container: HTMLElement): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      if (this.isElementFocusable(firstElement)) {
        firstElement.focus();
        return true;
      }
    }
    return false;
  }

  /**
   * Move focus to the last focusable element in a container
   * @param container - The container to search within
   * @returns True if focus was moved, false otherwise
   */
  static focusLastElement(container: HTMLElement): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      if (this.isElementFocusable(lastElement)) {
        lastElement.focus();
        return true;
      }
    }
    return false;
  }
}

/**
 * Keyboard navigation constants for consistent key handling
 */
export const KEYBOARD_KEYS = {
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

export type KeyboardKey = typeof KEYBOARD_KEYS[keyof typeof KEYBOARD_KEYS];

/**
 * Utility function to check if a keyboard event matches a specific key
 * @param event - The keyboard event
 * @param key - The key to check for
 * @returns True if the event matches the key
 */
export function isKeyPressed(event: KeyboardEvent, key: KeyboardKey): boolean {
  return event.key === key;
}

/**
 * Utility function to check if any modifier keys are pressed
 * @param event - The keyboard event
 * @returns True if any modifier key is pressed
 */
export function hasModifierKey(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
}

/**
 * Create a keyboard event handler that prevents default behavior
 * @param handler - The handler function to call
 * @returns Event handler function
 */
export function createKeyboardHandler(handler: (event: KeyboardEvent) => void) {
  return (event: KeyboardEvent) => {
    event.preventDefault();
    handler(event);
  };
}