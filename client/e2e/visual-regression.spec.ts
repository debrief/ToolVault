import { test, expect } from '@playwright/test';
import { HomePage, ToolListPage, ToolDetailPage, NotFoundPage } from './pages';
import { createMockDataHelper, VIEWPORT_SIZES } from './helpers';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test.describe('Desktop Screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.desktop);
    });

    test('should match homepage screenshot', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Hide any dynamic content that might cause flakiness
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('homepage-desktop.png');
    });

    test('should match tool list screenshot', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('tool-list-desktop.png');
    });

    test('should match tool detail screenshot', async ({ page }) => {
      const toolDetailPage = new ToolDetailPage(page);
      
      await toolDetailPage.goto('wordcount');
      await toolDetailPage.waitForLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('tool-detail-desktop.png');
    });

    test('should match 404 page screenshot', async ({ page }) => {
      const notFoundPage = new NotFoundPage(page);
      
      await notFoundPage.goto();
      await notFoundPage.waitForLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('404-page-desktop.png');
    });

    test('should match tool list with search results', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Apply search
      await toolListPage.searchTools('Word Count');
      await page.waitForTimeout(500);
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('tool-list-search-desktop.png');
    });

    test('should match tool list with no results', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Search for non-existent tool
      await toolListPage.searchTools('nonexistent-xyz');
      await page.waitForTimeout(500);
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('tool-list-no-results-desktop.png');
    });
  });

  test.describe('Mobile Screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
    });

    test('should match homepage on mobile', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('homepage-mobile.png');
    });

    test('should match tool list on mobile', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('tool-list-mobile.png');
    });

    test('should match tool detail on mobile', async ({ page }) => {
      const toolDetailPage = new ToolDetailPage(page);
      
      await toolDetailPage.goto('wordcount');
      await toolDetailPage.waitForLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('tool-detail-mobile.png');
    });
  });

  test.describe('Tablet Screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.tablet);
    });

    test('should match homepage on tablet', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('homepage-tablet.png');
    });

    test('should match tool list on tablet', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('tool-list-tablet.png');
    });
  });

  test.describe('Component-Level Screenshots', () => {
    test('should match individual tool card', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      const toolCard = toolListPage.getToolCard('wordcount');
      await expect(toolCard).toHaveScreenshot('tool-card-wordcount.png');
    });

    test('should match tool header section', async ({ page }) => {
      const toolDetailPage = new ToolDetailPage(page);
      
      await toolDetailPage.goto('geo-buffer');
      await toolDetailPage.waitForLoad();
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      const toolHeader = toolDetailPage.toolHeader;
      await expect(toolHeader).toHaveScreenshot('tool-header-geo-buffer.png');
    });

    test('should match search and filter section', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Apply some filters to show active state
      await toolListPage.searchTools('analysis');
      await toolListPage.selectCategory('Text Analysis');
      await page.waitForTimeout(500);
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      // Screenshot the filter section
      const filterSection = page.locator('[data-testid="search-input"]').locator('..').locator('..');
      await expect(filterSection).toHaveScreenshot('search-filter-section.png');
    });
  });

  test.describe('Error State Screenshots', () => {
    test('should match error state for network failure', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData({ 
        simulateError: true, 
        errorType: 'network' 
      });
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      
      // Wait for error state
      await page.waitForSelector('text=Error loading tools', { timeout: 10000 });
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('error-network-failure.png');
    });

    test('should match tool not found state', async ({ page }) => {
      const toolDetailPage = new ToolDetailPage(page);
      
      await toolDetailPage.goto('invalid-tool-id');
      
      // Should redirect to 404 or show not found
      await page.waitForTimeout(2000);
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('tool-not-found.png');
    });
  });

  test.describe('Dark Theme Screenshots', () => {
    test.beforeEach(async ({ page }) => {
      // Simulate dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });
    });

    test('should match homepage in dark theme', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Wait for theme to apply
      await page.waitForTimeout(500);
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('homepage-dark-theme.png');
    });

    test('should match tool list in dark theme', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Wait for theme to apply
      await page.waitForTimeout(500);
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('tool-list-dark-theme.png');
    });
  });

  test.describe('Loading State Screenshots', () => {
    test('should match loading skeleton', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData({ 
        includeNetworkDelay: true,
        networkDelayMs: 5000 
      });
      
      const toolListPage = new ToolListPage(page);
      
      // Start navigation but don't wait for completion
      await toolListPage.goto();
      
      // Wait for loading state to be visible
      await page.waitForSelector('text=Loading tools...', { timeout: 2000 });
      
      // Disable animations
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          *, *::before, *::after { transition-duration: 0s !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('loading-state.png');
    });
  });
});