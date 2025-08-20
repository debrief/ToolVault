import { test, expect } from '@playwright/test';

test('verify input viewer has 3-tab interface like output viewer', async ({ page }) => {
  await page.goto('/tool/translate?tab=example');
  
  // Should show input viewer
  await expect(page.locator('.input-viewer')).toBeVisible();
  
  // Should show input data display section
  await expect(page.locator('.input-data-display')).toBeVisible();
  
  // Should show IOTabs in input section
  const inputTabs = page.locator('.input-data-display .io-tabs');
  await expect(inputTabs).toBeVisible();
  
  // Should have 2 tabs initially (Preview, Raw Data) - Download hidden when no data
  const tabButtons = inputTabs.locator('.io-tab-button');
  await expect(tabButtons).toHaveCount(2);
  
  // Check tab names
  await expect(tabButtons.nth(0)).toContainText('Preview');
  await expect(tabButtons.nth(1)).toContainText('Raw Data');
  
  // Preview tab should be active by default
  await expect(inputTabs.locator('.io-tab-button.io-tab-active')).toContainText('Preview');
  
  // Should show no input placeholder initially
  await expect(page.locator('.no-input-placeholder')).toBeVisible();
  await expect(page.locator('.placeholder-title')).toContainText('No Input Data');
  
  // Load sample data
  await page.click('text=Sample Data');
  await page.click('text=Load Sample GeoJSON Data');
  
  // Should now show data in preview tab
  await expect(page.locator('.no-input-placeholder')).not.toBeVisible();
  
  // Should show current input data title
  await expect(inputTabs.locator('.io-tabs-title')).toContainText('Current Input Data');
  
  // Should now have 3 tabs (Preview, Raw Data, Download) after loading data
  const tabButtonsWithData = inputTabs.locator('.io-tab-button');
  await expect(tabButtonsWithData).toHaveCount(3);
  
  // Check all tab names
  await expect(tabButtonsWithData.nth(0)).toContainText('Preview');
  await expect(tabButtonsWithData.nth(1)).toContainText('Raw Data');
  await expect(tabButtonsWithData.nth(2)).toContainText('Download');
  
  // Test switching to Raw Data tab
  await page.click('.input-data-display .io-tab-button:has-text("Raw Data")');
  await expect(page.locator('.input-data-display .io-tab-button.io-tab-active')).toContainText('Raw Data');
  await expect(page.locator('.input-data-display .json-renderer')).toBeVisible();
  
  // Test switching to Download tab
  await page.click('.input-data-display .io-tab-button:has-text("Download")');
  await expect(page.locator('.input-data-display .io-tab-button.io-tab-active')).toContainText('Download');
  await expect(page.locator('.input-data-display .file-handler')).toBeVisible();
  
  // Should show download buttons for current input data
  const downloadButtons = page.locator('.input-data-display .download-button');
  expect(await downloadButtons.count()).toBeGreaterThan(0);
  
  console.log('✅ Input viewer 3-tab interface working correctly');
});