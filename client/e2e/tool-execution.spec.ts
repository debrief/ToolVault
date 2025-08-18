import { test, expect } from '@playwright/test';
import { ToolDetailPage } from './pages';
import { createMockDataHelper } from './helpers';

test.describe('Tool Execution', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test('should execute word-count tool with test data', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('word-count');
    await toolDetailPage.waitForLoad();
    
    // Check execution panel is visible
    await toolDetailPage.expectExecutionSection();
    await toolDetailPage.expectLoadTestDataButtonVisible();
    await toolDetailPage.expectExecuteButtonVisible();
    
    // Load test data and execute
    await toolDetailPage.executeWithTestData();
    
    // Check output is displayed
    await toolDetailPage.expectOutputVisible();
    await toolDetailPage.expectOutputContains('count');
    await toolDetailPage.expectOutputContains('characters');
    await toolDetailPage.expectOutputContains('words');
  });

  test('should execute change-color-to-red tool with test data', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('change-color-to-red');
    await toolDetailPage.waitForLoad();
    
    // Check execution panel is visible
    await toolDetailPage.expectExecutionSection();
    await toolDetailPage.expectLoadTestDataButtonVisible();
    
    // Load test data and execute
    await toolDetailPage.executeWithTestData();
    
    // Check output shows the updated feature
    await toolDetailPage.expectOutputVisible();
    await toolDetailPage.expectOutputContains('feature');
    await toolDetailPage.expectOutputContains('colorChanged');
    await toolDetailPage.expectOutputContains('red');
  });

  test('should execute geo-buffer tool with test data', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('geo-buffer');
    await toolDetailPage.waitForLoad();
    
    // Check execution panel is visible
    await toolDetailPage.expectExecutionSection();
    await toolDetailPage.expectLoadTestDataButtonVisible();
    
    // Load test data and execute
    await toolDetailPage.executeWithTestData();
    
    // Check output shows the buffered geometry
    await toolDetailPage.expectOutputVisible();
    await toolDetailPage.expectOutputContains('buffered_geometry');
    await toolDetailPage.expectOutputContains('Polygon');
  });

  test('should execute json-validator tool with test data', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('json-validator');
    await toolDetailPage.waitForLoad();
    
    // Check execution panel is visible
    await toolDetailPage.expectExecutionSection();
    await toolDetailPage.expectLoadTestDataButtonVisible();
    
    // Load test data and execute
    await toolDetailPage.executeWithTestData();
    
    // Check output shows validation results
    await toolDetailPage.expectOutputVisible();
    await toolDetailPage.expectOutputContains('isValid');
    await toolDetailPage.expectOutputContains('formatted');
  });

  test('should execute hash-generator tool with test data', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('hash-generator');
    await toolDetailPage.waitForLoad();
    
    // Check execution panel is visible
    await toolDetailPage.expectExecutionSection();
    await toolDetailPage.expectLoadTestDataButtonVisible();
    
    // Load test data and execute
    await toolDetailPage.executeWithTestData();
    
    // Check output shows generated hashes
    await toolDetailPage.expectOutputVisible();
    await toolDetailPage.expectOutputContains('hashes');
    await toolDetailPage.expectOutputContains('md5');
    await toolDetailPage.expectOutputContains('sha1');
    await toolDetailPage.expectOutputContains('sha256');
  });

  test('should execute base64-codec tool with test data', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('base64-codec');
    await toolDetailPage.waitForLoad();
    
    // Check execution panel is visible
    await toolDetailPage.expectExecutionSection();
    await toolDetailPage.expectLoadTestDataButtonVisible();
    
    // Load test data and execute
    await toolDetailPage.executeWithTestData();
    
    // Check output shows encoded result
    await toolDetailPage.expectOutputVisible();
    await toolDetailPage.expectOutputContains('output');
    await toolDetailPage.expectOutputContains('operation');
  });

  test('should validate required fields before execution', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('word-count');
    await toolDetailPage.waitForLoad();
    
    // Try to execute without filling required fields
    await toolDetailPage.executeTool();
    
    // Should show validation error
    await toolDetailPage.expectValidationError();
  });

  test('should handle invalid JSON input', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('json-validator');
    await toolDetailPage.waitForLoad();
    
    // Fill input with invalid JSON
    await toolDetailPage.fillInputField('{ invalid json }');
    await toolDetailPage.executeTool();
    
    // Should show validation result for invalid JSON
    await toolDetailPage.expectOutputVisible();
    await toolDetailPage.expectOutputContains('isValid');
    await toolDetailPage.expectOutputContains('false');
  });

  test('should load test data on button click', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('word-count');
    await toolDetailPage.waitForLoad();
    
    // Input should be empty initially
    const inputField = toolDetailPage.inputField;
    await expect(inputField).toBeEmpty();
    
    // Load test data
    await toolDetailPage.loadTestData();
    
    // Input should now be filled
    await toolDetailPage.expectInputFieldFilled();
    await expect(inputField).toContainText('Lorem ipsum');
  });

  test('should execute tools quickly', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('word-count');
    await toolDetailPage.waitForLoad();
    
    const startTime = Date.now();
    
    // Execute with test data
    await toolDetailPage.executeWithTestData();
    
    const executionTime = Date.now() - startTime;
    
    // Should execute within 3 seconds
    expect(executionTime).toBeLessThan(3000);
    
    // Output should be visible
    await toolDetailPage.expectOutputVisible();
  });

  test('should handle concurrent tool executions', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    // Test multiple tools in sequence
    const tools = ['word-count', 'json-validator', 'hash-generator'];
    
    for (const toolId of tools) {
      await toolDetailPage.goto(toolId);
      await toolDetailPage.waitForLoad();
      await toolDetailPage.executeWithTestData();
      await toolDetailPage.expectOutputVisible();
    }
  });
});