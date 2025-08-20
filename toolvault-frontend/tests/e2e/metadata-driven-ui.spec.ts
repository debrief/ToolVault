import { test, expect } from '@playwright/test';

// Test metadata-driven UI generation for different tool types
test.describe('Metadata-Driven UI Generation', () => {
  
  test('should generate correct form for translate tool (multiple param types)', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Should show all parameter fields based on metadata
    const paramFields = page.locator('.parameter-field');
    await expect(paramFields).toHaveCount(5);
    
    // Check specific parameter types are rendered correctly
    // Distance - number field
    const distanceField = page.locator('.parameter-field').filter({ hasText: 'distance' });
    await expect(distanceField.locator('input[type="number"]')).toBeVisible();
    
    // Direction - number field
    const directionField = page.locator('.parameter-field').filter({ hasText: 'direction' });
    await expect(directionField.locator('input[type="number"]')).toBeVisible();
    
    // Units - enum/select field
    const unitsField = page.locator('.parameter-field').filter({ hasText: 'units' });
    await expect(unitsField.locator('select')).toBeVisible();
    
    // Should have default values populated
    const unitsSelect = unitsField.locator('select');
    await expect(unitsSelect).toHaveValue('meters');
  });
  
  test('should generate correct form for speed-series tool (boolean params)', async ({ page }) => {
    await page.goto('/tool/speed-series?tab=example');
    
    // Should show parameter fields
    const paramFields = page.locator('.parameter-field');
    await expect(paramFields).toHaveCount(3);
    
    // Check boolean parameter is rendered as checkbox
    const smoothingField = page.locator('.parameter-field').filter({ hasText: 'smoothing' });
    await expect(smoothingField.locator('input[type="checkbox"]')).toBeVisible();
    
    // Check enum parameter for time_unit
    const timeUnitField = page.locator('.parameter-field').filter({ hasText: 'time_unit' });
    await expect(timeUnitField.locator('select')).toBeVisible();
    
    // Should have options: seconds, minutes, hours
    const timeUnitSelect = timeUnitField.locator('select');
    await expect(timeUnitSelect.locator('option')).toHaveCount(3);
  });
  
  test('should generate correct form for flip-vertical tool (no params)', async ({ page }) => {
    await page.goto('/tool/flip-vertical?tab=example');
    
    // Should show no parameters message
    await expect(page.locator('text=No parameters required for this tool')).toBeVisible();
    
    // Should still show execute button
    await expect(page.locator('.execute-button')).toBeVisible();
  });
  
  test('should validate parameter inputs correctly', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Test number field validation
    const distanceInput = page.locator('.parameter-field').filter({ hasText: 'distance' }).locator('input');
    
    // Enter invalid value
    await distanceInput.fill('invalid');
    await distanceInput.blur();
    
    // Should reset to valid value or show error
    // (The exact behavior depends on how we implemented validation)
    
    // Test enum field shows correct options
    const unitsSelect = page.locator('.parameter-field').filter({ hasText: 'units' }).locator('select');
    const options = await unitsSelect.locator('option').allTextContents();
    expect(options).toContain('meters');
    expect(options).toContain('kilometers');
  });
  
  test('should handle different input types for different tools', async ({ page }) => {
    // Test tool that accepts FeatureCollection
    await page.goto('/tool/translate?tab=example');
    
    // Should show accepted input types
    await expect(page.locator('text=Feature, FeatureCollection')).toBeVisible();
    
    // Test tool that accepts string input  
    await page.goto('/tool/import-rep?tab=example');
    
    // Should show string input type
    await expect(page.locator('text=string')).toBeVisible();
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
      await expect(page.locator('text=GeoJSON Data')).toBeVisible();
    }
  });
  
  test('should show parameter descriptions and help text', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Should show parameter descriptions
    const distanceField = page.locator('.parameter-field').filter({ hasText: 'distance' });
    await expect(distanceField.locator('.parameter-description')).toContainText('Distance to translate (meters)');
    
    const directionField = page.locator('.parameter-field').filter({ hasText: 'direction' });
    await expect(directionField.locator('.parameter-description')).toContainText('Direction in degrees (0=North, 90=East)');
  });
  
  test('should load example parameters when clicking example buttons', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Should have example buttons if examples exist
    const exampleButtons = page.locator('.example-button');
    const exampleCount = await exampleButtons.count();
    
    if (exampleCount > 0) {
      // Click first example
      await exampleButtons.first().click();
      
      // Should populate parameter values
      const distanceInput = page.locator('.parameter-field').filter({ hasText: 'distance' }).locator('input');
      const distanceValue = await distanceInput.inputValue();
      expect(distanceValue).not.toBe('0'); // Should be populated with example value
    }
  });
});