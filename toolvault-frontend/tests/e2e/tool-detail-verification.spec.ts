import { test, expect } from '@playwright/test';

// Essential verification tests for tool detail page functionality
test.describe('Tool Detail Page - Core Verification', () => {
  
  test('should navigate to tool detail page and show metadata-driven UI', async ({ page }) => {
    // Navigate directly to a known tool detail page
    await page.goto('/tool/translate');
    
    // Verify we're on the tool detail page
    await expect(page.locator('.tool-detail')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Translate Features');
    
    // Verify tabbed interface
    await expect(page.locator('.tool-tabs')).toBeVisible();
    await expect(page.locator('.tab-button')).toHaveCount(3);
    
    // Verify Overview tab is active by default
    await expect(page.locator('.tab-button.active')).toContainText('Overview');
    
    // Verify metadata is displayed
    await expect(page.locator('.tool-metadata')).toBeVisible();
    await expect(page.locator('.parameters-overview')).toBeVisible();
  });
  
  test('should switch to Try It tab and show dynamic form', async ({ page }) => {
    await page.goto('/tool/translate');
    
    // Click Try It tab
    await page.click('text=Try It');
    
    // Verify tab switched
    await expect(page.locator('.tab-button.active')).toContainText('Try It');
    
    // Verify execution interface components are present
    await expect(page.locator('.execution-interface')).toBeVisible();
    await expect(page.locator('.input-viewer')).toBeVisible();
    await expect(page.locator('.parameter-form')).toBeVisible();
    await expect(page.locator('.output-viewer')).toBeVisible();
    
    // Verify dynamic form has parameter fields
    const paramFields = page.locator('.parameter-field');
    expect(await paramFields.count()).toBeGreaterThan(0);
  });
  
  test('should show tool with no parameters correctly', async ({ page }) => {
    // Navigate to a tool with no parameters (flip-vertical)
    await page.goto('/tool/flip-vertical');
    
    // Verify tool loads
    await expect(page.locator('h1')).toContainText('Flip Vertical');
    
    // Switch to Try It tab
    await page.click('text=Try It');
    
    // Should show execution interface even with no parameters
    await expect(page.locator('.execution-interface')).toBeVisible();
    await expect(page.locator('.input-viewer')).toBeVisible();
    await expect(page.locator('.output-viewer')).toBeVisible();
  });
  
  test('should handle query parameter for tab selection', async ({ page }) => {
    // Navigate with tab query parameter
    await page.goto('/tool/translate?tab=example');
    
    // Should start on Try It tab
    await expect(page.locator('.tab-button.active')).toContainText('Try It');
    
    // Verify execution interface is shown
    await expect(page.locator('.execution-interface')).toBeVisible();
  });
  
  test('should show back navigation to browse page', async ({ page }) => {
    await page.goto('/tool/translate');
    
    // Should have back button
    await expect(page.locator('.back-button')).toBeVisible();
    await expect(page.locator('.back-button')).toContainText('Back to Browse Tools');
    
    // Click back button
    await page.click('.back-button');
    
    // Should navigate to browse page
    await expect(page).toHaveURL('/browse');
    await expect(page.locator('h1')).toContainText('Tool Browser');
  });
  
  test('should navigate from browse page to tool detail', async ({ page }) => {
    await page.goto('/browse');
    
    // Wait for tools to load
    await page.waitForSelector('.tool-card', { timeout: 10000 });
    
    // Find a tool card with Details button
    const detailsButton = page.locator('.tool-card .btn').filter({ hasText: 'Details' }).first();
    await expect(detailsButton).toBeVisible();
    
    // Click Details button
    await detailsButton.click();
    
    // Should navigate to a tool detail page
    await expect(page).toHaveURL(/\/tool\/.+/);
    await expect(page.locator('.tool-detail')).toBeVisible();
  });
});

// Verify metadata-driven form generation
test.describe('Metadata-Driven Form Generation', () => {
  
  test('should generate form fields for translate tool parameters', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Should have parameter fields based on translate tool metadata
    const distanceField = page.locator('.parameter-field').filter({ hasText: 'distance' });
    await expect(distanceField).toBeVisible();
    await expect(distanceField.locator('input[type="number"]')).toBeVisible();
    
    const unitsField = page.locator('.parameter-field').filter({ hasText: 'units' });
    await expect(unitsField).toBeVisible();
    await expect(unitsField.locator('select')).toBeVisible();
    
    // Verify parameter descriptions are shown
    await expect(distanceField.locator('.parameter-description')).toContainText('Distance to translate');
  });
  
  test('should show input/output viewers', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Should have input viewer with mode selection
    const inputViewer = page.locator('.input-viewer');
    await expect(inputViewer).toBeVisible();
    await expect(inputViewer.locator('.input-mode-selector')).toBeVisible();
    
    // Should have output viewer
    const outputViewer = page.locator('.output-viewer');
    await expect(outputViewer).toBeVisible();
    await expect(outputViewer.locator('.output-empty')).toBeVisible(); // Empty state initially
  });
});