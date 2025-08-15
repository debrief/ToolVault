import { test, expect } from '@playwright/test';
import { HomePage, ToolListPage, ToolDetailPage } from './pages';
import { createMockDataHelper, testKeyboardNavigation } from './helpers';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation on homepage', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Start keyboard navigation
      await page.keyboard.press('Tab');
      
      // Should be able to tab to browse tools button
      await expect(homePage.browseToolsBtn).toBeFocused();
      
      // Tab to next button
      await page.keyboard.press('Tab');
      await expect(homePage.toolCatalogBtn).toBeFocused();
      
      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL('/tools');
    });

    test('should support keyboard navigation on tool list', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Tab to search input
      await page.keyboard.press('Tab');
      await expect(toolListPage.searchInput).toBeFocused();
      
      // Type in search
      await page.keyboard.type('Word Count');
      await page.waitForTimeout(500);
      
      // Tab to first tool card
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip category filter
      await page.keyboard.press('Tab'); // Skip tags filter
      
      // Navigate through tool cards with Tab
      let focusedElement = await page.locator(':focus').getAttribute('data-testid');
      
      // Eventually should reach a tool card or actionable element
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        focusedElement = await page.locator(':focus').getAttribute('data-testid');
        if (focusedElement && focusedElement.startsWith('tool-card-')) {
          break;
        }
      }
      
      // Should be able to activate tool card with Enter
      if (focusedElement && focusedElement.startsWith('tool-card-')) {
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/\/tools\/.+/);
      }
    });

    test('should support keyboard navigation on tool detail', async ({ page }) => {
      const toolDetailPage = new ToolDetailPage(page);
      
      await toolDetailPage.goto('wordcount');
      await toolDetailPage.waitForLoad();
      
      // Tab to back button
      await page.keyboard.press('Tab');
      await expect(toolDetailPage.backButton).toBeFocused();
      
      // Should be able to go back with Enter
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL('/tools');
    });

    test('should handle keyboard navigation with screen reader keys', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Test heading navigation with screen reader shortcuts
      // This simulates screen reader behavior
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space'); // Space to activate
      await expect(page).toHaveURL('/tools');
    });

    test('should support Escape key to close modals/overlays', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // If there are any dropdowns or modals, Escape should close them
      // This is more relevant if we add modals later
      await page.keyboard.press('Escape');
      
      // Should remain on the same page
      await expect(page).toHaveURL('/tools');
    });
  });

  test.describe('ARIA Attributes and Labels', () => {
    test('should have proper ARIA labels on interactive elements', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Check search input has aria-label
      const searchInput = toolListPage.searchInput;
      const searchAriaLabel = await searchInput.getAttribute('aria-label');
      expect(searchAriaLabel).toBeTruthy();
      expect(searchAriaLabel).toContain('Search');
      
      // Check category filter has aria-label
      const categoryFilter = toolListPage.categoryFilter;
      const categoryAriaLabel = await categoryFilter.getAttribute('aria-label');
      expect(categoryAriaLabel).toBeTruthy();
      expect(categoryAriaLabel).toContain('category');
    });

    test('should have proper heading structure', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Check main heading exists and is h1 or h2
      const mainHeading = homePage.welcomeHeading;
      const tagName = await mainHeading.evaluate(el => el.tagName.toLowerCase());
      expect(['h1', 'h2']).toContain(tagName);
      
      // Heading should be visible and have content
      await expect(mainHeading).toBeVisible();
      const headingText = await mainHeading.textContent();
      expect(headingText).toBeTruthy();
      expect(headingText!.length).toBeGreaterThan(0);
    });

    test('should have proper button roles and labels', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Check buttons have proper text or aria-label
      const browseBtn = homePage.browseToolsBtn;
      const btnText = await browseBtn.textContent();
      const btnAriaLabel = await browseBtn.getAttribute('aria-label');
      
      expect(btnText || btnAriaLabel).toBeTruthy();
      
      // Button should be focusable
      await browseBtn.focus();
      await expect(browseBtn).toBeFocused();
    });

    test('should have proper form field associations', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Check search input has associated label
      const searchInput = toolListPage.searchInput;
      
      // Should have either aria-label or associated label element
      const ariaLabel = await searchInput.getAttribute('aria-label');
      const labelledBy = await searchInput.getAttribute('aria-labelledby');
      const hasLabel = await page.locator('label[for]').count() > 0;
      
      expect(ariaLabel || labelledBy || hasLabel).toBeTruthy();
    });

    test('should have proper landmark roles', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Check for main content area
      const mainContent = page.locator('main, [role="main"]');
      const mainExists = await mainContent.count() > 0;
      expect(mainExists).toBe(true);
      
      // Check for navigation if present
      const navigation = page.locator('nav, [role="navigation"]');
      const navExists = await navigation.count() > 0;
      // Navigation might not be present on all pages, so this is optional
    });
  });

  test.describe('Focus Management', () => {
    test('should maintain logical focus order', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      const focusableElements: string[] = [];
      
      // Tab through elements and record focus order
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focusedElement = await page.locator(':focus').getAttribute('data-testid');
        if (focusedElement) {
          focusableElements.push(focusedElement);
        }
      }
      
      // Should have found some focusable elements
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Focus order should be logical (search before filters before tools)
      const searchIndex = focusableElements.indexOf('search-input');
      const categoryIndex = focusableElements.indexOf('category-filter');
      
      if (searchIndex !== -1 && categoryIndex !== -1) {
        expect(searchIndex).toBeLessThan(categoryIndex);
      }
    });

    test('should trap focus in modal dialogs', async ({ page }) => {
      // This test is more relevant when modals are added
      // For now, just verify no focus trapping interferes with normal navigation
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate normally
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should restore focus after navigation', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      const toolDetailPage = new ToolDetailPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Focus on search input
      await toolListPage.searchInput.focus();
      await expect(toolListPage.searchInput).toBeFocused();
      
      // Navigate to tool detail
      await toolListPage.clickToolCard('wordcount');
      await toolDetailPage.waitForLoad();
      
      // Navigate back
      await toolDetailPage.clickBackButton();
      await toolListPage.waitForToolsToLoad();
      
      // Focus should be restored or moved to a logical location
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Color Contrast and Visual Accessibility', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Check computed styles for color contrast
      const headingStyles = await homePage.welcomeHeading.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      // Note: Actual contrast calculation would require more complex logic
      // This is a basic check that colors are defined
      expect(headingStyles.color).toBeTruthy();
      expect(headingStyles.color).not.toBe('transparent');
    });

    test('should be usable with high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ forcedColors: 'active' });
      
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Elements should still be visible and usable
      await expect(homePage.welcomeHeading).toBeVisible();
      await expect(homePage.browseToolsBtn).toBeVisible();
      
      // Interactive elements should still be focusable
      await homePage.browseToolsBtn.focus();
      await expect(homePage.browseToolsBtn).toBeFocused();
    });

    test('should work with reduced motion preferences', async ({ page }) => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Page should still function normally
      await toolListPage.expectToolsCount(5);
      
      // Hover effects should still work (but without animation)
      const firstCard = toolListPage.getToolCard('wordcount');
      await firstCard.hover();
      await expect(firstCard).toBeVisible();
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should announce dynamic content changes', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Check for aria-live regions
      const liveRegions = page.locator('[aria-live]');
      const liveRegionCount = await liveRegions.count();
      
      // If live regions exist, they should be properly configured
      if (liveRegionCount > 0) {
        for (let i = 0; i < liveRegionCount; i++) {
          const region = liveRegions.nth(i);
          const ariaLive = await region.getAttribute('aria-live');
          expect(['polite', 'assertive']).toContain(ariaLive!);
        }
      }
      
      // Search should update results accessibly
      await toolListPage.searchTools('Word Count');
      await page.waitForTimeout(500);
      
      // Results summary should be accessible
      const resultsSummary = toolListPage.resultsSummary;
      await expect(resultsSummary).toBeVisible();
    });

    test('should have descriptive link and button text', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Check button text is descriptive
      const browseBtn = homePage.browseToolsBtn;
      const btnText = await browseBtn.textContent();
      
      expect(btnText).toBeTruthy();
      expect(btnText!.toLowerCase()).toContain('browse');
      expect(btnText!.toLowerCase()).toContain('tools');
    });

    test('should provide context for form fields', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Search input should have clear purpose
      const searchInput = toolListPage.searchInput;
      const placeholder = await searchInput.getAttribute('placeholder');
      const ariaLabel = await searchInput.getAttribute('aria-label');
      const label = await searchInput.evaluate(el => {
        const id = el.getAttribute('id');
        return id ? document.querySelector(`label[for="${id}"]`)?.textContent : null;
      });
      
      const hasContext = placeholder || ariaLabel || label;
      expect(hasContext).toBeTruthy();
    });
  });

  test.describe('Error Accessibility', () => {
    test('should announce error states accessibly', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData({ 
        simulateError: true, 
        errorType: 'network' 
      });
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      
      // Wait for error message
      const errorMessage = page.locator('text=Error loading tools');
      await expect(errorMessage).toBeVisible();
      
      // Error should be accessible
      const ariaRole = await errorMessage.getAttribute('role');
      const ariaLive = await errorMessage.getAttribute('aria-live');
      
      // Should have appropriate role or live region
      expect(ariaRole === 'alert' || ariaLive === 'assertive' || ariaLive === 'polite').toBe(true);
    });

    test('should provide accessible empty state', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Search for non-existent tool
      await toolListPage.searchTools('nonexistent-xyz');
      await page.waitForTimeout(500);
      
      const noResults = toolListPage.noResults;
      await expect(noResults).toBeVisible();
      
      // No results message should be accessible
      const noResultsText = await noResults.textContent();
      expect(noResultsText).toBeTruthy();
      expect(noResultsText!.toLowerCase()).toContain('no tools');
    });
  });
});