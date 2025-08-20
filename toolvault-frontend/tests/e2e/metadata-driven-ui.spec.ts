import { test, expect } from '@playwright/test';

// Test metadata-driven UI generation for different tool types
test.describe('Metadata-Driven UI Generation', () => {
  
  test('should generate correct form for translate tool (multiple param types)', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Should show all parameter rows based on metadata
    const paramRows = page.locator('.parameters-form-table tr');
    await expect(paramRows).toHaveCount(5);
    
    // Check specific parameter types are rendered correctly
    // Distance - number field
    const distanceRow = page.locator('.parameters-form-table tr').filter({ hasText: 'distance' });
    await expect(distanceRow.locator('input[type="number"]')).toBeVisible();
    
    // Direction - number field
    const directionRow = page.locator('.parameters-form-table tr').filter({ hasText: 'direction' });
    await expect(directionRow.locator('input[type="number"]')).toBeVisible();
    
    // Units - enum/select field
    const unitsRow = page.locator('.parameters-form-table tr').filter({ hasText: 'units' });
    await expect(unitsRow.locator('select')).toBeVisible();
    
    // Should have default values populated
    const unitsSelect = unitsRow.locator('select');
    await expect(unitsSelect).toHaveValue('meters');
  });
  
  test('should generate correct form for speed-series tool (boolean params)', async ({ page }) => {
    await page.goto('/tool/speed-series?tab=example');
    
    // Should show parameter rows
    const paramRows = page.locator('.parameters-form-table tr');
    await expect(paramRows).toHaveCount(3);
    
    // Check boolean parameter is rendered as checkbox
    const smoothingRow = page.locator('.parameters-form-table tr').filter({ hasText: 'smoothing' });
    await expect(smoothingRow.locator('input[type="checkbox"]')).toBeVisible();
    
    // Check enum parameter for time_unit
    const timeUnitRow = page.locator('.parameters-form-table tr').filter({ hasText: 'time_unit' });
    await expect(timeUnitRow.locator('select')).toBeVisible();
    
    // Should have options: seconds, minutes, hours
    const timeUnitSelect = timeUnitRow.locator('select');
    await expect(timeUnitSelect.locator('option')).toHaveCount(3);
  });
  
  test('should generate correct form for flip-vertical tool (no params)', async ({ page }) => {
    await page.goto('/tool/flip-vertical?tab=example');
    
    // Should show no parameters message
    await expect(page.locator('text=This tool requires no parameters')).toBeVisible();
    
    // Should still show execute button
    await expect(page.locator('.execute-button')).toBeVisible();
  });
  
  test('should validate parameter inputs correctly', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Test number field - can enter valid numeric values
    const distanceInput = page.locator('.parameters-form-table tr').filter({ hasText: 'distance' }).locator('input');
    
    // Enter valid value
    await distanceInput.fill('100');
    await expect(distanceInput).toHaveValue('100');
    
    // Test enum field shows correct options
    const unitsSelect = page.locator('.parameters-form-table tr').filter({ hasText: 'units' }).locator('select');
    const options = await unitsSelect.locator('option').allTextContents();
    expect(options).toContain('meters');
    expect(options).toContain('kilometers');
  });
  
  test('should handle different input types for different tools', async ({ page }) => {
    // Test tool that accepts FeatureCollection
    await page.goto('/tool/translate?tab=example');
    
    // Should show accepted input types (use more specific selector to avoid strict mode violation)
    await expect(page.locator('.input-data-section').first()).toContainText('Feature, FeatureCollection');
    
    // Test tool that accepts string input  
    await page.goto('/tool/import-rep?tab=example');
    
    // Should show string input type
    await expect(page.locator('.input-data-section').first()).toContainText('string');
  });
  
  test('should generate correct output viewers for different output types', async ({ page }) => {
    // Load sample data and execute translate tool (outputs FeatureCollection)
    await page.goto('/tool/translate?tab=example');
    
    await page.click('text=Sample Data');
    await page.click('text=Load Sample GeoJSON Data');
    
    await expect(page.locator('.execute-button')).toBeEnabled();
    await page.click('.execute-button');
    
    // Wait for execution
    await expect(page.locator('.execute-button')).toContainText('Run Tool', { timeout: 10000 });
    
    // Should show GeoJSON preview
    const outputTabs = page.locator('.output-section .io-tabs');
    await expect(outputTabs).toBeVisible();
    
    // Should have Preview tab showing GeoJSON info
    const previewTab = page.locator('.output-section .tab-button').filter({ hasText: 'Preview' });
    if (await previewTab.isVisible()) {
      await previewTab.click();
      await expect(page.locator('.output-section h4').filter({ hasText: 'GeoJSON Data' })).toBeVisible();
    }
  });
  
  test('should show parameter descriptions and help text', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Should show parameter descriptions in table
    const distanceRow = page.locator('.parameters-form-table tr').filter({ has: page.locator('.param-name strong', { hasText: 'distance' }) });
    await expect(distanceRow.locator('.param-description')).toContainText('Distance to translate (meters)');
    
    const directionRow = page.locator('.parameters-form-table tr').filter({ has: page.locator('.param-name strong', { hasText: 'direction' }) });
    await expect(directionRow.locator('.param-description')).toContainText('Direction in degrees (0=North, 90=East)');
  });
  
  test('should load example parameters when clicking example buttons', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Should have example buttons if examples exist
    const exampleButtons = page.locator('.example-button-small');
    const exampleCount = await exampleButtons.count();
    
    if (exampleCount > 0) {
      // Click first example
      await exampleButtons.first().click();
      
      // Should populate parameter values
      const distanceInput = page.locator('.parameters-form-table tr').filter({ hasText: 'distance' }).locator('input');
      const distanceValue = await distanceInput.inputValue();
      expect(distanceValue).not.toBe('0'); // Should be populated with example value
    }
  });
});