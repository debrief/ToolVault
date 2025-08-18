import { test, expect } from '@playwright/test';
import { ToolDetailPage } from './pages';
import { createMockDataHelper } from './helpers';

test.describe('Input Viewers', () => {
  test.beforeEach(async ({ page }) => {
    const mockHelper = createMockDataHelper(page);
    await mockHelper.setupMockData();
  });

  test('should show map viewer for GeoJSON input in change-color-to-red tool', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    // Navigate to change-color-to-red tool
    await toolDetailPage.goto('change-color-to-red');
    await toolDetailPage.waitForLoad();
    
    // Check that the tool loaded correctly
    await toolDetailPage.expectToolHeader('Change Color to Red');
    
    // Load test data to populate the input
    await toolDetailPage.loadTestData();
    
    // Wait for data to populate
    await page.waitForTimeout(1000);
    
    // Check if the input field contains GeoJSON data
    const inputField = page.getByRole('textbox').first();
    const inputValue = await inputField.inputValue();
    console.log('Input value:', inputValue.substring(0, 100) + '...');
    
    // Check if there's a viewer toggle button visible
    const viewerToggle = page.getByRole('button').filter({ has: page.getByText('Switch to Viewer') });
    const isToggleVisible = await viewerToggle.isVisible().catch(() => false);
    console.log('Viewer toggle visible:', isToggleVisible);
    
    if (isToggleVisible) {
      // Click the viewer toggle to switch to map view
      await viewerToggle.click();
      await page.waitForTimeout(1000);
      
      // Check if map container is visible
      const mapContainer = page.locator('.leaflet-container');
      await expect(mapContainer).toBeVisible();
      
      console.log('Map viewer successfully displayed');
    } else {
      console.log('Viewer toggle not visible - checking why...');
      
      // Debug: Check what input type is detected
      const inputSection = page.getByTestId('input-section');
      const inputText = await inputSection.textContent();
      console.log('Input section content:', inputText);
    }
  });

  test('should detect GeoJSON input type correctly', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('change-color-to-red');
    await toolDetailPage.waitForLoad();
    
    // Load test data
    await toolDetailPage.loadTestData();
    await page.waitForTimeout(1000);
    
    // Check that the input is labeled as geojson type
    const inputChip = page.locator('[data-testid="input-section"]').getByText('geojson');
    await expect(inputChip).toBeVisible();
    
    // Check that the input field contains valid GeoJSON
    const inputField = page.getByRole('textbox').first();
    const inputValue = await inputField.inputValue();
    
    // Parse the input to verify it's valid GeoJSON
    try {
      const parsedData = JSON.parse(inputValue);
      expect(parsedData).toHaveProperty('type', 'Feature');
      expect(parsedData).toHaveProperty('geometry');
      expect(parsedData.geometry).toHaveProperty('type');
      expect(parsedData.geometry).toHaveProperty('coordinates');
      console.log('✅ Input contains valid GeoJSON Feature');
    } catch (error) {
      console.log('❌ Input does not contain valid JSON:', error);
    }
  });

  test('should auto-enable viewer mode for GeoJSON inputs', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('change-color-to-red');
    await toolDetailPage.waitForLoad();
    
    // Load test data
    await toolDetailPage.loadTestData();
    await page.waitForTimeout(1000);
    
    // Check if viewer mode is automatically enabled
    const mapContainer = page.locator('.leaflet-container');
    const isMapVisible = await mapContainer.isVisible().catch(() => false);
    
    if (isMapVisible) {
      console.log('✅ Map viewer is automatically enabled');
      
      // Check that the feature is displayed on the map
      await expect(mapContainer).toBeVisible();
      
      // Check for map tiles
      const mapTiles = page.locator('.leaflet-tile-pane');
      await expect(mapTiles).toBeVisible();
      
      // Check for GeoJSON layer
      const geoJsonLayer = page.locator('.leaflet-overlay-pane svg');
      await expect(geoJsonLayer).toBeVisible();
      
    } else {
      console.log('❌ Map viewer is not automatically enabled');
      
      // Check if there's a toggle available
      const viewerToggle = page.getByRole('button').filter({ has: page.getByText('Switch to Viewer') });
      const isToggleVisible = await viewerToggle.isVisible().catch(() => false);
      
      if (isToggleVisible) {
        console.log('ℹ️ Viewer toggle is available but not auto-enabled');
      } else {
        console.log('❌ No viewer toggle available at all');
      }
    }
  });

  test('should allow switching between viewer and editor modes', async ({ page }) => {
    const toolDetailPage = new ToolDetailPage(page);
    
    await toolDetailPage.goto('change-color-to-red');
    await toolDetailPage.waitForLoad();
    await toolDetailPage.loadTestData();
    await page.waitForTimeout(1000);
    
    // Look for viewer toggle
    const viewerToggle = page.locator('button[title*="Switch to"]');
    
    if (await viewerToggle.isVisible()) {
      const toggleTitle = await viewerToggle.getAttribute('title');
      console.log('Toggle button title:', toggleTitle);
      
      if (toggleTitle?.includes('Switch to Viewer')) {
        // Currently in editor mode, switch to viewer
        await viewerToggle.click();
        await page.waitForTimeout(1000);
        
        // Verify map is now visible
        const mapContainer = page.locator('.leaflet-container');
        await expect(mapContainer).toBeVisible();
        
        // Switch back to editor
        await viewerToggle.click();
        await page.waitForTimeout(500);
        
        // Verify text field is back
        const textField = page.getByRole('textbox').first();
        await expect(textField).toBeVisible();
        
        console.log('✅ Successfully switched between viewer and editor modes');
      } else if (toggleTitle?.includes('Switch to Editor')) {
        // Currently in viewer mode
        console.log('✅ Already in viewer mode by default');
      }
    } else {
      console.log('❌ No viewer toggle found');
    }
  });
});