import { test, expect } from '@playwright/test';
import { ToolDetailPage, ToolListPage } from './pages';
import { createMockDataHelper } from './helpers';

test.describe('Tool Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test('should display tool details correctly', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('wordcount');
    await toolDetailPage.waitForLoad();
    
    // Check page title
    await toolDetailPage.expectPageTitle('Word Count');
    
    // Check URL
    await toolDetailPage.expectUrl('wordcount');
    
    // Check tool header
    await toolDetailPage.expectToolHeader('Word Count');
    
    // Check main sections are visible
    await toolDetailPage.expectToolDetailVisible();
  });

  test('should show back button and navigate back to tools', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    const toolListPage = new ToolListPage(page);
    
    // Start from tool list page
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    await toolListPage.clickToolCard('wordcount');
    
    // Should be on tool detail page
    await toolDetailPage.waitForLoad();
    await toolDetailPage.expectBackButtonVisible();
    
    // Click back button
    await toolDetailPage.clickBackButton();
    
    // Should be back on tools page
    await expect(page).toHaveURL('/tools');
  });

  test('should display input parameters section', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('wordcount');
    await toolDetailPage.waitForLoad();
    
    await toolDetailPage.expectInputsSection();
    
    // Should show input parameters
    const inputSection = toolDetailPage.inputSection;
    await expect(inputSection).toContainText('text');
    await expect(inputSection).toContainText('Text to analyse');
  });

  test('should display expected outputs section', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('wordcount');
    await toolDetailPage.waitForLoad();
    
    await toolDetailPage.expectOutputsSection();
    
    // Should show expected outputs
    const outputSection = toolDetailPage.outputSection;
    await expect(outputSection).toContainText('word_count');
    await expect(outputSection).toContainText('char_count');
  });

  test('should display execution panel', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('wordcount');
    await toolDetailPage.waitForLoad();
    
    await toolDetailPage.expectExecutionSection();
  });

  test('should navigate between different tools', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    // Test wordcount tool
    await toolDetailPage.goto('wordcount');
    await toolDetailPage.waitForLoad();
    await toolDetailPage.expectToolHeader('Word Count');
    
    // Navigate to geo-buffer tool
    await toolDetailPage.goto('geo-buffer');
    await toolDetailPage.waitForLoad();
    await toolDetailPage.expectToolHeader('Geospatial Buffer');
    
    // Check URL changed
    await toolDetailPage.expectUrl('geo-buffer');
  });

  test('should handle complex tool with multiple inputs and outputs', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('geo-buffer');
    await toolDetailPage.waitForLoad();
    
    await toolDetailPage.expectToolDetailVisible();
    
    // Check inputs section shows multiple inputs
    const inputSection = toolDetailPage.inputSection;
    await expect(inputSection).toContainText('geometry');
    await expect(inputSection).toContainText('distance');
    
    // Check outputs section
    const outputSection = toolDetailPage.outputSection;
    await expect(outputSection).toContainText('buffered_geometry');
  });

  test('should display tool metadata (category, tags)', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('wordcount');
    await toolDetailPage.waitForLoad();
    
    const toolHeader = toolDetailPage.toolHeader;
    
    // Should show category
    await expect(toolHeader).toContainText('Text Analysis');
    
    // Should show tags
    await expect(toolHeader).toContainText('text');
    await expect(toolHeader).toContainText('analysis');
    await expect(toolHeader).toContainText('count');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('wordcount');
    await toolDetailPage.waitForLoad();
    
    // Tab to back button and press enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs to reach back button
    await expect(toolDetailPage.backButton).toBeFocused();
    
    await page.keyboard.press('Enter');
    
    // Should navigate back
    await expect(page).toHaveURL('/tools');
  });

  test('should load tool details quickly', async ({ page }) => {
    const startTime = Date.now();
    
    const toolDetailPage = new ToolDetailPage(page);
    await toolDetailPage.goto('wordcount');
    await toolDetailPage.waitForLoad();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle direct URL navigation', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    // Navigate directly to tool detail URL
    await toolDetailPage.goto('json-formatter');
    await toolDetailPage.waitForLoad();
    
    await toolDetailPage.expectToolHeader('JSON Formatter');
    await toolDetailPage.expectUrl('json-formatter');
  });

  test('should maintain state when navigating back and forth', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    const toolListPage = new ToolListPage(page);
    
    // Start from tool list, apply a search
    await toolListPage.goto();
    await toolListPage.waitForToolsToLoad();
    await toolListPage.searchTools('word');
    await page.waitForTimeout(500);
    
    // Navigate to tool detail
    await toolListPage.clickToolCard('wordcount');
    await toolDetailPage.waitForLoad();
    
    // Go back
    await toolDetailPage.clickBackButton();
    
    // Search should still be applied
    await expect(toolListPage.searchInput).toHaveValue('word');
    await toolListPage.expectToolsCount(1);
  });
});