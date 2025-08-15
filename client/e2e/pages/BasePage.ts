import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  // Common page actions
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForDOMContentLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async getCurrentUrl() {
    return this.page.url();
  }

  async reload() {
    await this.page.reload();
  }

  async goBack() {
    await this.page.goBack();
  }

  async goForward() {
    await this.page.goForward();
  }

  // Keyboard navigation helpers
  async pressTab() {
    await this.page.keyboard.press('Tab');
  }

  async pressEnter() {
    await this.page.keyboard.press('Enter');
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }

  async pressSpace() {
    await this.page.keyboard.press('Space');
  }

  // Common accessibility helpers
  async getFocusedElement() {
    return await this.page.locator(':focus');
  }

  async getElementByRole(role: string, name?: string) {
    return name 
      ? this.page.getByRole(role as any, { name })
      : this.page.getByRole(role as any);
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    return await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  async takeFullPageScreenshot(name: string) {
    return await this.page.screenshot({ 
      path: `screenshots/${name}-full.png`,
      fullPage: true 
    });
  }

  // Performance helpers
  async getPerformanceMetrics() {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime,
      };
    });
  }
}