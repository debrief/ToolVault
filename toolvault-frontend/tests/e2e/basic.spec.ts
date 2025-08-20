import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads and contains expected content
  await expect(page.locator('h1')).toContainText('ToolVault');
  await expect(page.locator('.hero-subtitle')).toContainText('Portable, self-contained analysis tools');
  
  // Check navigation
  await expect(page.locator('.nav-link')).toContainText('Home');
  
  // Check feature cards are present
  await expect(page.locator('.feature-card')).toHaveCount(4);
});