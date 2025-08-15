import { Page, expect } from '@playwright/test';

export class ToolDetailPage {
  constructor(private page: Page) {}

  // Locators
  get toolDetail() {
    return this.page.getByTestId('tool-detail');
  }

  get toolHeader() {
    return this.page.getByTestId('tool-header');
  }

  get toolName() {
    return this.page.getByTestId('tool-name');
  }

  get backButton() {
    return this.page.getByTestId('back-button');
  }

  get inputSection() {
    return this.page.getByTestId('input-section');
  }

  get outputSection() {
    return this.page.getByTestId('output-section');
  }

  get executionPanel() {
    return this.page.getByTestId('execution-panel');
  }

  get toolNotFound() {
    return this.page.getByTestId('tool-not-found');
  }

  get toolError() {
    return this.page.getByTestId('tool-error');
  }

  // Actions
  async goto(toolId: string) {
    await this.page.goto(`/tools/${toolId}`);
  }

  async clickBackButton() {
    await this.backButton.click();
  }

  async waitForLoad() {
    await this.toolDetail.waitFor();
  }

  async waitForError() {
    await this.toolError.waitFor();
  }

  async waitForNotFound() {
    await this.toolNotFound.waitFor();
  }

  // Assertions
  async expectToolHeader(toolName: string) {
    await expect(this.toolName).toContainText(toolName);
  }

  async expectToolDetailVisible() {
    await expect(this.toolDetail).toBeVisible();
    await expect(this.toolHeader).toBeVisible();
    await expect(this.inputSection).toBeVisible();
    await expect(this.outputSection).toBeVisible();
    await expect(this.executionPanel).toBeVisible();
  }

  async expectBackButtonVisible() {
    await expect(this.backButton).toBeVisible();
  }

  async expectToolNotFound() {
    await expect(this.toolNotFound).toBeVisible();
    await expect(this.toolNotFound).toContainText('Tool Not Found');
  }

  async expectToolError() {
    await expect(this.toolError).toBeVisible();
    await expect(this.toolError).toContainText('Error Loading Tool');
  }

  async expectPageTitle(toolName: string) {
    await expect(this.page).toHaveTitle(`${toolName} - ToolVault`);
  }

  async expectUrl(toolId: string) {
    await expect(this.page).toHaveURL(`/tools/${toolId}`);
  }

  // Specific tool interactions
  async expectInputsSection() {
    await expect(this.inputSection).toBeVisible();
    // Could add more specific checks for input fields
  }

  async expectOutputsSection() {
    await expect(this.outputSection).toBeVisible();
    // Could add more specific checks for output displays
  }

  async expectExecutionSection() {
    await expect(this.executionPanel).toBeVisible();
    // Could add more specific checks for execution controls
  }
}