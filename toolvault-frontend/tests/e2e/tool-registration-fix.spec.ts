import { test, expect } from '@playwright/test';

test('verify tool registration fix', async ({ page }) => {
  console.log('Testing tool registration fix...');
  
  // Test a few different tools that were failing
  const toolsToTest = ['direction-series', 'speed-series', 'flip-horizontal', 'export-csv'];
  
  for (const toolId of toolsToTest) {
    console.log(`Testing tool: ${toolId}`);
    
    // Navigate to tool detail page
    await page.goto(`/tool/${toolId}`);
    
    // Should NOT show registration error
    await expect(page.locator('text=not properly registered')).not.toBeVisible();
    
    // Should show tool detail page
    await expect(page.locator('.tool-detail')).toBeVisible();
    await expect(page.locator('.tool-tabs')).toBeVisible();
    
    // Should show tool name in h1
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    console.log(`✅ Tool ${toolId} loads successfully`);
  }
  
  console.log('All tools tested successfully!');
});