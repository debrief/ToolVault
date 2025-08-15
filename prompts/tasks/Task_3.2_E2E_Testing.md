# APM Task Assignment: Implement End-to-End Testing

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 3, Task 3.2** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Create end-to-end tests covering critical user workflows using Playwright.

**Prerequisites:** Task 3.1 completed - Unit tests should be implemented and passing.

## 2. Detailed Action Steps

1. **Set up E2E Test Infrastructure:**
   - Configure Playwright for multiple browser testing:
     ```typescript
     // playwright.config.ts
     export default defineConfig({
       testDir: './e2e',
       fullyParallel: true,
       forbidOnly: !!process.env.CI,
       retries: process.env.CI ? 2 : 0,
       workers: process.env.CI ? 1 : undefined,
       reporter: 'html',
       use: {
         baseURL: 'http://localhost:5173',
         trace: 'on-first-retry',
         screenshot: 'only-on-failure',
       },
       projects: [
         { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
         { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
         { name: 'webkit', use: { ...devices['Desktop Safari'] } },
         { name: 'mobile', use: { ...devices['iPhone 13'] } },
       ],
       webServer: {
         command: 'pnpm dev',
         url: 'http://localhost:5173',
         reuseExistingServer: !process.env.CI,
       },
     });
     ```
   - Create page object models for maintainable tests
   - Set up test data fixtures and helpers
   - Configure visual regression testing

2. **Create Page Object Models:**
   - Create `e2e/pages/HomePage.ts`:
     ```typescript
     export class HomePage {
       constructor(private page: Page) {}
       
       async goto() {
         await this.page.goto('/');
       }
       
       async navigateToTools() {
         await this.page.click('[data-testid="browse-tools-btn"]');
       }
       
       async expectWelcomeMessage() {
         await expect(this.page.locator('h2')).toContainText('Welcome to ToolVault');
       }
     }
     ```
   - Create `e2e/pages/ToolListPage.ts`:
     ```typescript
     export class ToolListPage {
       constructor(private page: Page) {}
       
       async searchTools(query: string) {
         await this.page.fill('[data-testid="search-input"]', query);
       }
       
       async selectCategory(category: string) {
         await this.page.selectOption('[data-testid="category-filter"]', category);
       }
       
       async clickToolCard(toolId: string) {
         await this.page.click(`[data-testid="tool-card-${toolId}"]`);
       }
       
       async expectToolsVisible(count: number) {
         await expect(this.page.locator('[data-testid^="tool-card-"]')).toHaveCount(count);
       }
     }
     ```
   - Create `e2e/pages/ToolDetailPage.ts` for tool detail interactions

3. **Test Core User Journeys:**
   - **Homepage to Tool List Journey:**
     ```typescript
     test('should navigate from homepage to tool list', async ({ page }) => {
       const homePage = new HomePage(page);
       const toolListPage = new ToolListPage(page);
       
       await homePage.goto();
       await homePage.expectWelcomeMessage();
       await homePage.navigateToTools();
       
       await expect(page).toHaveURL('/tools');
       await toolListPage.expectToolsVisible(0); // Wait for loading
     });
     ```
   - **Tool Search and Filter Workflow:**
     ```typescript
     test('should search and filter tools', async ({ page }) => {
       const toolListPage = new ToolListPage(page);
       
       await page.goto('/tools');
       await toolListPage.searchTools('analysis');
       await toolListPage.expectToolsVisible(2);
       
       await toolListPage.selectCategory('text');
       await toolListPage.expectToolsVisible(1);
     });
     ```
   - **Tool Detail View Navigation:**
     ```typescript
     test('should navigate to tool details and back', async ({ page }) => {
       const toolListPage = new ToolListPage(page);
       const toolDetailPage = new ToolDetailPage(page);
       
       await page.goto('/tools');
       await toolListPage.clickToolCard('wordcount');
       
       await expect(page).toHaveURL('/tools/wordcount');
       await toolDetailPage.expectToolHeader('Word Count Tool');
       
       await toolDetailPage.clickBackButton();
       await expect(page).toHaveURL('/tools');
     });
     ```

4. **Test Error Scenarios:**
   - **Network Error Handling:**
     ```typescript
     test('should handle network errors gracefully', async ({ page }) => {
       await page.route('**/data/index.json', route => 
         route.abort('internetdisconnected')
       );
       
       await page.goto('/tools');
       await expect(page.locator('[data-testid="error-message"]'))
         .toBeVisible();
       await expect(page.locator('[data-testid="retry-button"]'))
         .toBeVisible();
     });
     ```
   - **Invalid Tool ID Navigation:**
     ```typescript
     test('should show 404 for invalid tool ID', async ({ page }) => {
       await page.goto('/tools/invalid-tool-id');
       await expect(page).toHaveURL('/404');
       await expect(page.locator('h1')).toContainText('404');
     });
     ```
   - **Empty Search Results:**
     ```typescript
     test('should handle empty search results', async ({ page }) => {
       const toolListPage = new ToolListPage(page);
       
       await page.goto('/tools');
       await toolListPage.searchTools('nonexistent-tool-xyz');
       
       await expect(page.locator('[data-testid="no-results"]'))
         .toContainText('No tools match your search');
     });
     ```

