import { Page, expect } from '@playwright/test';

export class NotFoundPage {
  constructor(private page: Page) {}

  // Locators
  get heading404() {
    return this.page.getByTestId('404-heading');
  }

  get notFoundTitle() {
    return this.page.getByTestId('not-found-title');
  }

  get goBackBtn() {
    return this.page.getByTestId('go-back-btn');
  }

  get homeBtn() {
    return this.page.getByTestId('home-btn');
  }

  get browseToolsBtn() {
    return this.page.getByTestId('browse-tools-btn');
  }

  // Actions
  async goto() {
    await this.page.goto('/404');
  }

  async gotoInvalidPath(path: string) {
    await this.page.goto(path);
  }

  async clickGoBack() {
    await this.goBackBtn.click();
  }

  async clickHome() {
    await this.homeBtn.click();
  }

  async clickBrowseTools() {
    await this.browseToolsBtn.click();
  }

  // Assertions
  async expect404Page() {
    await expect(this.heading404).toContainText('404');
    await expect(this.notFoundTitle).toContainText('Page Not Found');
  }

  async expectNavigationButtons() {
    await expect(this.goBackBtn).toBeVisible();
    await expect(this.homeBtn).toBeVisible();
    await expect(this.browseToolsBtn).toBeVisible();
  }

  async expectUrl() {
    await expect(this.page).toHaveURL('/404');
  }

  async expectPageTitle() {
    await expect(this.page).toHaveTitle(/ToolVault/);
  }

  async waitForLoad() {
    await this.heading404.waitFor();
    await this.notFoundTitle.waitFor();
  }
}