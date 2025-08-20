import { test, expect } from '@playwright/test';

test('verify layout stability when loading sample data', async ({ page }) => {
  await page.goto('/tool/translate?tab=example');
  
  // Wait for page to load
  await page.waitForSelector('.execution-interface');
  
  // Get initial layout dimensions
  const initialLayout = await page.evaluate(() => {
    const interfaceGrid = document.querySelector('.interface-grid') as HTMLElement;
    const inputSection = document.querySelector('.input-section') as HTMLElement;
    const paramSection = document.querySelector('.parameters-section') as HTMLElement;
    const outputSection = document.querySelector('.output-section') as HTMLElement;
    
    return {
      gridWidth: interfaceGrid?.offsetWidth || 0,
      inputWidth: inputSection?.offsetWidth || 0,
      paramWidth: paramSection?.offsetWidth || 0,
      outputWidth: outputSection?.offsetWidth || 0,
    };
  });
  
  console.log('Initial layout:', initialLayout);
  
  // Load sample data which previously caused resizing
  await page.click('text=Sample Data');
  await page.click('text=Load Sample GeoJSON Data');
  
  // Wait for data to load
  await page.waitForTimeout(1000);
  
  // Get layout dimensions after loading data
  const afterDataLayout = await page.evaluate(() => {
    const interfaceGrid = document.querySelector('.interface-grid') as HTMLElement;
    const inputSection = document.querySelector('.input-section') as HTMLElement;
    const paramSection = document.querySelector('.parameters-section') as HTMLElement;
    const outputSection = document.querySelector('.output-section') as HTMLElement;
    
    return {
      gridWidth: interfaceGrid?.offsetWidth || 0,
      inputWidth: inputSection?.offsetWidth || 0,
      paramWidth: paramSection?.offsetWidth || 0,
      outputWidth: outputSection?.offsetWidth || 0,
    };
  });
  
  console.log('After data layout:', afterDataLayout);
  
  // Verify proportional layout is maintained (2:1 ratio for input:params)
  const initialRatio = initialLayout.inputWidth / initialLayout.paramWidth;
  const afterRatio = afterDataLayout.inputWidth / afterDataLayout.paramWidth;
  const ratioTolerance = 0.1; // 10% tolerance for ratio stability
  
  expect(Math.abs(initialRatio - afterRatio)).toBeLessThanOrEqual(ratioTolerance);
  
  // Verify the layout is using full available width (grid should be close to main content width)
  const mainContentWidth = await page.evaluate(() => {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    return mainContent?.offsetWidth || 0;
  });
  
  const gridWidthPercentage = (afterDataLayout.gridWidth / mainContentWidth) * 100;
  expect(gridWidthPercentage).toBeGreaterThan(80); // Should use most of available width
  
  console.log('✅ Layout stability maintained when loading data');
  
  // Also test executing the tool to see if that causes layout changes
  await page.click('.execute-button');
  
  // Wait for execution to complete (look for output content or error)
  await page.waitForSelector('.output-section .io-tabs, .output-section .error-message', { timeout: 10000 });
  
  const afterExecutionLayout = await page.evaluate(() => {
    const interfaceGrid = document.querySelector('.interface-grid') as HTMLElement;
    const inputSection = document.querySelector('.input-section') as HTMLElement;
    const paramSection = document.querySelector('.parameters-section') as HTMLElement;
    const outputSection = document.querySelector('.output-section') as HTMLElement;
    
    return {
      gridWidth: interfaceGrid?.offsetWidth || 0,
      inputWidth: inputSection?.offsetWidth || 0,
      paramWidth: paramSection?.offsetWidth || 0,
      outputWidth: outputSection?.offsetWidth || 0,
    };
  });
  
  console.log('After execution layout:', afterExecutionLayout);
  
  // Verify proportional layout is still maintained after execution
  const afterExecutionRatio = afterExecutionLayout.inputWidth / afterExecutionLayout.paramWidth;
  expect(Math.abs(initialRatio - afterExecutionRatio)).toBeLessThanOrEqual(ratioTolerance);
  
  console.log('✅ Layout stability maintained after tool execution');
});