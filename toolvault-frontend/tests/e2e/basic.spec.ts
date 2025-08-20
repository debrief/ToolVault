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

test('should navigate to tool detail page from browse', async ({ page }) => {
  await page.goto('/browse');
  
  // Wait for tools to load
  await page.waitForSelector('.tool-card', { timeout: 10000 });
  
  // Should have at least one tool card
  const toolCards = page.locator('.tool-card');
  await expect(toolCards).toHaveCount(12); // We know there are 12 Phase 0 tools
  
  // Click on the first tool's "Details" button
  const firstDetailsButton = page.locator('.tool-card .btn-primary').first();
  await expect(firstDetailsButton).toContainText('Details');
  
  await firstDetailsButton.click();
  
  // Should navigate to a tool detail page
  await expect(page).toHaveURL(/\/tool\/.+/);
  
  // Should show tool detail page elements
  await expect(page.locator('.tool-detail')).toBeVisible();
  await expect(page.locator('.tool-tabs')).toBeVisible();
  await expect(page.locator('.tab-button')).toHaveCount(3); // Overview, Try It, History
});

test('should show tool overview tab by default', async ({ page }) => {
  // Navigate directly to a known tool (translate)
  await page.goto('/tool/translate');
  
  // Should show overview tab as active by default
  await expect(page.locator('.tab-button.active')).toContainText('Overview');
  
  // Should show tool name and description
  await expect(page.locator('h1')).toContainText('Translate Features');
  await expect(page.locator('.tool-description')).toContainText('Translate geometric features');
  
  // Should show metadata sections
  await expect(page.locator('.tool-metadata')).toBeVisible();
  await expect(page.locator('.parameters-overview')).toBeVisible();
});

test('should switch to Try It tab and show dynamic form', async ({ page }) => {
  await page.goto('/tool/translate');
  
  // Click on Try It tab
  await page.click('text=Try It');
  
  // Should show Try It tab as active
  await expect(page.locator('.tab-button.active')).toContainText('Try It');
  
  // Should show execution interface
  await expect(page.locator('.execution-interface')).toBeVisible();
  
  // Should show input viewer
  await expect(page.locator('.input-viewer')).toBeVisible();
  
  // Should show parameter form (translate tool has 5 parameters)
  await expect(page.locator('.parameter-field')).toHaveCount(5);
  
  // Should show output viewer
  await expect(page.locator('.output-viewer')).toBeVisible();
  
  // Execute button should be disabled initially (no input data)
  await expect(page.locator('.execute-button')).toBeDisabled();
});

test('should load example data and enable execution', async ({ page }) => {
  await page.goto('/tool/translate?tab=example');
  
  // Should start on Try It tab due to query parameter
  await expect(page.locator('.tab-button.active')).toContainText('Try It');
  
  // Click on first example button if available
  const exampleButton = page.locator('.example-button').first();
  if (await exampleButton.isVisible()) {
    await exampleButton.click();
    
    // Should populate parameter values
    await expect(page.locator('.parameter-input').first()).not.toHaveValue('');
  }
  
  // Load sample data
  await page.click('text=Sample Data');
  await page.click('text=Load Sample GeoJSON Data');
  
  // Should show current input preview
  await expect(page.locator('.current-data-preview')).toBeVisible();
  
  // Execute button should now be enabled
  await expect(page.locator('.execute-button')).toBeEnabled();
});

test('should execute tool and show output', async ({ page }) => {
  await page.goto('/tool/translate?tab=example');
  
  // Load sample data
  await page.click('text=Sample Data');
  await page.click('text=Load Sample GeoJSON Data');
  
  // Wait for input to be loaded
  await expect(page.locator('.execute-button')).toBeEnabled();
  
  // Execute the tool
  await page.click('.execute-button');
  
  // Should show executing state
  await expect(page.locator('.execute-button')).toContainText('Executing...');
  
  // Wait for execution to complete
  await expect(page.locator('.execute-button')).toContainText('Run Tool', { timeout: 10000 });
  
  // Should show output data
  await expect(page.locator('.output-section .io-tabs')).toBeVisible();
  
  // Should be able to switch between output tabs
  const rawTabButton = page.locator('.output-section .tab-button').filter({ hasText: 'Raw Data' });
  if (await rawTabButton.isVisible()) {
    await rawTabButton.click();
    await expect(page.locator('.json-renderer')).toBeVisible();
  }
});