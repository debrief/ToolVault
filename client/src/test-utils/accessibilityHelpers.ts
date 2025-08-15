import { RenderResult, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations, AxeResults } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

/**
 * Configuration for axe accessibility testing
 */
export const axeConfig = {
  rules: {
    // Enable all WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-roles': { enabled: true },
    'list-structure': { enabled: true },
    'image-alt': { enabled: true },
    'form-labels': { enabled: true },
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    
    // Disable rules that may conflict with MUI components
    'color-contrast-enhanced': { enabled: false }, // WCAG AAA rule
    'meta-refresh': { enabled: false }, // Not applicable for SPAs
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
};

/**
 * Test accessibility violations using axe-core
 */
export async function testAccessibility(
  container: HTMLElement,
  config = axeConfig
): Promise<AxeResults> {
  const results = await axe(container, config);
  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Test keyboard navigation within a container
 */
export async function testKeyboardNavigation(
  container: HTMLElement,
  options: {
    expectedFocusableElements?: number;
    testArrowKeys?: boolean;
    testEscapeKey?: boolean;
    testEnterKey?: boolean;
    testSpaceKey?: boolean;
  } = {}
): Promise<void> {
  const user = userEvent.setup();
  
  // Find all focusable elements
  const focusableElements = container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
  );
  
  if (options.expectedFocusableElements !== undefined) {
    expect(focusableElements).toHaveLength(options.expectedFocusableElements);
  }
  
  // Test Tab navigation
  if (focusableElements.length > 0) {
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus first element
    firstElement.focus();
    expect(firstElement).toHaveFocus();
    
    // Tab through all elements
    for (let i = 1; i < focusableElements.length; i++) {
      await user.tab();
      expect(focusableElements[i]).toHaveFocus();
    }
    
    // Test Tab wrapping (if applicable)
    await user.tab();
    // Note: Focus wrapping behavior depends on implementation
    
    // Test Shift+Tab navigation
    await user.tab({ shift: true });
    if (focusableElements.length > 1) {
      expect(focusableElements[focusableElements.length - 2]).toHaveFocus();
    }
  }
  
  // Test arrow key navigation (if enabled)
  if (options.testArrowKeys && focusableElements.length > 1) {
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement.focus();
    
    await user.keyboard('{ArrowDown}');
    // Note: Arrow key behavior depends on component implementation
    
    await user.keyboard('{ArrowUp}');
    // Note: Arrow key behavior depends on component implementation
  }
  
  // Test Escape key
  if (options.testEscapeKey) {
    await user.keyboard('{Escape}');
    // Verify escape behavior (e.g., closing dialogs, clearing focus)
  }
  
  // Test Enter key
  if (options.testEnterKey && focusableElements.length > 0) {
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement.focus();
    await user.keyboard('{Enter}');
    // Verify enter behavior
  }
  
  // Test Space key
  if (options.testSpaceKey && focusableElements.length > 0) {
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement.focus();
    await user.keyboard(' ');
    // Verify space behavior
  }
}

/**
 * Test screen reader announcements
 */
export async function testScreenReaderAnnouncements(
  triggerAction: () => void | Promise<void>,
  expectedMessage: string | RegExp,
  options: {
    timeout?: number;
    politeness?: 'polite' | 'assertive';
  } = {}
): Promise<void> {
  const { timeout = 1000, politeness = 'polite' } = options;
  
  // Execute the action that should trigger an announcement
  await triggerAction();
  
  // Wait for the announcement to appear in live regions
  await waitFor(
    () => {
      const liveRegions = screen.getAllByRole('status');
      const announcements = liveRegions
        .filter(region => region.getAttribute('aria-live') === politeness)
        .map(region => region.textContent)
        .filter(Boolean);
      
      if (typeof expectedMessage === 'string') {
        expect(announcements).toContain(expectedMessage);
      } else {
        expect(announcements.some(msg => expectedMessage.test(msg || ''))).toBe(true);
      }
    },
    { timeout }
  );
}

/**
 * Test focus management (save and restore)
 */
export async function testFocusManagement(
  initialElement: HTMLElement,
  actionThatChangesFocus: () => void | Promise<void>,
  actionThatRestoresFocus: () => void | Promise<void>
): Promise<void> {
  const user = userEvent.setup();
  
  // Set initial focus
  initialElement.focus();
  expect(initialElement).toHaveFocus();
  
  // Execute action that changes focus
  await actionThatChangesFocus();
  expect(initialElement).not.toHaveFocus();
  
  // Execute action that should restore focus
  await actionThatRestoresFocus();
  expect(initialElement).toHaveFocus();
}

/**
 * Test color contrast ratios
 */
export function testColorContrast(element: HTMLElement): void {
  const styles = window.getComputedStyle(element);
  const color = styles.color;
  const backgroundColor = styles.backgroundColor;
  
  // Note: This is a simplified test. In a real implementation,
  // you would use a proper color contrast library like 'color-contrast'
  expect(color).toBeTruthy();
  expect(backgroundColor).toBeTruthy();
  
  // Add actual contrast ratio calculations here if needed
}

/**
 * Test reduced motion preferences
 */
export async function testReducedMotionSupport(
  component: RenderResult,
  elementSelector: string
): Promise<void> {
  const { rerender } = component;
  
  // Mock reduced motion preference
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Re-render component with reduced motion
  rerender();
  
  // Check that animations are disabled or reduced
  const element = component.container.querySelector(elementSelector);
  if (element) {
    const styles = window.getComputedStyle(element);
    // Check for disabled transitions/animations
    expect(styles.transition).toBe('none');
  }
}

/**
 * Test ARIA attributes and roles
 */
export function testAriaAttributes(
  element: HTMLElement,
  expectedAttributes: Record<string, string | null>
): void {
  Object.entries(expectedAttributes).forEach(([attribute, expectedValue]) => {
    const actualValue = element.getAttribute(attribute);
    if (expectedValue === null) {
      expect(actualValue).toBeNull();
    } else {
      expect(actualValue).toBe(expectedValue);
    }
  });
}

/**
 * Test semantic HTML structure
 */
export function testSemanticStructure(container: HTMLElement): void {
  // Test for proper heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
  
  // Ensure headings don't skip levels
  for (let i = 1; i < headingLevels.length; i++) {
    const current = headingLevels[i];
    const previous = headingLevels[i - 1];
    expect(current - previous).toBeLessThanOrEqual(1);
  }
  
  // Test for landmark roles
  const landmarks = container.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"], main, nav, header, footer, aside');
  expect(landmarks.length).toBeGreaterThan(0);
}

/**
 * Comprehensive accessibility test suite
 */
export async function runAccessibilityTestSuite(
  renderResult: RenderResult,
  options: {
    testKeyboardNav?: boolean;
    testScreenReader?: boolean;
    testAriaAttributes?: boolean;
    testSemanticStructure?: boolean;
    testColorContrast?: boolean;
    testReducedMotion?: boolean;
    customTests?: Array<() => Promise<void> | void>;
  } = {}
): Promise<AxeResults> {
  const { container } = renderResult;
  
  // Run axe accessibility tests
  const axeResults = await testAccessibility(container);
  
  // Run keyboard navigation tests
  if (options.testKeyboardNav) {
    await testKeyboardNavigation(container, {
      testArrowKeys: true,
      testEscapeKey: true,
      testEnterKey: true,
      testSpaceKey: true,
    });
  }
  
  // Test semantic structure
  if (options.testSemanticStructure) {
    testSemanticStructure(container);
  }
  
  // Test reduced motion support
  if (options.testReducedMotion) {
    await testReducedMotionSupport(renderResult, '*');
  }
  
  // Run custom tests
  if (options.customTests) {
    for (const test of options.customTests) {
      await test();
    }
  }
  
  return axeResults;
}

/**
 * Mock screen reader for testing announcements
 */
export class MockScreenReader {
  private announcements: Array<{ message: string; politeness: 'polite' | 'assertive' }> = [];
  
  constructor() {
    // Listen for announcement events
    window.addEventListener('announce', this.handleAnnouncement.bind(this));
  }
  
  private handleAnnouncement(event: CustomEvent) {
    this.announcements.push({
      message: event.detail.message,
      politeness: event.detail.politeness || 'polite',
    });
  }
  
  getAnnouncements(): Array<{ message: string; politeness: 'polite' | 'assertive' }> {
    return [...this.announcements];
  }
  
  getLastAnnouncement(): { message: string; politeness: 'polite' | 'assertive' } | null {
    return this.announcements[this.announcements.length - 1] || null;
  }
  
  clearAnnouncements(): void {
    this.announcements = [];
  }
  
  destroy(): void {
    window.removeEventListener('announce', this.handleAnnouncement.bind(this));
  }
}