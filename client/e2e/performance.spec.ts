import { test, expect } from '@playwright/test';
import { HomePage, ToolListPage, ToolDetailPage } from './pages';
import { createMockDataHelper, measurePagePerformance } from './helpers';

// Performance budgets (in milliseconds)
const PERFORMANCE_BUDGETS = {
  pageLoad: 3000,          // Total page load time
  domContentLoaded: 2000,  // DOM content loaded
  firstPaint: 1500,        // First paint
  firstContentfulPaint: 2000, // First contentful paint
  timeToInteractive: 2500   // Time to interactive (estimated)
};

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test.describe('Page Load Performance', () => {
    test('homepage should load within performance budget', async ({ page }) => {
      const homePage = new HomePage(page);
      
      const startTime = Date.now();
      await homePage.goto();
      await homePage.waitForLoad();
      const totalLoadTime = Date.now() - startTime;
      
      // Check total load time
      expect(totalLoadTime).toBeLessThan(PERFORMANCE_BUDGETS.pageLoad);
      
      // Get detailed performance metrics
      const metrics = await measurePagePerformance(page);
      
      expect(metrics.domContentLoaded).toBeLessThan(PERFORMANCE_BUDGETS.domContentLoaded);
      expect(metrics.pageLoad).toBeLessThan(PERFORMANCE_BUDGETS.pageLoad);
      
      if (metrics.firstPaint > 0) {
        expect(metrics.firstPaint).toBeLessThan(PERFORMANCE_BUDGETS.firstPaint);
      }
      
      if (metrics.firstContentfulPaint > 0) {
        expect(metrics.firstContentfulPaint).toBeLessThan(PERFORMANCE_BUDGETS.firstContentfulPaint);
      }
      
      console.log('Homepage Performance Metrics:', metrics);
    });

    test('tool list should load within performance budget', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      const startTime = Date.now();
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      const totalLoadTime = Date.now() - startTime;
      
      expect(totalLoadTime).toBeLessThan(PERFORMANCE_BUDGETS.pageLoad);
      
      const metrics = await measurePagePerformance(page);
      expect(metrics.domContentLoaded).toBeLessThan(PERFORMANCE_BUDGETS.domContentLoaded);
      
      console.log('Tool List Performance Metrics:', metrics);
    });

    test('tool detail should load within performance budget', async ({ page }) => {
      const toolDetailPage = new ToolDetailPage(page);
      
      const startTime = Date.now();
      await toolDetailPage.goto('wordcount');
      await toolDetailPage.waitForLoad();
      const totalLoadTime = Date.now() - startTime;
      
      expect(totalLoadTime).toBeLessThan(PERFORMANCE_BUDGETS.pageLoad);
      
      const metrics = await measurePagePerformance(page);
      expect(metrics.domContentLoaded).toBeLessThan(PERFORMANCE_BUDGETS.domContentLoaded);
      
      console.log('Tool Detail Performance Metrics:', metrics);
    });
  });

  test.describe('Navigation Performance', () => {
    test('navigation between pages should be fast', async ({ page }) => {
      const homePage = new HomePage(page);
      const toolListPage = new ToolListPage(page);
      const toolDetailPage = new ToolDetailPage(page);
      
      // Load homepage first
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Navigate to tools
      const navStartTime = Date.now();
      await homePage.navigateToTools();
      await toolListPage.waitForToolsToLoad();
      const navToToolsTime = Date.now() - navStartTime;
      
      expect(navToToolsTime).toBeLessThan(2000); // 2 second budget for navigation
      
      // Navigate to tool detail
      const detailNavStartTime = Date.now();
      await toolListPage.clickToolCard('wordcount');
      await toolDetailPage.waitForLoad();
      const navToDetailTime = Date.now() - detailNavStartTime;
      
      expect(navToDetailTime).toBeLessThan(2000);
      
      // Navigate back
      const backNavStartTime = Date.now();
      await toolDetailPage.clickBackButton();
      await toolListPage.waitForToolsToLoad();
      const backNavTime = Date.now() - backNavStartTime;
      
      expect(backNavTime).toBeLessThan(1500); // Should be faster going back
      
      console.log('Navigation Times:', {
        navToTools: navToToolsTime,
        navToDetail: navToDetailTime,
        backNav: backNavTime
      });
    });

    test('search filtering should be responsive', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Measure search response time
      const searchStartTime = Date.now();
      await toolListPage.searchTools('Word Count');
      
      // Wait for search results to update
      await page.waitForFunction(() => {
        const cards = document.querySelectorAll('[data-testid^="tool-card-"]');
        return cards.length <= 2; // Should filter to 1-2 results
      }, { timeout: 5000 });
      
      const searchResponseTime = Date.now() - searchStartTime;
      
      expect(searchResponseTime).toBeLessThan(1000); // Search should be fast
      
      console.log('Search Response Time:', searchResponseTime);
    });
  });

  test.describe('Resource Loading', () => {
    test('should load minimal resources on initial page load', async ({ page }) => {
      const requests: string[] = [];
      const responses: number[] = [];
      
      page.on('request', (request) => {
        requests.push(request.url());
      });
      
      page.on('response', (response) => {
        responses.push(response.status());
      });
      
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Count failed requests
      const failedRequests = responses.filter(status => status >= 400).length;
      expect(failedRequests).toBe(0);
      
      // Should not make excessive requests
      expect(requests.length).toBeLessThan(50);
      
      console.log('Resource Loading:', {
        totalRequests: requests.length,
        failedRequests: failedRequests
      });
    });

    test('should handle concurrent requests efficiently', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      // Track network requests
      const pendingRequests = new Set();
      const maxConcurrentRequests = { count: 0 };
      
      page.on('request', (request) => {
        pendingRequests.add(request.url());
        maxConcurrentRequests.count = Math.max(maxConcurrentRequests.count, pendingRequests.size);
      });
      
      page.on('response', (response) => {
        pendingRequests.delete(response.url());
      });
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Should not have too many concurrent requests
      expect(maxConcurrentRequests.count).toBeLessThan(20);
      
      console.log('Max Concurrent Requests:', maxConcurrentRequests.count);
    });
  });

  test.describe('Memory Usage', () => {
    test('should not have memory leaks during navigation', async ({ page }) => {
      const homePage = new HomePage(page);
      const toolListPage = new ToolListPage(page);
      const toolDetailPage = new ToolDetailPage(page);
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
          };
        }
        return null;
      });
      
      // Navigate through pages multiple times
      for (let i = 0; i < 5; i++) {
        await homePage.goto();
        await homePage.navigateToTools();
        await toolListPage.waitForToolsToLoad();
        await toolListPage.clickToolCard('wordcount');
        await toolDetailPage.waitForLoad();
        await toolDetailPage.clickBackButton();
        await toolListPage.waitForToolsToLoad();
      }
      
      // Force garbage collection if possible
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
          };
        }
        return null;
      });
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const memoryIncreasePercent = (memoryIncrease / initialMemory.usedJSHeapSize) * 100;
        
        // Memory should not increase by more than 100%
        expect(memoryIncreasePercent).toBeLessThan(100);
        
        console.log('Memory Usage:', {
          initial: initialMemory.usedJSHeapSize,
          final: finalMemory.usedJSHeapSize,
          increasePercent: memoryIncreasePercent
        });
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network gracefully', async ({ page }) => {
      const mockHelper = createMockDataHelper(page);
      await mockHelper.setupMockData({
        includeNetworkDelay: true,
        networkDelayMs: 1000
      });
      
      const toolListPage = new ToolListPage(page);
      
      const startTime = Date.now();
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      const totalTime = Date.now() - startTime;
      
      // Should still load within reasonable time even with network delay
      expect(totalTime).toBeLessThan(5000);
      expect(totalTime).toBeGreaterThan(1000); // Should reflect the delay
      
      // Page should be functional
      await toolListPage.expectToolsCount(5);
    });

    test('should be efficient with repeated requests', async ({ page }) => {
      const requests = new Map<string, number>();
      
      page.on('request', (request) => {
        const url = request.url();
        requests.set(url, (requests.get(url) || 0) + 1);
      });
      
      const toolListPage = new ToolListPage(page);
      const toolDetailPage = new ToolDetailPage(page);
      
      // Navigate to same tool multiple times
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      for (let i = 0; i < 3; i++) {
        await toolListPage.clickToolCard('wordcount');
        await toolDetailPage.waitForLoad();
        await toolDetailPage.clickBackButton();
        await toolListPage.waitForToolsToLoad();
      }
      
      // Check for unnecessary duplicate requests
      const duplicateRequests = Array.from(requests.entries())
        .filter(([url, count]) => count > 3 && url.includes('/data/'))
        .length;
      
      expect(duplicateRequests).toBe(0);
      
      console.log('Request Counts:', Object.fromEntries(requests));
    });
  });

  test.describe('Rendering Performance', () => {
    test('should render large tool lists efficiently', async ({ page }) => {
      // Create mock data with many tools
      const mockHelper = createMockDataHelper(page);
      const manyTools = Array.from({ length: 100 }, (_, i) => ({
        id: `tool-${i}`,
        name: `Tool ${i}`,
        description: `Description for tool ${i}`,
        category: i % 3 === 0 ? 'Text Analysis' : i % 3 === 1 ? 'Geospatial' : 'Security',
        tags: [`tag${i}`, `category${i % 5}`],
        inputs: [{ name: 'input', label: 'Input', type: 'string', required: true }],
        outputs: [{ name: 'output', label: 'Output', type: 'string' }]
      }));
      
      await page.route('**/data/index.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            name: "Large Tool Collection",
            version: "1.0.0",
            tools: manyTools
          })
        });
      });
      
      const toolListPage = new ToolListPage(page);
      
      const startTime = Date.now();
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      const renderTime = Date.now() - startTime;
      
      // Should render large list within reasonable time
      expect(renderTime).toBeLessThan(5000);
      
      // Check that all tools are rendered
      const toolCount = await toolListPage.allToolCards.count();
      expect(toolCount).toBe(100);
      
      console.log('Large List Render Time:', renderTime);
    });

    test('should handle rapid UI updates efficiently', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Rapidly change search query
      const startTime = Date.now();
      
      const queries = ['a', 'an', 'ana', 'anal', 'analy', 'analys', 'analysi', 'analysis'];
      
      for (const query of queries) {
        await toolListPage.searchTools(query);
        await page.waitForTimeout(50); // Small delay between updates
      }
      
      // Wait for final result
      await page.waitForTimeout(500);
      
      const totalTime = Date.now() - startTime;
      
      // Should handle rapid updates efficiently
      expect(totalTime).toBeLessThan(3000);
      
      // Final result should be correct
      await expect(toolListPage.searchInput).toHaveValue('analysis');
      
      console.log('Rapid UI Updates Time:', totalTime);
    });
  });
});