import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads and contains expected content
  await expect(page.locator('h1')).toContainText('ToolVault');
  await expect(page.locator('.hero-subtitle')).toContainText('Portable, self-contained analysis tools');
  
  // Check navigation links are present
  await expect(page.locator('.nav-link').first()).toContainText('Home');
  
  // Check feature cards are present
  await expect(page.locator('.feature-card')).toHaveCount(4);
});

test('should navigate to browse tools page', async ({ page }) => {
  await page.goto('/');
  
  // Click on Browse Tools link
  await page.click('text=Browse Tools');
  
  // Should navigate to browse page
  await expect(page).toHaveURL('/browse');
  
  // Should show tool browser heading
  await expect(page.locator('h1')).toContainText('Tool Browser');
});