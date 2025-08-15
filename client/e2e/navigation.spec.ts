import { test, expect } from '@playwright/test';
import { HomePage, ToolListPage, ToolDetailPage, NotFoundPage } from './pages';
import { createMockDataHelper } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test('should navigate through the complete user journey', async ({ page }) => {
    const homePage = new HomePage(page);
    const toolListPage = new ToolListPage(page);
    const toolDetailPage = new ToolDetailPage(page);
    
    // Start at homepage
    await homePage.goto();
    await homePage.waitForLoad();
    await homePage.expectWelcomeMessage();
    
    // Navigate to tools
    await homePage.navigateToTools();
    await expect(page).toHaveURL('/tools');
    
    // Wait for tools to load
    await toolListPage.waitForToolsToLoad();
    await toolListPage.expectToolsCount(5);
    
    // Search for a tool
    await toolListPage.searchTools('Word Count');
    await page.waitForTimeout(500);
    await toolListPage.expectToolsCount(1);
    
    // Navigate to tool detail
    await toolListPage.clickToolCard('wordcount');
    await expect(page).toHaveURL('/tools/wordcount');
    
    // Check tool detail loads
    await toolDetailPage.waitForLoad();
    await toolDetailPage.expectToolHeader('Word Count');
    
    // Navigate back to tools
    await toolDetailPage.clickBackButton();
    await expect(page).toHaveURL('/tools');
    
    // Verify search is preserved
    await expect(toolListPage.searchInput).toHaveValue('Word Count');
  });

  test('should handle browser back and forward buttons', async ({ page }) => {
    const homePage = new HomePage(page);
    const toolListPage = new ToolListPage(page);
    const toolDetailPage = new ToolDetailPage(page);
    
    // Navigate through pages
    await homePage.goto();
    await homePage.navigateToTools();
    await toolListPage.waitForToolsToLoad();
    await toolListPage.clickToolCard('wordcount');
    await toolDetailPage.waitForLoad();
    
    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL('/tools');
    
    // Use browser back button again
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL('/tools');
    
    // Use browser forward button again
    await page.goForward();
    await expect(page).toHaveURL('/tools/wordcount');
  });

  test('should handle direct URL navigation', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    // Navigate directly to a tool
    await page.goto('/tools/geo-buffer');
    await toolDetailPage.waitForLoad();
    await toolDetailPage.expectToolHeader('Geospatial Buffer');
    
    // Navigate directly to tools list
    await page.goto('/tools');
    const toolListPage = new ToolListPage(page);
    await toolListPage.waitForToolsToLoad();
    await toolListPage.expectToolsCount(5);
    
    // Navigate directly to homepage
    await page.goto('/');
    const homePage = new HomePage(page);
    await homePage.waitForLoad();
    await homePage.expectWelcomeMessage();
  });

  test('should handle invalid tool ID gracefully', async ({ page }) => {
    // Navigate to invalid tool ID
    await page.goto('/tools/invalid-tool-id');
    
    // Should redirect to 404 page
    await expect(page).toHaveURL('/404');
    
    const notFoundPage = new NotFoundPage(page);
    await notFoundPage.waitForLoad();
    await notFoundPage.expect404Page();
  });

  test('should handle 404 page navigation', async ({ page }) => {
    const notFoundPage = new NotFoundPage(page);
    
    // Go to 404 page
    await notFoundPage.gotoInvalidPath('/invalid-path');
    await notFoundPage.expect404Page();
    await notFoundPage.expectNavigationButtons();
    
    // Navigate home from 404
    await notFoundPage.clickHome();
    await expect(page).toHaveURL('/');
    
    // Go back to 404
    await page.goBack();
    await expect(page).toHaveURL('/404');
    
    // Navigate to tools from 404
    await notFoundPage.clickBrowseTools();
    await expect(page).toHaveURL('/tools');
  });

  test('should preserve scroll position when navigating back', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Scroll down on tools page
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);
    
    // Navigate to tool detail
    await toolListPage.clickToolCard('wordcount');
    await toolDetailPage.waitForLoad();
    
    // Navigate back
    await toolDetailPage.clickBackButton();
    
    // Check if scroll position is preserved (approximately)
    const newScrollPosition = await page.evaluate(() => window.scrollY);
    expect(Math.abs(newScrollPosition - scrollPosition)).toBeLessThan(100);
  });

  test('should handle multiple rapid navigation clicks', async ({ page }) => {
    const homePage = new HomePage(page);
    const toolListPage = new ToolListPage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    
    // Rapidly click browse tools multiple times
    await homePage.browseToolsBtn.click();
    await homePage.browseToolsBtn.click();
    await homePage.browseToolsBtn.click();
    
    // Should still end up on tools page
    await expect(page).toHaveURL('/tools');
    await toolListPage.waitForToolsToLoad();
  });

  test('should maintain tool list filters across navigation', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Apply filters
    await toolListPage.searchTools('analysis');
    await toolListPage.selectCategory('Text Analysis');
    await page.waitForTimeout(500);
    
    const filteredCount = await toolListPage.allToolCards.count();
    
    // Navigate to tool detail
    await toolListPage.clickToolCard('wordcount');
    await toolDetailPage.waitForLoad();
    
    // Navigate back
    await toolDetailPage.clickBackButton();
    
    // Filters should be preserved
    await expect(toolListPage.searchInput).toHaveValue('analysis');
    await expect(toolListPage.allToolCards).toHaveCount(filteredCount);
  });

  test('should handle page refresh on different routes', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    // Navigate to tool detail
    await toolDetailPage.goto('wordcount');
    await toolDetailPage.waitForLoad();
    
    // Refresh the page
    await page.reload();
    await toolDetailPage.waitForLoad();
    
    // Should still be on the same tool
    await toolDetailPage.expectToolHeader('Word Count');
    await toolDetailPage.expectUrl('wordcount');
  });
});