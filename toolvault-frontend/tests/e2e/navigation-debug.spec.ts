import { test, expect } from '@playwright/test';

test('debug navigation issues', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Navigate to tool detail page
  await page.goto('/tool/translate');
  
  // Wait for page to load
  await page.waitForSelector('.tool-detail', { timeout: 10000 });
  
  // Check if header is visible
  await expect(page.locator('.header')).toBeVisible();
  await expect(page.locator('.nav-links')).toBeVisible();
  
  // Check if navigation links are clickable
  const homeLink = page.locator('.nav-link').filter({ hasText: 'Home' });
  await expect(homeLink).toBeVisible();
  
  console.log('Home link href:', await homeLink.getAttribute('href'));
  console.log('Home link text:', await homeLink.textContent());
  
  // Try to click and see what happens
  await homeLink.click();
  
  // Check current URL after click
  console.log('URL after Home click:', page.url());
  
  // Wait a moment to see if navigation happens
  await page.waitForTimeout(2000);
  
  // Check final URL
  console.log('Final URL:', page.url());
});