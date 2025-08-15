import { Page, expect } from '@playwright/test';

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for page to be fully loaded including all assets
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('load');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
}

/**
 * Simulate slow network conditions
 */
export async function simulateSlowNetwork(page: Page) {
  await page.route('**/*', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.continue();
  });
}

/**
 * Take screenshot with automatic naming
 */
export async function takeScreenshot(page: Page, name: string, fullPage = false) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  
  return await page.screenshot({
    path: `test-results/screenshots/${filename}`,
    fullPage
  });
}

/**
 * Check for console errors
 */
export async function checkForConsoleErrors(page: Page) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return errors;
}

/**
 * Measure page performance
 */
export async function measurePagePerformance(page: Page) {
  return await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      // Navigation timing
      navigationStart: navigation.navigationStart,
      domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
      loadEventEnd: navigation.loadEventEnd,
      
      // Calculated metrics
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      pageLoad: navigation.loadEventEnd - navigation.navigationStart,
      
      // Paint timing
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    };
  });
}

/**
 * Test accessibility with keyboard navigation
 */
export async function testKeyboardNavigation(page: Page, startSelector: string, expectedStops: string[]) {
  // Focus on the starting element
  await page.locator(startSelector).focus();
  
  const visitedElements: string[] = [];
  
  for (let i = 0; i < expectedStops.length; i++) {
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').getAttribute('data-testid');
    if (focusedElement) {
      visitedElements.push(focusedElement);
    }
  }
  
  return visitedElements;
}

/**
 * Simulate different viewport sizes
 */
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  ultrawide: { width: 2560, height: 1440 }
};

/**
 * Test responsive behavior
 */
export async function testResponsiveLayout(page: Page, selector: string) {
  const results: Record<string, any> = {};
  
  for (const [name, viewport] of Object.entries(VIEWPORT_SIZES)) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500); // Wait for responsive changes
    
    const element = page.locator(selector);
    const boundingBox = await element.boundingBox();
    const isVisible = await element.isVisible();
    
    results[name] = {
      viewport,
      boundingBox,
      isVisible
    };
  }
  
  return results;
}

/**
 * Assert element is accessible
 */
export async function assertAccessible(page: Page, selector: string) {
  const element = page.locator(selector);
  
  // Check if element is focusable
  await element.focus();
  const isFocused = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return document.activeElement === el;
  }, selector);
  
  expect(isFocused).toBe(true);
  
  // Check for ARIA attributes
  const hasAriaLabel = await element.getAttribute('aria-label');
  const hasAriaLabelledBy = await element.getAttribute('aria-labelledby');
  const hasAriaDescribedBy = await element.getAttribute('aria-describedby');
  
  // At least one accessibility attribute should be present
  expect(hasAriaLabel || hasAriaLabelledBy || hasAriaDescribedBy).toBeTruthy();
}

/**
 * Wait for specific number of elements
 */
export async function waitForElementCount(page: Page, selector: string, count: number, timeout = 5000) {
  await page.waitForFunction(
    ({ sel, cnt }) => document.querySelectorAll(sel).length === cnt,
    { sel: selector, cnt: count },
    { timeout }
  );
}

/**
 * Retry an action until it succeeds or timeout
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError!;
}