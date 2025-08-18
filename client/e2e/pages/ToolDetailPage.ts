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

  // Dynamic execution panel elements
  get loadTestDataButton() {
    return this.page.getByRole('button', { name: 'Load Test Data' });
  }

  get executeButton() {
    return this.page.getByRole('button', { name: 'Execute' });
  }

  get inputField() {
    return this.page.getByRole('textbox').first();
  }

  get outputViewer() {
    return this.page.locator('[data-testid="output-viewer"]');
  }

  get validationError() {
    return this.page.locator('.MuiFormHelperText-root.Mui-error');
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

  // Tool execution actions
  async loadTestData() {
    await this.loadTestDataButton.click();
    await this.page.waitForTimeout(500); // Wait for data to populate
  }

  async executeWithTestData() {
    await this.loadTestData();
    await this.executeButton.click();
    await this.page.waitForTimeout(1000); // Wait for execution
  }

  async fillInputField(value: string) {
    await this.inputField.fill(value);
  }

  async executeTool() {
    await this.executeButton.click();
    await this.page.waitForTimeout(1000); // Wait for execution
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

  // Tool execution assertions
  async expectLoadTestDataButtonVisible() {
    await expect(this.loadTestDataButton).toBeVisible();
  }

  async expectExecuteButtonVisible() {
    await expect(this.executeButton).toBeVisible();
  }

  async expectExecuteButtonEnabled() {
    await expect(this.executeButton).toBeEnabled();
  }

  async expectInputFieldFilled() {
    await expect(this.inputField).not.toBeEmpty();
  }

  async expectOutputVisible() {
    await expect(this.outputViewer).toBeVisible();
  }

  async expectValidationError() {
    await expect(this.validationError).toBeVisible();
  }

  async expectNoValidationError() {
    await expect(this.validationError).not.toBeVisible();
  }

  async expectOutputContains(text: string) {
    await expect(this.outputViewer).toContainText(text);
  }
}