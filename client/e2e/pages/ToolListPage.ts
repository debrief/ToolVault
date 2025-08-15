import { Page, expect } from '@playwright/test';

export class ToolListPage {
  constructor(private page: Page) {}

  // Locators
  get searchInput() {
    return this.page.getByTestId('search-input').locator('input');
  }

  get categoryFilter() {
    return this.page.getByTestId('category-filter');
  }

  get tagsFilter() {
    return this.page.getByTestId('tags-filter');
  }

  get resultsSummary() {
    return this.page.getByTestId('results-summary');
  }

  get toolsGrid() {
    return this.page.getByTestId('tools-grid');
  }

  get noResults() {
    return this.page.getByTestId('no-results');
  }

  // Tool cards
  getToolCard(toolId: string) {
    return this.page.getByTestId(`tool-card-${toolId}`);
  }

  get allToolCards() {
    return this.page.locator('[data-testid^="tool-card-"]');
  }

  // Actions
  async goto() {
    await this.page.goto('/tools');
  }

  async searchTools(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async selectCategory(category: string) {
    await this.categoryFilter.click();
    await this.page.locator(`[role="option"]:has-text("${category}")`).click();
  }

  async clearCategory() {
    await this.categoryFilter.click();
    await this.page.locator('[role="option"]:has-text("All Categories")').click();
  }

  async selectTag(tag: string) {
    await this.tagsFilter.click();
    await this.page.locator(`[role="option"]:has-text("${tag}")`).click();
    // Click outside to close the dropdown
    await this.page.click('body');
  }

  async clickToolCard(toolId: string) {
    await this.getToolCard(toolId).click();
  }

  async waitForToolsToLoad() {
    // Wait for either tools grid or no results message
    try {
      await this.toolsGrid.waitFor({ timeout: 5000 });
    } catch {
      await this.noResults.waitFor({ timeout: 5000 });
    }
  }

  // Assertions
  async expectToolsVisible(count: number) {
    if (count === 0) {
      await expect(this.noResults).toBeVisible();
    } else {
      await expect(this.allToolCards).toHaveCount(count);
    }
  }

  async expectToolsCount(expectedCount: number) {
    await expect(this.allToolCards).toHaveCount(expectedCount);
  }

  async expectResultsSummary(expectedText: string) {
    await expect(this.resultsSummary).toContainText(expectedText);
  }

  async expectToolCardVisible(toolId: string) {
    await expect(this.getToolCard(toolId)).toBeVisible();
  }

  async expectNoResultsMessage() {
    await expect(this.noResults).toBeVisible();
    await expect(this.noResults).toContainText('No tools match your search criteria');
  }

  async expectPageTitle() {
    await expect(this.page).toHaveTitle(/Tool Catalog - ToolVault/);
  }
}