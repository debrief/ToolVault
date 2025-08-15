import { test, expect } from '@playwright/test';
import { HomePage } from './pages';
import { createMockDataHelper } from './helpers';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test('should display welcome message and navigation buttons', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    
    // Check page title
    await homePage.expectPageTitle();
    
    // Check welcome message
    await homePage.expectWelcomeMessage();
    
    // Check phase information
    await homePage.expectPhaseInfo();
    
    // Check navigation buttons
    await homePage.expectNavigationButtons();
  });

  test('should navigate to tool list via Browse Tools button', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    
    await homePage.navigateToTools();
    
    // Should be on tools page
    await expect(page).toHaveURL('/tools');
  });

  test('should navigate to tool list via Tool Catalog button', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    
    await homePage.navigateToToolsViaCatalog();
    
    // Should be on tools page
    await expect(page).toHaveURL('/tools');
  });

  test('should have proper page structure and accessibility', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    
    // Check main heading exists and is accessible
    const heading = homePage.welcomeHeading;
    await expect(heading).toBeVisible();
    await expect(heading).toHaveAttribute('data-testid', 'welcome-heading');
    
    // Check buttons are focusable
    await homePage.browseToolsBtn.focus();
    await expect(homePage.browseToolsBtn).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(homePage.toolCatalogBtn).toBeFocused();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.waitForLoad();
    
    // Tab to browse tools button and press enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Skip past other focusable elements
    await page.keyboard.press('Enter');
    
    // Should navigate to tools page
    await expect(page).toHaveURL('/tools');
  });

  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForLoad();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});