// Integration tests for tool loading and basic functionality
require('../../tools/transform/translate.js');
require('../../tools/transform/flip-horizontal.js');
require('../../tools/transform/flip-vertical.js');
require('../../tools/analysis/speed-series.js');
require('../../tools/analysis/direction-series.js');
require('../../tools/statistics/average-speed.js');
require('../../tools/statistics/speed-histogram.js');
require('../../tools/processing/smooth-polyline.js');
require('../../tools/io/export-csv.js');
require('../../tools/io/export-rep.js');
require('../../tools/io/import-rep.js');

// Initialize window object
global.window = global.window || {};

describe('Tool Loading Integration', () => {
  test('should load all tools without conflicts', () => {
    expect(window.ToolVault).toBeDefined();
    expect(window.ToolVault.tools).toBeDefined();
    
    // Transform tools
    expect(typeof window.ToolVault.tools.translate).toBe('function');
    expect(typeof window.ToolVault.tools.flipHorizontal).toBe('function');
    expect(typeof window.ToolVault.tools.flipVertical).toBe('function');
    
    // Analysis tools
    expect(typeof window.ToolVault.tools.calculateSpeedSeries).toBe('function');
    expect(typeof window.ToolVault.tools.calculateDirectionSeries).toBe('function');
    
    // Statistics tools
    expect(typeof window.ToolVault.tools.calculateAverageSpeed).toBe('function');
    expect(typeof window.ToolVault.tools.createSpeedHistogram).toBe('function');
    
    // Processing tools
    expect(typeof window.ToolVault.tools.smoothPolyline).toBe('function');
    
    // I/O tools
    expect(typeof window.ToolVault.tools.exportCSV).toBe('function');
    expect(typeof window.ToolVault.tools.exportREP).toBe('function');
    expect(typeof window.ToolVault.tools.importREP).toBe('function');
  });

  test('should have consistent tool naming conventions', () => {
    const toolNames = Object.keys(window.ToolVault.tools);
    
    // All tool names should be camelCase
    toolNames.forEach(name => {
      expect(name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
    });
    
    // Verify expected tool count
    expect(toolNames.length).toBe(11);
  });

  test('should support tool chaining workflow', () => {
    // Create a sample track
    const track = {
      type: 'Feature',
      properties: {
        timestamps: [0, 60000, 120000] // 1 minute intervals
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [0.001, 0.001],
          [0.002, 0.002]
        ]
      }
    };

    // 1. Calculate speed series
    const speedSeries = window.ToolVault.tools.calculateSpeedSeries(track, { time_unit: 'seconds' });
    expect(Array.isArray(speedSeries)).toBe(true);
    expect(speedSeries.length).toBeGreaterThan(0);

    // 2. Calculate average speed
    const avgSpeed = window.ToolVault.tools.calculateAverageSpeed(track, { time_unit: 'seconds' });
    expect(typeof avgSpeed).toBe('number');
    expect(avgSpeed).toBeGreaterThan(0);

    // 3. Create histogram from the track
    const histogram = window.ToolVault.tools.createSpeedHistogram(track, { bins: 5 });
    expect(histogram).toHaveProperty('bins');
    expect(histogram).toHaveProperty('counts');

    // 4. Smooth the track
    const smoothed = window.ToolVault.tools.smoothPolyline(track);
    expect(smoothed.geometry.type).toBe('LineString');

    // 5. Export to CSV
    const csv = window.ToolVault.tools.exportCSV(smoothed);
    expect(typeof csv).toBe('string');
    expect(csv).toContain('longitude,latitude');
  });

  test('should handle REP format roundtrip', () => {
    // Create REP data
    const repData = '220118 120000.000 TEST_VESSEL @ 50 30 0.000 N 1 15 0.000 W 90 15 100';
    
    // Import REP data
    const imported = window.ToolVault.tools.importREP(repData);
    expect(imported.type).toBe('FeatureCollection');
    expect(imported.features).toHaveLength(1);
    
    // Export back to REP
    const exported = window.ToolVault.tools.exportREP(imported.features[0]);
    expect(typeof exported).toBe('string');
    expect(exported).toContain('TEST_VESSEL');
    expect(exported).toContain('220118');
  });

  test('should maintain data integrity through transformations', () => {
    const originalTrack = {
      type: 'Feature',
      properties: {
        name: 'Test Track',
        color: 'blue'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
          [2, 2]
        ]
      }
    };

    // Apply translate transformation
    const translated = window.ToolVault.tools.translate(originalTrack, { dx: 1, dy: 1 });
    
    // Properties should be preserved
    expect(translated.properties.name).toBe('Test Track');
    expect(translated.properties.color).toBe('blue');
    
    // Geometry structure should be maintained
    expect(translated.geometry.type).toBe('LineString');
    expect(translated.geometry.coordinates).toHaveLength(3);
    
    // Coordinates should be transformed correctly
    expect(translated.geometry.coordinates[0]).toEqual([1, 1]);
    expect(translated.geometry.coordinates[1]).toEqual([2, 2]);
    expect(translated.geometry.coordinates[2]).toEqual([3, 3]);
  });

  test('should handle error conditions gracefully', () => {
    // Test with invalid input types
    expect(() => {
      window.ToolVault.tools.translate(null);
    }).not.toThrow();

    expect(() => {
      window.ToolVault.tools.calculateSpeedSeries({});
    }).not.toThrow();

    expect(() => {
      window.ToolVault.tools.importREP('invalid rep format');
    }).not.toThrow();
  });

  test('should support different input formats consistently', () => {
    const pointFeature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };

    const directGeometry = {
      type: 'Point',
      coordinates: [0, 0]
    };

    const featureCollection = {
      type: 'FeatureCollection',
      features: [pointFeature]
    };

    // All tools should handle these different input formats
    const translateResult1 = window.ToolVault.tools.translate(pointFeature, { dx: 1, dy: 1 });
    const translateResult2 = window.ToolVault.tools.translate(directGeometry, { dx: 1, dy: 1 });
    const translateResult3 = window.ToolVault.tools.translate(featureCollection, { dx: 1, dy: 1 });

    expect(translateResult1).toBeDefined();
    expect(translateResult2).toBeDefined();
    expect(translateResult3).toBeDefined();

    // CSV export should handle all formats
    const csvResult1 = window.ToolVault.tools.exportCSV(pointFeature);
    const csvResult2 = window.ToolVault.tools.exportCSV(directGeometry);
    const csvResult3 = window.ToolVault.tools.exportCSV(featureCollection);

    expect(typeof csvResult1).toBe('string');
    expect(typeof csvResult2).toBe('string');
    expect(typeof csvResult3).toBe('string');
  });

  test('should have tools with consistent parameter handling', () => {
    const sampleTrack = {
      type: 'Feature',
      properties: {
        timestamps: [0, 60000, 120000]
      },
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [0.001, 0.001], [0.002, 0.002]]
      }
    };

    // All tools should work with no parameters (use defaults)
    expect(() => window.ToolVault.tools.translate(sampleTrack)).not.toThrow();
    expect(() => window.ToolVault.tools.flipHorizontal(sampleTrack)).not.toThrow();
    expect(() => window.ToolVault.tools.calculateSpeedSeries(sampleTrack)).not.toThrow();
    expect(() => window.ToolVault.tools.calculateAverageSpeed(sampleTrack)).not.toThrow();
    expect(() => window.ToolVault.tools.smoothPolyline(sampleTrack)).not.toThrow();
    expect(() => window.ToolVault.tools.exportCSV(sampleTrack)).not.toThrow();

    // All tools should work with empty parameter object
    expect(() => window.ToolVault.tools.translate(sampleTrack, {})).not.toThrow();
    expect(() => window.ToolVault.tools.calculateSpeedSeries(sampleTrack, {})).not.toThrow();
    expect(() => window.ToolVault.tools.createSpeedHistogram(sampleTrack, {})).not.toThrow();
  });

  test('should preserve tool independence', () => {
    // Modifying one tool's namespace shouldn't affect others
    const originalTranslate = window.ToolVault.tools.translate;
    
    // Temporarily modify translate tool
    window.ToolVault.tools.translate = null;
    
    // Other tools should still work
    expect(typeof window.ToolVault.tools.flipHorizontal).toBe('function');
    expect(typeof window.ToolVault.tools.calculateSpeedSeries).toBe('function');
    expect(typeof window.ToolVault.tools.exportCSV).toBe('function');
    
    // Restore original tool
    window.ToolVault.tools.translate = originalTranslate;
    expect(typeof window.ToolVault.tools.translate).toBe('function');
  });
});