import { test, expect } from '@playwright/test';

test('homepage has title and welcome message', async ({ page }) => {
  await page.goto('/');

  // Expect a title "ToolVault"
  await expect(page).toHaveTitle(/ToolVault/);

  // Expect welcome heading
  await expect(page.getByRole('heading', { name: 'Welcome to ToolVault' })).toBeVisible();

  // Expect phase information
  await expect(page.getByText('Phase 1 - UI Mockup')).toBeVisible();
});

test('navigation drawer opens and closes', async ({ page }) => {
  await page.goto('/');

  // Click menu button
  await page.getByRole('button', { name: /open drawer/i }).click();

  // Check that navigation items are visible
  await expect(page.getByText('Navigation')).toBeVisible();
  await expect(page.getByText('Tools')).toBeVisible();
  await expect(page.getByText('History')).toBeVisible();

  // Close drawer by clicking outside
  await page.getByRole('heading', { name: 'Welcome to ToolVault' }).click();
});