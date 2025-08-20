import { test, expect } from '@playwright/test';

test('test manual navigation scenario', async ({ page }) => {
  // Exactly replicate the user's scenario
  console.log('Starting navigation test...');
  
  // Step 1: Go to browse tools first (like user would)
  await page.goto('/browse');
  console.log('1. At browse page:', page.url());
  
  // Wait for tools to load
  await page.waitForSelector('.tool-card', { timeout: 10000 });
  console.log('2. Tools loaded');
  
  // Find translate tool specifically
  const translateCard = page.locator('.tool-card').filter({ hasText: 'Translate Features' });
  await expect(translateCard).toBeVisible();
  
  // Click Details button (what user would do)
  const detailsButton = translateCard.locator('.btn').filter({ hasText: 'Details' }).first();
  await detailsButton.click();
  console.log('3. Clicked Details button');
  
  // Should now be on tool detail page
  await expect(page).toHaveURL('/tool/translate');
  console.log('4. Now at tool detail page:', page.url());
  
  // Check if header navigation is present and functional
  await expect(page.locator('.header')).toBeVisible();
  await expect(page.locator('.nav-links')).toBeVisible();
  console.log('5. Header is visible');
  
  // Try clicking each navigation link
  console.log('6. Testing navigation links...');
  
  // Test Home link
  const homeLink = page.locator('.nav-link').filter({ hasText: 'Home' });
  await expect(homeLink).toBeVisible();
  console.log('Home link visible, href:', await homeLink.getAttribute('href'));
  
  await homeLink.click();
  await page.waitForTimeout(1000);
  console.log('After Home click:', page.url());
  
  // Go back to tool detail page for next test
  await page.goto('/tool/translate');
  console.log('7. Back to tool detail page for Browse Tools test');
  
  // Test Browse Tools link
  const browseLink = page.locator('.nav-link').filter({ hasText: 'Browse Tools' });
  await expect(browseLink).toBeVisible();
  console.log('Browse Tools link visible, href:', await browseLink.getAttribute('href'));
  
  await browseLink.click();
  await page.waitForTimeout(1000);
  console.log('After Browse Tools click:', page.url());
  
  // Go back to tool detail page for next test
  await page.goto('/tool/translate');
  console.log('8. Back to tool detail page for Test Tools test');
  
  // Test Test Tools link
  const testToolsLink = page.locator('.nav-link').filter({ hasText: 'Test Tools' });
  await expect(testToolsLink).toBeVisible();
  console.log('Test Tools link visible, href:', await testToolsLink.getAttribute('href'));
  
  await testToolsLink.click();
  await page.waitForTimeout(1000);
  console.log('After Test Tools click:', page.url());
  
  console.log('Navigation test completed');
});