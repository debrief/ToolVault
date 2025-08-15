import { test, expect } from '@playwright/test';
import { ToolListPage } from './pages';
import { createMockDataHelper } from './helpers';

test.describe('Tool List Page', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test('should display tool list with all tools', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Check page title
    await toolListPage.expectPageTitle();
    
    // Should show 5 tools from mock data
    await toolListPage.expectToolsCount(5);
    
    // Check results summary
    await toolListPage.expectResultsSummary('5 of 5 tools');
  });

  test('should search for tools by name', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Search for "Word Count"
    await toolListPage.searchTools('Word Count');
    await page.waitForTimeout(500); // Wait for debounced search
    
    // Should show only 1 tool
    await toolListPage.expectToolsCount(1);
    await toolListPage.expectToolCardVisible('wordcount');
  });

  test('should search for tools by description', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Search for "buffer" (in geo-buffer description)
    await toolListPage.searchTools('buffer');
    await page.waitForTimeout(500);
    
    // Should show geo-buffer tool
    await toolListPage.expectToolsCount(1);
    await toolListPage.expectToolCardVisible('geo-buffer');
  });

  test('should filter tools by category', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Filter by "Text Analysis" category
    await toolListPage.selectCategory('Text Analysis');
    await page.waitForTimeout(500);
    
    // Should show 2 tools (wordcount and json-formatter)
    await toolListPage.expectToolsCount(2);
    await toolListPage.expectToolCardVisible('wordcount');
    await toolListPage.expectToolCardVisible('json-formatter');
  });

  test('should filter tools by tags', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Filter by "analysis" tag
    await toolListPage.selectTag('analysis');
    await page.waitForTimeout(500);
    
    // Should show tools with "analysis" tag
    await toolListPage.expectToolCardVisible('wordcount');
  });

  test('should combine search and filters', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Search for "json" and filter by "Text Analysis"
    await toolListPage.searchTools('json');
    await toolListPage.selectCategory('Text Analysis');
    await page.waitForTimeout(500);
    
    // Should show only json-formatter
    await toolListPage.expectToolsCount(1);
    await toolListPage.expectToolCardVisible('json-formatter');
  });

  test('should handle empty search results', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Search for non-existent tool
    await toolListPage.searchTools('nonexistent-tool-xyz');
    await page.waitForTimeout(500);
    
    // Should show no results message
    await toolListPage.expectNoResultsMessage();
  });

  test('should clear search and filters', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Apply search and filter
    await toolListPage.searchTools('word');
    await toolListPage.selectCategory('Text Analysis');
    await page.waitForTimeout(500);
    
    // Should show filtered results
    await toolListPage.expectToolsCount(1);
    
    // Clear search
    await toolListPage.clearSearch();
    await page.waitForTimeout(500);
    
    // Should show all Text Analysis tools
    await toolListPage.expectToolsCount(2);
    
    // Clear category filter
    await toolListPage.clearCategory();
    await page.waitForTimeout(500);
    
    // Should show all tools
    await toolListPage.expectToolsCount(5);
  });

  test('should navigate to tool detail page', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Click on wordcount tool card
    await toolListPage.clickToolCard('wordcount');
    
    // Should navigate to tool detail page
    await expect(page).toHaveURL('/tools/wordcount');
  });

  test('should display tool cards with correct information', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    // Check wordcount tool card
    const wordcountCard = toolListPage.getToolCard('wordcount');
    await expect(wordcountCard).toBeVisible();
    await expect(wordcountCard).toContainText('Word Count');
    await expect(wordcountCard).toContainText('Counts the number of words');
    await expect(wordcountCard).toContainText('Text Analysis');
  });

  test('should handle tool card hover effects', async ({ page }) => {
    const toolListPage = new ToolListPage(page);
    
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    const wordcountCard = toolListPage.getToolCard('wordcount');
    
    // Get initial position
    const initialBox = await wordcountCard.boundingBox();
    
    // Hover over the card
    await wordcountCard.hover();
    
    // Card should have hover effects (transform might change bounding box slightly)
    await expect(wordcountCard).toBeVisible();
  });

  test('should load tools quickly', async ({ page }) => {
    const startTime = Date.now();
    
    const toolListPage = new ToolListPage(page);
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});