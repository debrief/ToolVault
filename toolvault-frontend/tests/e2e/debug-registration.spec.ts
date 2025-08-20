import { test } from '@playwright/test';

test('debug tool registration', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  console.log('Testing direction-series tool...');
  
  await page.goto('/tool/direction-series');
  
  // Wait for the page to fully load
  await page.waitForTimeout(3000);
  
  console.log('Current URL:', page.url());
  
  // Check what's actually on the page
  const bodyText = await page.locator('body').textContent();
  console.log('Page content preview:', bodyText?.slice(0, 200));
  
  // Check if it's an error page
  const errorDiv = page.locator('.tool-detail-error');
  if (await errorDiv.isVisible()) {
    const errorText = await errorDiv.textContent();
    console.log('Error found:', errorText);
  }
  
  // Check if tool detail loaded successfully
  const toolDetail = page.locator('.tool-detail');
  if (await toolDetail.isVisible()) {
    console.log('✅ Tool detail page loaded successfully');
  } else {
    console.log('❌ Tool detail page not found');
  }
  
  // Check window.ToolVault in browser context
  const toolVaultStatus = await page.evaluate(() => {
    if (typeof window !== 'undefined' && window.ToolVault) {
      const tools = window.ToolVault.tools || {};
      const availableTools = Object.keys(tools);
      return {
        hasToolVault: true,
        availableTools,
        hasDirectionSeries: !!tools.calculateDirectionSeries,
        toolsCount: availableTools.length
      };
    }
    return { hasToolVault: false };
  });
  
  console.log('ToolVault status:', JSON.stringify(toolVaultStatus, null, 2));
});