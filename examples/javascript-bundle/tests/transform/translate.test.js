// Load tool
require('../../tools/transform/translate.js');
const { samplePoint, sampleFeatureCollection, sampleLineString } = require('../helpers');

// Initialize window object
global.window = global.window || {};

describe('Translate Features', () => {
  test('should translate Point feature by specified distance and direction', () => {
    const input = JSON.parse(JSON.stringify(samplePoint));
    const params = { distance: 1000, direction: 90, units: 'meters' }; // 1km east
    const result = window.ToolVault.tools.translate(input, params);
    
    expect(result).toBeValidGeoJSON();
    expect(result.type).toBe('Feature');
    expect(result.geometry.type).toBe('Point');
    
    // Should move east (increase longitude)
    expect(result.geometry.coordinates[0]).toBeGreaterThan(input.geometry.coordinates[0]);
    expect(result.geometry.coordinates[1]).toBeCloseTo(input.geometry.coordinates[1], 5);
  });

  test('should translate FeatureCollection', () => {
    const input = JSON.parse(JSON.stringify(sampleFeatureCollection));
    const params = { distance: 500, direction: 180, units: 'meters' }; // 500m south
    const result = window.ToolVault.tools.translate(input, params);
    
    expect(result).toBeValidGeoJSON();
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(2);
    
    // All features should move south (decrease latitude)
    result.features.forEach((feature, index) => {
      const originalFeature = input.features[index];
      if (feature.geometry.type === 'Point') {
        expect(feature.geometry.coordinates[1]).toBeLessThan(originalFeature.geometry.coordinates[1]);
      } else if (feature.geometry.type === 'LineString') {
        feature.geometry.coordinates.forEach((coord, coordIndex) => {
          expect(coord[1]).toBeLessThan(originalFeature.geometry.coordinates[coordIndex][1]);
        });
      }
    });
  });

  test('should handle kilometers unit conversion', () => {
    const input = JSON.parse(JSON.stringify(samplePoint));
    const params = { distance: 1, direction: 0, units: 'kilometers' }; // 1km north
    const result = window.ToolVault.tools.translate(input, params);
    
    expect(result).toBeValidGeoJSON();
    // Should move north (increase latitude)
    expect(result.geometry.coordinates[1]).toBeGreaterThan(input.geometry.coordinates[1]);
    expect(result.geometry.coordinates[0]).toBeCloseTo(input.geometry.coordinates[0], 5);
  });

  test('should handle direct geometry input', () => {
    const input = {
      type: 'Point',
      coordinates: [0, 0]
    };
    const params = { distance: 1000, direction: 45, units: 'meters' }; // NE
    const result = window.ToolVault.tools.translate(input, params);
    
    expect(result.type).toBe('Point');
    expect(result.coordinates[0]).toBeGreaterThan(0); // East
    expect(result.coordinates[1]).toBeGreaterThan(0); // North
  });

  test('should use default parameters when none provided', () => {
    const input = JSON.parse(JSON.stringify(samplePoint));
    const result = window.ToolVault.tools.translate(input);
    
    // With distance=0, coordinates should remain the same
    expect(result.geometry.coordinates).toEqual(input.geometry.coordinates);
  });

  test('should handle LineString geometry', () => {
    const input = JSON.parse(JSON.stringify(sampleLineString));
    const params = { distance: 100, direction: 270, units: 'meters' }; // 100m west
    const result = window.ToolVault.tools.translate(input, params);
    
    expect(result).toBeValidGeoJSON();
    expect(result.geometry.type).toBe('LineString');
    
    // All coordinates should move west (decrease longitude)
    result.geometry.coordinates.forEach((coord, index) => {
      expect(coord[0]).toBeLessThan(input.geometry.coordinates[index][0]);
      expect(coord[1]).toBeCloseTo(input.geometry.coordinates[index][1], 5);
    });
  });
});