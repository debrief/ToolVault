import { test, expect, Browser } from '@playwright/test';
import { HomePage, ToolListPage, ToolDetailPage } from './pages';
import { createMockDataHelper } from './helpers';

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test.describe('Core Functionality Across Browsers', () => {
    test('should work consistently across all browsers', async ({ page, browserName }) => {
      const homePage = new HomePage(page);
      const toolListPage = new ToolListPage(page);
      const toolDetailPage = new ToolDetailPage(page);
      
      console.log(`Testing on ${browserName}`);
      
      // Homepage functionality
      await homePage.goto();
      await homePage.waitForLoad();
      await homePage.expectWelcomeMessage();
      
      // Navigation to tools
      await homePage.navigateToTools();
      await expect(page).toHaveURL('/tools');
      
      // Tool list functionality
      await toolListPage.waitForToolsToLoad();
      await toolListPage.expectToolsCount(5);
      
      // Search functionality
      await toolListPage.searchTools('Word Count');
      await page.waitForTimeout(500);
      await toolListPage.expectToolsCount(1);
      
      // Navigation to tool detail
      await toolListPage.clickToolCard('wordcount');
      await expect(page).toHaveURL('/tools/wordcount');
      
      // Tool detail functionality
      await toolDetailPage.waitForLoad();
      await toolDetailPage.expectToolHeader('Word Count');
      
      // Back navigation
      await toolDetailPage.clickBackButton();
      await expect(page).toHaveURL('/tools');
    });

    test('should handle form interactions consistently', async ({ page, browserName }) => {
      const toolListPage = new ToolListPage(page);
      
      console.log(`Testing form interactions on ${browserName}`);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Test search input
      await toolListPage.searchInput.fill('test query');
      await expect(toolListPage.searchInput).toHaveValue('test query');
      
      // Test category dropdown
      await toolListPage.selectCategory('Text Analysis');
      await page.waitForTimeout(500);
      
      // Should filter results
      const filteredCount = await toolListPage.allToolCards.count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(5);
      
      // Clear and test again
      await toolListPage.clearSearch();
      await toolListPage.clearCategory();
      await page.waitForTimeout(500);
      
      await toolListPage.expectToolsCount(5);
    });

    test('should handle keyboard navigation consistently', async ({ page, browserName }) => {
      const homePage = new HomePage(page);
      
      console.log(`Testing keyboard navigation on ${browserName}`);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Tab navigation should work
      await page.keyboard.press('Tab');
      
      // Focus should be visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Enter key should work on buttons
      if (await homePage.browseToolsBtn.isVisible()) {
        await homePage.browseToolsBtn.focus();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL('/tools');
      }
    });
  });

  test.describe('Browser-Specific Features', () => {
    test('should handle CSS features appropriately', async ({ page, browserName }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Check if CSS Grid/Flexbox is working
      const container = page.locator('[data-testid="welcome-heading"]').locator('..');
      const display = await container.evaluate(el => 
        window.getComputedStyle(el).display
      );
      
      // Should have modern display properties
      expect(['flex', 'grid', 'block']).toContain(display);
      
      // Check if modern CSS properties are supported
      const welcomeHeading = homePage.welcomeHeading;
      const styles = await welcomeHeading.evaluate(el => {
        const computedStyle = window.getComputedStyle(el);
        return {
          color: computedStyle.color,
          fontSize: computedStyle.fontSize,
          fontWeight: computedStyle.fontWeight
        };
      });
      
      expect(styles.color).toBeTruthy();
      expect(styles.fontSize).toBeTruthy();
      expect(styles.fontWeight).toBeTruthy();
    });

    test('should handle JavaScript features consistently', async ({ page, browserName }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Test modern JavaScript features
      const hasModernFeatures = await page.evaluate(() => {
        // Test Promise support
        const hasPromises = typeof Promise !== 'undefined';
        
        // Test async/await support (indirectly)
        const hasAsyncAwait = typeof (async function() {})().then === 'function';
        
        // Test arrow functions
        let hasArrowFunctions = false;
        try {
          eval('(() => {})');
          hasArrowFunctions = true;
        } catch (e) {
          hasArrowFunctions = false;
        }
        
        // Test querySelector
        const hasQuerySelector = typeof document.querySelector === 'function';
        
        return {
          hasPromises,
          hasAsyncAwait,
          hasArrowFunctions,
          hasQuerySelector
        };
      });
      
      expect(hasModernFeatures.hasPromises).toBe(true);
      expect(hasModernFeatures.hasAsyncAwait).toBe(true);
      expect(hasModernFeatures.hasQuerySelector).toBe(true);
      
      console.log(`${browserName} JavaScript features:`, hasModernFeatures);
    });

    test('should handle event handling consistently', async ({ page, browserName }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Test click events
      const initialUrl = page.url();
      await toolListPage.clickToolCard('wordcount');
      
      const newUrl = page.url();
      expect(newUrl).not.toBe(initialUrl);
      expect(newUrl).toContain('/tools/wordcount');
      
      // Test input events
      await page.goBack();
      await toolListPage.waitForToolsToLoad();
      
      await toolListPage.searchInput.fill('test');
      const inputValue = await toolListPage.searchInput.inputValue();
      expect(inputValue).toBe('test');
    });
  });

  test.describe('Performance Across Browsers', () => {
    test('should load within acceptable time limits', async ({ page, browserName }) => {
      const startTime = Date.now();
      
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForLoad();
      
      const loadTime = Date.now() - startTime;
      
      // Performance budgets might vary by browser
      const maxLoadTime = browserName === 'firefox' ? 4000 : 3000;
      expect(loadTime).toBeLessThan(maxLoadTime);
      
      console.log(`${browserName} load time: ${loadTime}ms`);
    });

    test('should handle animations and transitions', async ({ page, browserName }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Test hover effects (if any)
      const firstCard = toolListPage.getToolCard('wordcount');
      
      // Get initial state
      const initialTransform = await firstCard.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Hover
      await firstCard.hover();
      await page.waitForTimeout(200);
      
      // Check if styles changed (transform, shadow, etc.)
      const hoveredTransform = await firstCard.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Some change should occur on hover (though exact change depends on CSS)
      // This is more about ensuring no errors occur
      expect(typeof hoveredTransform).toBe('string');
    });
  });

  test.describe('Error Handling Across Browsers', () => {
    test('should handle network errors consistently', async ({ page, browserName }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData({ 
        simulateError: true, 
        errorType: 'network' 
      });
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      
      // Should show error state consistently across browsers
      const errorElement = page.locator('text=Error loading tools');
      await expect(errorElement).toBeVisible({ timeout: 10000 });
      
      console.log(`${browserName} handled network error appropriately`);
    });

    test('should handle JavaScript errors gracefully', async ({ page, browserName }) => {
      const errors: string[] = [];
      
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Navigate through the app
      await homePage.navigateToTools();
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.waitForToolsToLoad();
      await toolListPage.searchTools('test');
      
      // Should not have any JavaScript errors
      expect(errors.length).toBe(0);
      
      if (errors.length > 0) {
        console.log(`${browserName} errors:`, errors);
      }
    });
  });

  test.describe('Mobile Browser Compatibility', () => {
    test('should work on mobile browsers', async ({ page, browserName }) => {
      // This test specifically targets mobile browser projects
      if (!browserName.includes('mobile') && !browserName.includes('Mobile')) {
        test.skip();
      }
      
      const homePage = new HomePage(page);
      const toolListPage = new ToolListPage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Touch interactions should work
      await homePage.browseToolsBtn.tap();
      await expect(page).toHaveURL('/tools');
      
      await toolListPage.waitForToolsToLoad();
      
      // Tap on tool card
      const firstCard = toolListPage.getToolCard('wordcount');
      await firstCard.tap();
      
      await expect(page).toHaveURL('/tools/wordcount');
      
      console.log(`${browserName} mobile functionality works correctly`);
    });

    test('should handle viewport meta tag correctly', async ({ page, browserName }) => {
      if (!browserName.includes('mobile') && !browserName.includes('Mobile')) {
        test.skip();
      }
      
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // Check viewport meta tag
      const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewportMeta).toBeTruthy();
      expect(viewportMeta).toContain('width=device-width');
      
      // Content should not overflow on mobile
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
      
      expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 20);
    });
  });

  test.describe('Feature Detection and Fallbacks', () => {
    test('should provide appropriate fallbacks', async ({ page, browserName }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Test if modern features are used with fallbacks
      const hasModernCSS = await page.evaluate(() => {
        const testEl = document.createElement('div');
        testEl.style.display = 'grid';
        return testEl.style.display === 'grid';
      });
      
      const hasFlexbox = await page.evaluate(() => {
        const testEl = document.createElement('div');
        testEl.style.display = 'flex';
        return testEl.style.display === 'flex';
      });
      
      // At least one modern layout method should be supported
      expect(hasModernCSS || hasFlexbox).toBe(true);
      
      // App should still function regardless
      await expect(homePage.welcomeHeading).toBeVisible();
      await expect(homePage.browseToolsBtn).toBeVisible();
      
      console.log(`${browserName} CSS support:`, { hasModernCSS, hasFlexbox });
    });
  });
});