import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  // Locators
  get welcomeHeading() {
    return this.page.getByTestId('welcome-heading');
  }

  get browseToolsBtn() {
    return this.page.getByTestId('browse-tools-btn');
  }

  get toolCatalogBtn() {
    return this.page.getByTestId('tool-catalog-btn');
  }

  get phaseInfo() {
    return this.page.getByTestId('phase-info');
  }

  // Actions
  async goto() {
    await this.page.goto('/');
  }

  async navigateToTools() {
    await this.browseToolsBtn.click();
  }

  async navigateToToolsViaCatalog() {
    await this.toolCatalogBtn.click();
  }

  // Assertions
  async expectWelcomeMessage() {
    await expect(this.welcomeHeading).toContainText('Welcome to ToolVault');
  }

  async expectPhaseInfo() {
    await expect(this.phaseInfo).toContainText('Phase 1');
  }

  async expectNavigationButtons() {
    await expect(this.browseToolsBtn).toBeVisible();
    await expect(this.toolCatalogBtn).toBeVisible();
  }

  async expectPageTitle() {
    await expect(this.page).toHaveTitle(/ToolVault/);
  }

  // Wait for page to be fully loaded
  async waitForLoad() {
    await this.welcomeHeading.waitFor();
    await this.browseToolsBtn.waitFor();
  }
}