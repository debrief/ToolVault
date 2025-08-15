import { test, expect } from '@playwright/test';
import { ToolListPage, ToolDetailPage, NotFoundPage } from './pages';
import { createMockDataHelper } from './helpers';

test.describe('Error Handling', () => {
  test.describe('Network Errors', () => {
    test('should handle network disconnection gracefully', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      const toolListPage = new ToolListPage(page);
      
      // Setup network error
      await mockHelper.setupMockData({ 
        simulateError: true, 
        errorType: 'network' 
      });
      
      await toolListPage.goto();
      
      // Should show error state
      await expect(page.locator('text=Error loading tools')).toBeVisible();
      
      // Clear the mock and retry
      await mockHelper.clearMocks();
      await mockHelper.setupMockData();
      
      // Reload page
      await page.reload();
      await toolListPage.waitForToolsToLoad();
      
      // Should load successfully now
      await toolListPage.expectToolsCount(5);
    });

    test('should handle server errors (500)', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      const toolListPage = new ToolListPage(page);
      
      // Setup server error
      await mockHelper.setupMockData({ 
        simulateError: true, 
        errorType: 'server' 
      });
      
      await toolListPage.goto();
      
      // Should show error message
      await expect(page.locator('text=Error loading tools')).toBeVisible();
    });

    test('should handle slow network with timeout', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      const toolListPage = new ToolListPage(page);
      
      // Setup slow network
      await mockHelper.setupMockData({ 
        includeNetworkDelay: true,
        networkDelayMs: 2000
      });
      
      const startTime = Date.now();
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      const loadTime = Date.now() - startTime;
      
      // Should eventually load but take longer
      expect(loadTime).toBeGreaterThan(2000);
      await toolListPage.expectToolsCount(5);
    });
  });

  test.describe('Invalid Tool IDs', () => {
    test('should redirect to 404 for invalid tool ID', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData();
      
      // Navigate to invalid tool ID
      await page.goto('/tools/invalid-tool-xyz');
      
      // Should redirect to 404
      await expect(page).toHaveURL('/404');
      
      const notFoundPage = new NotFoundPage(page);
      await notFoundPage.expect404Page();
    });

    test('should handle tool not found from API', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData();
      await mockHelper.setupMockToolNotFound('nonexistent-tool');
      
      const toolDetailPage = new ToolDetailPage(page);
      await toolDetailPage.goto('nonexistent-tool');
      
      // Should show tool not found error
      await toolDetailPage.expectToolNotFound();
    });

    test('should handle special characters in tool ID', async ({ page }) => {
      const invalidIds = [
        'tool@#$%',
        'tool with spaces',
        'tool/with/slashes',
        'tool?with=query',
        'tool#with-hash'
      ];
      
      for (const toolId of invalidIds) {
        await page.goto(`/tools/${encodeURIComponent(toolId)}`);
        await expect(page).toHaveURL('/404');
      }
    });
  });

  test.describe('Empty Search Results', () => {
    test('should show no results message for empty search', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData();
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Search for non-existent tool
      await toolListPage.searchTools('nonexistent-tool-xyz');
      await page.waitForTimeout(500);
      
      // Should show no results message
      await toolListPage.expectNoResultsMessage();
      await toolListPage.expectToolsCount(0);
    });

    test('should show no results for impossible filter combination', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData();
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Apply filters that would result in no matches
      await toolListPage.searchTools('geospatial');
      await toolListPage.selectCategory('Security');
      await page.waitForTimeout(500);
      
      // Should show no results
      await toolListPage.expectNoResultsMessage();
    });

    test('should handle empty dataset from API', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockEmptyData();
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Should show no results message for empty dataset
      await toolListPage.expectNoResultsMessage();
    });

    test('should clear search when no results found', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData();
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Search for non-existent tool
      await toolListPage.searchTools('nonexistent');
      await page.waitForTimeout(500);
      await toolListPage.expectNoResultsMessage();
      
      // Clear search
      await toolListPage.clearSearch();
      await page.waitForTimeout(500);
      
      // Should show all tools again
      await toolListPage.expectToolsCount(5);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle extremely long search queries', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData();
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Very long search query
      const longQuery = 'a'.repeat(1000);
      await toolListPage.searchTools(longQuery);
      await page.waitForTimeout(500);
      
      // Should handle gracefully
      await toolListPage.expectNoResultsMessage();
      
      // Input should accept the long value
      await expect(toolListPage.searchInput).toHaveValue(longQuery);
    });

    test('should handle special characters in search', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData();
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      const specialQueries = [
        '!@#$%^&*()',
        '<script>alert("xss")</script>',
        'SELECT * FROM tools',
        '\\n\\r\\t',
        '🚀🎯💻'
      ];
      
      for (const query of specialQueries) {
        await toolListPage.clearSearch();
        await toolListPage.searchTools(query);
        await page.waitForTimeout(300);
        
        // Should handle gracefully without errors
        // Most likely will show no results
        const hasResults = await toolListPage.allToolCards.count() > 0;
        const hasNoResults = await toolListPage.noResults.isVisible();
        expect(hasResults || hasNoResults).toBe(true);
      }
    });

    test('should handle malformed JSON response', async ({ page }) => {
      // Mock malformed JSON response
      await page.route('**/data/index.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'invalid json {['
        });
      });
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      
      // Should show error state
      await expect(page.locator('text=Error loading tools')).toBeVisible();
    });

    test('should handle partial data corruption', async ({ page }) => {
      // Mock response with missing required fields
      await page.route('**/data/index.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            name: "Corrupted Data",
            tools: [
              { id: "tool1" }, // Missing name, description, etc.
              { name: "Tool 2" }, // Missing id
              null, // Null entry
              { id: "tool3", name: "Tool 3", description: "Valid tool" }
            ]
          })
        });
      });
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      
      // Should handle gracefully, possibly showing error or filtering out invalid tools
      // The exact behavior depends on error handling implementation
      await page.waitForTimeout(2000);
      
      // At minimum, page should not crash
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle rapid filter changes', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData();
      
      const toolListPage = new ToolListPage(page);
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Rapidly change filters
      for (let i = 0; i < 10; i++) {
        await toolListPage.searchTools(`query${i}`);
        await page.waitForTimeout(50); // Very short delay
      }
      
      // Should handle gracefully
      await page.waitForTimeout(1000);
      await expect(toolListPage.searchInput).toHaveValue('query9');
    });
  });

  test.describe('Recovery Scenarios', () => {
    test('should recover from network error when connection restored', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      const toolListPage = new ToolListPage(page);
      
      // Start with network error
      await mockHelper.setupMockData({ 
        simulateError: true, 
        errorType: 'network' 
      });
      
      await toolListPage.goto();
      await expect(page.locator('text=Error loading tools')).toBeVisible();
      
      // Restore network
      await mockHelper.clearMocks();
      await mockHelper.setupMockData();
      
      // Reload page
      await page.reload();
      await toolListPage.waitForToolsToLoad();
      
      // Should work normally now
      await toolListPage.expectToolsCount(5);
    });

    test('should allow retry after error', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      const toolListPage = new ToolListPage(page);
      
      // Setup error initially
      await mockHelper.setupMockData({ 
        simulateError: true, 
        errorType: 'server' 
      });
      
      await toolListPage.goto();
      await expect(page.locator('text=Error loading tools')).toBeVisible();
      
      // Fix the error
      await mockHelper.clearMocks();
      await mockHelper.setupMockData();
      
      // Look for retry mechanism or manual refresh
      if (await page.locator('[data-testid="retry-button"]').isVisible()) {
        await page.click('[data-testid="retry-button"]');
      } else {
        // If no retry button, reload the page
        await page.reload();
      }
      
      await toolListPage.waitForToolsToLoad();
      await toolListPage.expectToolsCount(5);
    });
  });
});