import { test, expect } from '@playwright/test';

test('debug parameter input functionality', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  console.log('Testing parameter input on translate tool...');
  
  await page.goto('/tool/translate?tab=example');
  
  // Wait for the page to fully load
  await page.waitForTimeout(2000);
  
  console.log('Current URL:', page.url());
  
  // Check if tool detail loaded successfully
  const toolDetail = page.locator('.tool-detail');
  if (await toolDetail.isVisible()) {
    console.log('✅ Tool detail page loaded successfully');
  } else {
    console.log('❌ Tool detail page not found');
    return;
  }
  
  // Check for parameters section
  const parametersSection = page.locator('.parameters-section');
  await expect(parametersSection).toBeVisible();
  console.log('✅ Parameters section found');
  
  // Check for parameter form
  const parameterForm = page.locator('.parameter-form');
  await expect(parameterForm).toBeVisible();
  console.log('✅ Parameter form found');
  
  // Check for parameter fields
  const parameterFields = page.locator('.parameter-field');
  const fieldCount = await parameterFields.count();
  console.log(`Found ${fieldCount} parameter fields`);
  
  if (fieldCount > 0) {
    // Check first parameter field
    const firstField = parameterFields.first();
    const fieldLabel = await firstField.locator('.parameter-label').textContent();
    console.log(`First parameter: ${fieldLabel}`);
    
    // Find input element in first field
    const inputElement = firstField.locator('input, select, textarea').first();
    if (await inputElement.isVisible()) {
      console.log('✅ Input element found');
      
      // Check if input is enabled
      const isDisabled = await inputElement.isDisabled();
      console.log(`Input disabled: ${isDisabled}`);
      
      // Check input focus capability
      await inputElement.focus();
      console.log('✅ Focused input element');
      
      // Try to click and type
      try {
        await inputElement.click();
        console.log('✅ Clicked input element');
        
        // Check input type to determine what to type
        const inputType = await inputElement.getAttribute('type');
        console.log(`Input type: ${inputType}`);
        
        let testValue = 'test-value';
        if (inputType === 'number') {
          testValue = '42';
        }
        
        await inputElement.fill(testValue);
        console.log(`✅ Filled input with test value: ${testValue}`);
        
        // Wait a moment for React state updates
        await page.waitForTimeout(500);
        
        const currentValue = await inputElement.inputValue();
        console.log(`Current input value after wait: "${currentValue}"`);
        
        // Try typing instead of filling
        await inputElement.clear();
        await inputElement.type(testValue);
        console.log(`✅ Typed value: ${testValue}`);
        
        await page.waitForTimeout(500);
        const typedValue = await inputElement.inputValue();
        console.log(`Current input value after typing: "${typedValue}"`);
        
        if (typedValue === testValue) {
          console.log('✅ INPUT WORKING CORRECTLY WITH TYPING');
        } else {
          console.log('❌ INPUT NOT ACCEPTING TYPED VALUE');
        }
      } catch (error) {
        console.log(`❌ Error interacting with input: ${String(error)}`);
      }
    } else {
      console.log('❌ Input element not visible');
    }
  }
  
  // Check CSS that might be blocking input
  const styles = await page.evaluate(() => {
    const paramForm = document.querySelector('.parameter-form');
    if (paramForm) {
      const computedStyle = window.getComputedStyle(paramForm);
      return {
        pointerEvents: computedStyle.pointerEvents,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex
      };
    }
    return null;
  });
  console.log('Parameter form styles:', styles);
});