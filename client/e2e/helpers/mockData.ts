import { Page, Route } from '@playwright/test';
import testTools from '../fixtures/tools.json' with { type: 'json' };

export interface MockDataOptions {
  includeNetworkDelay?: boolean;
  networkDelayMs?: number;
  simulateError?: boolean;
  errorType?: 'network' | 'server' | 'timeout';
  partialData?: boolean;
}

export class MockDataHelper {
  constructor(private page: Page) {}

  /**
   * Set up mock data for the tool vault API
   */
  async setupMockData(options: MockDataOptions = {}) {
    const {
      includeNetworkDelay = false,
      networkDelayMs = 500,
      simulateError = false,
      errorType = 'network',
      partialData = false
    } = options;

    await this.page.route('**/data/index.json', async (route: Route) => {
      // Simulate network delay if requested
      if (includeNetworkDelay) {
        await new Promise(resolve => setTimeout(resolve, networkDelayMs));
      }

      // Simulate different error scenarios
      if (simulateError) {
        switch (errorType) {
          case 'network':
            await route.abort('internetdisconnected');
            return;
          case 'server':
            await route.fulfill({
              status: 500,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'Internal Server Error' })
            });
            return;
          case 'timeout':
            // Don't fulfill the route to simulate timeout
            return;
        }
      }

      // Return partial data if requested
      const responseData = partialData 
        ? { ...testTools, tools: testTools.tools.slice(0, 2) }
        : testTools;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData)
      });
    });
  }

  /**
   * Set up mock data for a specific tool
   */
  async setupMockToolData(toolId: string, toolData: any) {
    await this.page.route(`**/tools/${toolId}`, async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(toolData)
      });
    });
  }

  /**
   * Set up mock for tool not found
   */
  async setupMockToolNotFound(toolId: string) {
    await this.page.route(`**/tools/${toolId}`, async (route: Route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Tool not found' })
      });
    });
  }

  /**
   * Set up mock with empty results
   */
  async setupMockEmptyData() {
    await this.page.route('**/data/index.json', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: "Empty Tool Collection",
          version: "1.0.0",
          description: "Empty collection for testing",
          updated: "2025-08-15T12:00:00Z",
          tools: []
        })
      });
    });
  }

  /**
   * Clear all route mocks
   */
  async clearMocks() {
    await this.page.unroute('**/data/index.json');
    await this.page.unroute('**/tools/**');
  }

  /**
   * Get test tool data
   */
  getTestTools() {
    return testTools.tools;
  }

  /**
   * Get specific test tool by ID
   */
  getTestTool(toolId: string) {
    return testTools.tools.find(tool => tool.id === toolId);
  }

  /**
   * Get tools by category
   */
  getTestToolsByCategory(category: string) {
    return testTools.tools.filter(tool => tool.category === category);
  }

  /**
   * Get tools by tag
   */
  getTestToolsByTag(tag: string) {
    return testTools.tools.filter(tool => tool.tags.includes(tag));
  }
}

/**
 * Utility function to create mock data helper
 */
export function createMockDataHelper(page: Page) {
  return new MockDataHelper(page);
}