## 3. Visual Regression Testing

**Screenshot Comparisons:**
```typescript
test('should match homepage screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});

test('should match tool list layout', async ({ page }) => {
  await page.goto('/tools');
  await page.waitForSelector('[data-testid^="tool-card-"]');
  await expect(page).toHaveScreenshot('tool-list.png');
});

test('should match tool detail layout', async ({ page }) => {
  await page.goto('/tools/wordcount');
  await page.waitForSelector('[data-testid="tool-header"]');
  await expect(page).toHaveScreenshot('tool-detail.png');
});
```

**Responsive Layout Testing:**
```typescript
test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`should render correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/tools');
      await expect(page).toHaveScreenshot(`tool-list-${name}.png`);
    });
  });
});
```

## 4. Performance Testing

**Page Load Performance:**
```typescript
test('should load homepage within performance budget', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 second budget
});

test('should load tool list efficiently', async ({ page }) => {
  await page.goto('/tools');
  
  // Measure Time to Interactive
  const tti = await page.evaluate(() => {
    return new Promise(resolve => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries[entries.length - 1]?.startTime || 0);
      }).observe({ entryTypes: ['measure'] });
      
      performance.measure('tti-measure');
    });
  });
  
  expect(tti).toBeLessThan(2000); // 2 second TTI budget
});
```

## 5. Accessibility Testing

**Keyboard Navigation:**
```typescript
test('should support keyboard navigation', async ({ page }) => {
  await page.goto('/');
  
  // Tab through interactive elements
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'browse-tools-btn');
  
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/tools');
});

test('should have proper ARIA labels', async ({ page }) => {
  await page.goto('/tools');
  
  await expect(page.locator('[data-testid="search-input"]'))
    .toHaveAttribute('aria-label');
  await expect(page.locator('[data-testid="category-filter"]'))
    .toHaveAttribute('aria-label');
});
```

**Screen Reader Compatibility:**
```typescript
test('should announce page changes', async ({ page }) => {
  await page.goto('/');
  
  // Check for live region updates
  await page.click('[data-testid="browse-tools-btn"]');
  
  await expect(page.locator('[aria-live="polite"]'))
    .toContainText('Tool catalog loaded');
});
```

## 6. Cross-Browser Testing

**Browser-Specific Tests:**
```typescript
test.describe('Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ page }) => {
      await page.goto('/tools');
      await page.click('[data-testid^="tool-card-"]:first-child');
      
      // Verify core functionality works
      await expect(page.locator('[data-testid="tool-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="input-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="output-section"]')).toBeVisible();
    });
  });
});
```

## 7. Test Data Management

**Fixtures and Test Data:**
```typescript
// e2e/fixtures/tools.json
{
  "sampleTools": [
    {
      "id": "wordcount",
      "name": "Word Count Tool",
      "description": "Count words in text",
      "category": "text",
      "tags": ["analysis", "text"],
      "inputs": [
        {
          "name": "text",
          "label": "Input Text",
          "type": "string",
          "required": true
        }
      ],
      "outputs": [
        {
          "name": "count",
          "label": "Word Count",
          "type": "number"
        }
      ]
    }
  ]
}

// e2e/helpers/mockData.ts
export const setupMockData = async (page: Page) => {
  await page.route('**/data/index.json', async route => {
    const tools = await import('../fixtures/tools.json');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        name: "Test Tool Collection",
        version: "1.0.0",
        tools: tools.sampleTools
      })
    });
  });
};
```

## 8. CI/CD Integration

**GitHub Actions Workflow:**
```yaml
# .github/workflows/e2e.yml (update existing)
- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload Playwright report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30

- name: Upload test results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: e2e-test-results
    path: test-results/
    retention-days: 30
```

## 9. Expected Output & Deliverables

**Success Criteria:**
- All critical user journeys covered by E2E tests
- Visual regression tests prevent UI breaking changes
- Performance budgets enforced in CI/CD
- Cross-browser compatibility verified
- Accessibility requirements validated
- Test reports generated automatically

**Deliverables:**
1. **Test Files:**
   - `e2e/homepage.spec.ts` - Homepage functionality tests
   - `e2e/tool-list.spec.ts` - Tool catalog and filtering tests
   - `e2e/tool-detail.spec.ts` - Tool detail view tests
   - `e2e/navigation.spec.ts` - Routing and navigation tests
   - `e2e/error-handling.spec.ts` - Error scenario tests

2. **Page Object Models:**
   - `e2e/pages/HomePage.ts`
   - `e2e/pages/ToolListPage.ts`
   - `e2e/pages/ToolDetailPage.ts`
   - `e2e/pages/NotFoundPage.ts`

3. **Test Infrastructure:**
   - `e2e/fixtures/` - Test data fixtures
   - `e2e/helpers/` - Test helper utilities
   - Updated Playwright configuration
   - Visual regression baseline images

## 10. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_3_Testing_Polish/Task_3.2_E2E_Testing_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_QA_Specialist)
- Task reference (Phase 3 / Task 3.2)
- E2E testing strategy and coverage
- Performance testing results
- Cross-browser compatibility status
- Visual regression testing approach
- CI/CD integration details

Please acknowledge receipt and proceed with implementation.