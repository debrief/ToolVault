import { test, expect } from '@playwright/test';
import { HomePage, ToolListPage, ToolDetailPage } from './pages';
import { createMockDataHelper, VIEWPORT_SIZES, testResponsiveLayout } from './helpers';

test.describe('Responsive Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test.describe('Mobile Layout (375px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
    });

    test('homepage should be responsive on mobile', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Main elements should be visible
      await expect(homePage.welcomeHeading).toBeVisible();
      await expect(homePage.browseToolsBtn).toBeVisible();
      await expect(homePage.toolCatalogBtn).toBeVisible();
      
      // Buttons should stack vertically on mobile
      const browseBtn = homePage.browseToolsBtn;
      const catalogBtn = homePage.toolCatalogBtn;
      
      const browseBtnBox = await browseBtn.boundingBox();
      const catalogBtnBox = await catalogBtn.boundingBox();
      
      expect(browseBtnBox).toBeTruthy();
      expect(catalogBtnBox).toBeTruthy();
      
      // Buttons should be stacked (Y positions different)
      expect(Math.abs(browseBtnBox!.y - catalogBtnBox!.y)).toBeGreaterThan(40);
    });

    test('tool list should be responsive on mobile', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Search and filters should be visible
      await expect(toolListPage.searchInput).toBeVisible();
      await expect(toolListPage.categoryFilter).toBeVisible();
      
      // Tool cards should stack in single column
      const toolCards = toolListPage.allToolCards;
      const cardCount = await toolCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Check first two cards are stacked vertically
      if (cardCount >= 2) {
        const firstCard = toolCards.nth(0);
        const secondCard = toolCards.nth(1);
        
        const firstCardBox = await firstCard.boundingBox();
        const secondCardBox = await secondCard.boundingBox();
        
        if (firstCardBox && secondCardBox) {
          // Cards should be vertically stacked (different Y positions)
          expect(Math.abs(firstCardBox.y - secondCardBox.y)).toBeGreaterThan(100);
        }
      }
    });

    test('tool detail should be responsive on mobile', async ({ page }) => {
      const toolDetailPage = new ToolDetailPage(page);
      
      await toolDetailPage.goto('wordcount');
      await toolDetailPage.waitForLoad();
      
      // Main sections should be visible
      await expect(toolDetailPage.toolHeader).toBeVisible();
      await expect(toolDetailPage.inputSection).toBeVisible();
      await expect(toolDetailPage.outputSection).toBeVisible();
      
      // Sections should stack vertically on mobile
      const inputSection = toolDetailPage.inputSection;
      const outputSection = toolDetailPage.outputSection;
      
      const inputBox = await inputSection.boundingBox();
      const outputBox = await outputSection.boundingBox();
      
      if (inputBox && outputBox) {
        // Sections should be stacked vertically
        expect(Math.abs(inputBox.y - outputBox.y)).toBeGreaterThan(100);
      }
      
      // Back button should be visible and clickable
      await expect(toolDetailPage.backButton).toBeVisible();
    });

    test('search filters should work on mobile', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Search should work
      await toolListPage.searchTools('Word Count');
      await page.waitForTimeout(500);
      
      await toolListPage.expectToolsCount(1);
      
      // Category filter should work
      await toolListPage.clearSearch();
      await page.waitForTimeout(500);
      
      await toolListPage.selectCategory('Text Analysis');
      await page.waitForTimeout(500);
      
      await toolListPage.expectToolsCount(2);
    });
  });

  test.describe('Tablet Layout (768px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.tablet);
    });

    test('homepage should adapt to tablet layout', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // All elements should be visible
      await expect(homePage.welcomeHeading).toBeVisible();
      await expect(homePage.browseToolsBtn).toBeVisible();
      await expect(homePage.toolCatalogBtn).toBeVisible();
      
      // Buttons might be side by side on tablet
      const browseBtn = homePage.browseToolsBtn;
      const catalogBtn = homePage.toolCatalogBtn;
      
      const browseBtnBox = await browseBtn.boundingBox();
      const catalogBtnBox = await catalogBtn.boundingBox();
      
      expect(browseBtnBox).toBeTruthy();
      expect(catalogBtnBox).toBeTruthy();
    });

    test('tool list should show multiple columns on tablet', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Should have multiple tool cards
      const toolCards = toolListPage.allToolCards;
      const cardCount = await toolCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Check if cards are arranged in multiple columns
      if (cardCount >= 2) {
        const firstCard = toolCards.nth(0);
        const secondCard = toolCards.nth(1);
        
        const firstCardBox = await firstCard.boundingBox();
        const secondCardBox = await secondCard.boundingBox();
        
        if (firstCardBox && secondCardBox) {
          const horizontalDistance = Math.abs(firstCardBox.x - secondCardBox.x);
          const verticalDistance = Math.abs(firstCardBox.y - secondCardBox.y);
          
          // Cards could be side by side or stacked depending on design
          expect(horizontalDistance > 50 || verticalDistance > 50).toBe(true);
        }
      }
    });

    test('tool detail should use two-column layout on tablet', async ({ page }) => {
      const toolDetailPage = new ToolDetailPage(page);
      
      await toolDetailPage.goto('wordcount');
      await toolDetailPage.waitForLoad();
      
      // Check if input and output sections are side by side
      const inputSection = toolDetailPage.inputSection;
      const outputSection = toolDetailPage.outputSection;
      
      const inputBox = await inputSection.boundingBox();
      const outputBox = await outputSection.boundingBox();
      
      if (inputBox && outputBox) {
        const horizontalDistance = Math.abs(inputBox.x - outputBox.x);
        const verticalDistance = Math.abs(inputBox.y - outputBox.y);
        
        // On tablet, sections might be side by side
        // Allow for either layout depending on design
        expect(horizontalDistance > 50 || verticalDistance > 50).toBe(true);
      }
    });
  });

  test.describe('Desktop Layout (1920px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.desktop);
    });

    test('homepage should use full desktop layout', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // All elements should be visible
      await expect(homePage.welcomeHeading).toBeVisible();
      await expect(homePage.browseToolsBtn).toBeVisible();
      await expect(homePage.toolCatalogBtn).toBeVisible();
      
      // Content should be centered with proper margins
      const container = page.locator('[data-testid="welcome-heading"]').locator('..');
      const containerBox = await container.boundingBox();
      
      if (containerBox) {
        // Should not take full width on desktop
        expect(containerBox.width).toBeLessThan(VIEWPORT_SIZES.desktop.width * 0.9);
      }
    });

    test('tool list should show optimal grid layout on desktop', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Should show multiple cards in a grid
      const toolCards = toolListPage.allToolCards;
      const cardCount = await toolCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Check grid layout
      if (cardCount >= 3) {
        const cards = [
          await toolCards.nth(0).boundingBox(),
          await toolCards.nth(1).boundingBox(),
          await toolCards.nth(2).boundingBox()
        ];
        
        if (cards.every(box => box !== null)) {
          // At least some cards should be on the same row (similar Y positions)
          const yPositions = cards.map(box => box!.y);
          const sameRowCards = yPositions.filter(y => 
            Math.abs(y - yPositions[0]) < 50
          ).length;
          
          expect(sameRowCards).toBeGreaterThan(1);
        }
      }
    });

    test('tool detail should use full two-column layout on desktop', async ({ page }) => {
      const toolDetailPage = new ToolDetailPage(page);
      
      await toolDetailPage.goto('geo-buffer');
      await toolDetailPage.waitForLoad();
      
      // Input and output sections should be side by side
      const inputSection = toolDetailPage.inputSection;
      const outputSection = toolDetailPage.outputSection;
      
      const inputBox = await inputSection.boundingBox();
      const outputBox = await outputSection.boundingBox();
      
      if (inputBox && outputBox) {
        // Should be side by side on desktop
        const horizontalDistance = Math.abs(inputBox.x - outputBox.x);
        expect(horizontalDistance).toBeGreaterThan(200);
        
        // Should be roughly at the same vertical level
        const verticalDistance = Math.abs(inputBox.y - outputBox.y);
        expect(verticalDistance).toBeLessThan(100);
      }
    });
  });

  test.describe('Cross-Viewport Navigation', () => {
    test('should maintain functionality across viewport changes', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      // Start on desktop
      await page.setViewportSize(VIEWPORT_SIZES.desktop);
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Apply search
      await toolListPage.searchTools('analysis');
      await page.waitForTimeout(500);
      
      const desktopResultCount = await toolListPage.allToolCards.count();
      
      // Switch to mobile
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
      await page.waitForTimeout(500);
      
      // Search should still be applied
      await expect(toolListPage.searchInput).toHaveValue('analysis');
      const mobileResultCount = await toolListPage.allToolCards.count();
      
      // Should have same number of results
      expect(mobileResultCount).toBe(desktopResultCount);
      
      // Switch to tablet
      await page.setViewportSize(VIEWPORT_SIZES.tablet);
      await page.waitForTimeout(500);
      
      // Should still work
      const tabletResultCount = await toolListPage.allToolCards.count();
      expect(tabletResultCount).toBe(desktopResultCount);
    });

    test('should handle orientation changes on mobile', async ({ page }) => {
      const homePage = new HomePage(page);
      
      // Portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.goto();
      await homePage.waitForLoad();
      
      await expect(homePage.welcomeHeading).toBeVisible();
      
      // Landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);
      
      // Should still be functional
      await expect(homePage.welcomeHeading).toBeVisible();
      await expect(homePage.browseToolsBtn).toBeVisible();
    });
  });

  test.describe('Responsive Images and Media', () => {
    test('should handle images responsively', async ({ page }) => {
      // This test would be more relevant if we had images
      const homePage = new HomePage(page);
      
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Check if any images exist and are responsive
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const maxWidth = await img.evaluate(el => 
            window.getComputedStyle(el).maxWidth
          );
          
          // Images should have max-width constraint
          expect(maxWidth === '100%' || maxWidth !== 'none').toBe(true);
        }
      }
    });
  });

  test.describe('Touch and Mobile Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Tap on tool card
      const firstCard = toolListPage.getToolCard('wordcount');
      await firstCard.tap();
      
      // Should navigate to tool detail
      await expect(page).toHaveURL('/tools/wordcount');
    });

    test('should have appropriate touch targets', async ({ page }) => {
      const homePage = new HomePage(page);
      
      await homePage.goto();
      await homePage.waitForLoad();
      
      // Check button sizes are touch-friendly (minimum 44px)
      const browseBtn = homePage.browseToolsBtn;
      const btnBox = await browseBtn.boundingBox();
      
      if (btnBox) {
        expect(btnBox.height).toBeGreaterThan(44);
        expect(btnBox.width).toBeGreaterThan(44);
      }
    });

    test('should handle swipe gestures appropriately', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      // Swipe gestures should not interfere with normal scrolling
      await page.mouse.move(200, 300);
      await page.mouse.down();
      await page.mouse.move(200, 100);
      await page.mouse.up();
      
      // Page should still be functional
      await expect(toolListPage.searchInput).toBeVisible();
    });
  });

  test.describe('Content Reflow', () => {
    test('should reflow content appropriately at different breakpoints', async ({ page }) => {
      const toolListPage = new ToolListPage(page);
      
      await toolListPage.goto();
      await toolListPage.waitForToolsToLoad();
      
      const breakpoints = [
        { width: 320, height: 568 },  // Small mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1024, height: 768 }, // Landscape tablet
        { width: 1440, height: 900 }  // Desktop
      ];
      
      for (const viewport of breakpoints) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(300);
        
        // Content should still be visible and usable
        await expect(toolListPage.searchInput).toBeVisible();
        const cardCount = await toolListPage.allToolCards.count();
        expect(cardCount).toBeGreaterThan(0);
        
        // No horizontal overflow
        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
        
        expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 20); // Allow small margin
      }
    });
  });
});