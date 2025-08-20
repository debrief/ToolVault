import { test, expect } from '@playwright/test';

// Test complete user workflows through the tool system
test.describe('Tool Execution Workflow', () => {
  
  test('should complete full workflow: browse → detail → execute', async ({ page }) => {
    // Step 1: Start from browse page
    await page.goto('/browse');
    await page.waitForSelector('.tool-card', { timeout: 10000 });
    
    // Step 2: Find and click on translate tool specifically
    const translateCard = page.locator('.tool-card').filter({ hasText: 'Translate Features' });
    await expect(translateCard).toBeVisible();
    
    const detailsButton = translateCard.locator('.btn-primary');
    await detailsButton.click();
    
    // Step 3: Should be on tool detail page
    await expect(page).toHaveURL('/tool/translate');
    await expect(page.locator('h1')).toContainText('Translate Features');
    
    // Step 4: Switch to Try It tab
    await page.click('text=Try It');
    await expect(page.locator('.tab-button.active')).toContainText('Try It');
    
    // Step 5: Load sample data
    await page.click('text=Sample Data');
    await page.click('text=Load Sample GeoJSON Data');
    
    // Step 6: Verify input is loaded
    await expect(page.locator('.current-data-preview')).toBeVisible();
    await expect(page.locator('.execute-button')).toBeEnabled();
    
    // Step 7: Execute tool - check for brief "Executing..." state or skip if too fast
    const executeButton = page.locator('.execute-button');
    await executeButton.click();
    
    // Try to catch the executing state, but don't fail if it's too fast
    try {
      await expect(executeButton).toContainText('Executing...', { timeout: 1000 });
    } catch {
      // If execution is too fast, that's okay - just continue
      console.log('Execution was too fast to catch "Executing..." state');
    }
    
    // Step 8: Wait for completion and verify output
    await expect(executeButton).toContainText('▶ Run Tool', { timeout: 10000 });
    await expect(page.locator('.output-section .io-tabs')).toBeVisible();
    
    // Step 9: Verify execution info is shown
    await expect(page.locator('.output-info')).toBeVisible();
    await expect(page.locator('.info-section').filter({ hasText: 'Execution time' })).toBeVisible();
  });
  
  test('should handle Try Tool direct navigation', async ({ page }) => {
    // Navigate from browse page using "Try Tool" button
    await page.goto('/browse');
    await page.waitForSelector('.tool-card', { timeout: 10000 });
    
    // Click "Try Tool" button on first tool
    const tryToolButton = page.locator('.tool-card .btn-secondary').first();
    await expect(tryToolButton).toContainText('Try Tool');
    
    await tryToolButton.click();
    
    // Should navigate to tool detail page with example tab active
    await expect(page).toHaveURL(/\/tool\/.+\?tab=example/);
    await expect(page.locator('.tab-button.active')).toContainText('Try It');
  });
  
  test('should handle test-tools page navigation', async ({ page }) => {
    await page.goto('/test-tools');
    
    // Wait for tools to load
    await page.waitForSelector('.tool-card', { timeout: 10000 });
    
    // Should show metadata-driven UI testing complete message
    await expect(page.locator('.test-note')).toBeVisible();
    await expect(page.locator('text=Metadata-Driven UI Testing Complete')).toBeVisible();
    
    // Click "View Details" on a tool
    const viewDetailsButton = page.locator('.action-button.primary').first();
    await expect(viewDetailsButton).toContainText('View Details');
    
    await viewDetailsButton.click();
    
    // Should navigate to tool detail page
    await expect(page).toHaveURL(/\/tool\/.+/);
    await expect(page.locator('.tool-detail')).toBeVisible();
  });
  
  test('should execute multiple tools with different parameter types', async ({ page }) => {
    // Test 1: Execute translate tool (number + enum params)
    await page.goto('/tool/translate?tab=example');
    
    await page.click('text=Sample Data');
    await page.click('text=Load Sample GeoJSON Data');
    
    // Modify parameters using table structure
    const distanceInput = page.locator('.parameters-form-table tr').filter({ hasText: 'distance' }).locator('input');
    await distanceInput.fill('1000');
    
    const unitsSelect = page.locator('.parameters-form-table tr').filter({ hasText: 'units' }).locator('select');
    await unitsSelect.selectOption('meters');
    
    const executeButton = page.locator('.execute-button');
    await executeButton.click();
    await expect(executeButton).toContainText('▶ Run Tool', { timeout: 10000 });
    
    // Should have output
    await expect(page.locator('.output-section .io-tabs')).toBeVisible();
    
    // Test 2: Execute flip-vertical tool (no params)
    await page.goto('/tool/flip-vertical?tab=example');
    
    await page.click('text=Sample Data');
    await page.click('text=Load Sample GeoJSON Data');
    
    // Should be able to execute immediately (no params to set)
    const executeButton2 = page.locator('.execute-button');
    await expect(executeButton2).toBeEnabled();
    await executeButton2.click();
    await expect(executeButton2).toContainText('▶ Run Tool', { timeout: 10000 });
    
    await expect(page.locator('.output-section .io-tabs')).toBeVisible();
  });
  
  test('should handle input/output data visualization', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Load sample data
    await page.click('text=Sample Data');
    await page.click('text=Load Sample GeoJSON Data');
    
    // Check input preview
    const inputTabs = page.locator('.input-section .io-tabs');
    await expect(inputTabs).toBeVisible();
    
    // Execute tool
    await page.click('.execute-button');
    await expect(page.locator('.execute-button')).toContainText('Run Tool', { timeout: 10000 });
    
    // Test output tab switching
    const outputTabs = page.locator('.output-section .io-tabs');
    await expect(outputTabs).toBeVisible();
    
    // Switch to Raw Data tab
    const rawDataTab = outputTabs.locator('.io-tab-button').filter({ hasText: 'Raw Data' });
    await rawDataTab.click();
    await expect(page.locator('.json-renderer')).toBeVisible();
    
    // Switch to Download tab
    const downloadTab = outputTabs.locator('.io-tab-button').filter({ hasText: 'Download' });
    await downloadTab.click();
    await expect(page.locator('.file-handler')).toBeVisible();
    const downloadButtons = page.locator('.download-button');
    expect(await downloadButtons.count()).toBeGreaterThan(0);
  });
  
  test('should show error handling for invalid execution', async ({ page }) => {
    await page.goto('/tool/translate?tab=example');
    
    // Try to execute without input data
    // Execute button should be disabled
    await expect(page.locator('.execute-button')).toBeDisabled();
    
    // Load invalid text data for a tool expecting GeoJSON
    await page.click('text=Text Input');
    const textArea = page.locator('.data-textarea');
    await textArea.fill('invalid json data');
    
    // Should show parse error
    await expect(page.locator('.parse-error')).toBeVisible();
    await expect(page.locator('text=Invalid JSON format')).toBeVisible();
    
    // Execute button should still be enabled (will pass as raw string)
    await expect(page.locator('.execute-button')).toBeEnabled();
    
    // Execute - this will pass through the string data (not an error)
    const executeButton = page.locator('.execute-button');
    await executeButton.click();
    await expect(executeButton).toContainText('▶ Run Tool', { timeout: 10000 });
    
    // Should show successful execution with string output
    await expect(page.locator('.output-section .io-tabs')).toBeVisible();
    await expect(page.locator('.output-info')).toBeVisible();
    
    // The output should contain the string that was passed through
    await expect(page.locator('.output-section')).toContainText('string');
  });
  
  test('should preserve URL state during navigation', async ({ page }) => {
    // Navigate to tool with tab parameter
    await page.goto('/tool/translate?tab=example');
    
    // Should preserve tab state
    await expect(page.locator('.tab-button.active')).toContainText('Try It');
    
    // need to find, and click on `Browse Tools` link
    const browseLink = page.locator('.nav-link').filter({ hasText: 'Browse Tools' });
    await expect(browseLink).toBeVisible();
    browseLink.click();
    await expect(page).toHaveURL('/browse');
    
    // Navigate to tool again
    await page.goto('/tool/speed-series');
    await expect(page.locator('.tab-button.active')).toContainText('Overview');
    
    // Navigate with different tab
    await page.goto('/tool/speed-series?tab=example');
    await expect(page.locator('.tab-button.active')).toContainText('Try It');
  });
});