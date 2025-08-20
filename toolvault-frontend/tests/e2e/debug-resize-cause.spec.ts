import { test } from '@playwright/test';

test('debug what causes the resize when loading data', async ({ page }) => {
  // Set a fixed viewport size to control for browser resizing
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('/tool/translate?tab=example');
  
  // Wait for page to load
  await page.waitForSelector('.execution-interface');
  
  console.log('Viewport size:', await page.viewportSize());
  
  // Check body and html dimensions
  const bodyInfo = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    return {
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
      htmlScrollWidth: html.scrollWidth,
      htmlClientWidth: html.clientWidth,
      windowInnerWidth: window.innerWidth
    };
  });
  
  console.log('Initial body/html info:', bodyInfo);
  
  // Check main-content dimensions
  const mainContentInfo = await page.evaluate(() => {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    return {
      classList: Array.from(mainContent?.classList || []),
      offsetWidth: mainContent?.offsetWidth || 0,
      scrollWidth: mainContent?.scrollWidth || 0,
      clientWidth: mainContent?.clientWidth || 0,
      style: mainContent ? window.getComputedStyle(mainContent) : null
    };
  });
  
  console.log('Main content info:', {
    ...mainContentInfo,
    style: {
      maxWidth: mainContentInfo.style?.maxWidth,
      width: mainContentInfo.style?.width,
      margin: mainContentInfo.style?.margin,
      padding: mainContentInfo.style?.padding
    }
  });
  
  // Get detailed grid info
  const initialGridInfo = await page.evaluate(() => {
    const grid = document.querySelector('.interface-grid') as HTMLElement;
    const gridStyle = grid ? window.getComputedStyle(grid) : null;
    
    return {
      offsetWidth: grid?.offsetWidth || 0,
      scrollWidth: grid?.scrollWidth || 0,
      clientWidth: grid?.clientWidth || 0,
      gridTemplateColumns: gridStyle?.gridTemplateColumns,
      gap: gridStyle?.gap,
      parentWidth: grid?.parentElement?.offsetWidth || 0
    };
  });
  
  console.log('Initial grid info:', initialGridInfo);
  
  // Load sample data
  await page.click('text=Sample Data');
  await page.click('text=Load Sample GeoJSON Data');
  
  // Wait for data to load
  await page.waitForTimeout(1000);
  
  // Check if viewport changed
  console.log('Viewport size after data load:', await page.viewportSize());
  
  // Check body/html dimensions after data load
  const bodyInfoAfter = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    return {
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
      htmlScrollWidth: html.scrollWidth,
      htmlClientWidth: html.clientWidth,
      windowInnerWidth: window.innerWidth
    };
  });
  
  console.log('After body/html info:', bodyInfoAfter);
  
  // Check main-content dimensions after
  const mainContentInfoAfter = await page.evaluate(() => {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    return {
      classList: Array.from(mainContent?.classList || []),
      offsetWidth: mainContent?.offsetWidth || 0,
      scrollWidth: mainContent?.scrollWidth || 0,
      clientWidth: mainContent?.clientWidth || 0
    };
  });
  
  console.log('Main content info after:', mainContentInfoAfter);
  
  // Get grid info after data load
  const afterGridInfo = await page.evaluate(() => {
    const grid = document.querySelector('.interface-grid') as HTMLElement;
    
    return {
      offsetWidth: grid?.offsetWidth || 0,
      scrollWidth: grid?.scrollWidth || 0,
      clientWidth: grid?.clientWidth || 0,
      parentWidth: grid?.parentElement?.offsetWidth || 0
    };
  });
  
  console.log('After grid info:', afterGridInfo);
  
  // Check if there's a scrollbar that appeared/disappeared
  const scrollbarInfo = await page.evaluate(() => {
    return {
      hasVerticalScrollbar: document.body.scrollHeight > window.innerHeight,
      hasHorizontalScrollbar: document.body.scrollWidth > window.innerWidth,
      bodyScrollHeight: document.body.scrollHeight,
      bodyScrollWidth: document.body.scrollWidth,
      windowInnerHeight: window.innerHeight,
      windowInnerWidth: window.innerWidth
    };
  });
  
  console.log('Scrollbar info:', scrollbarInfo);
});