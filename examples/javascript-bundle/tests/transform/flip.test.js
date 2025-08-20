// Load tools
require('../../tools/transform/flip-horizontal.js');
require('../../tools/transform/flip-vertical.js');
const { samplePoint, sampleFeatureCollection, sampleLineString } = require('../helpers');

// Initialize window object
global.window = global.window || {};

describe('Flip Features', () => {
  describe('Flip Horizontal', () => {
    test('should flip Point feature horizontally around longitude center', () => {
      const input = JSON.parse(JSON.stringify(samplePoint));
      const originalLon = input.geometry.coordinates[0];
      const result = window.ToolVault.tools.flipHorizontal(input, { axis: 'longitude' });
      
      expect(result).toBeValidGeoJSON();
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('Point');
      
      // Longitude should change, latitude should remain same
      expect(result.geometry.coordinates[0]).not.toBe(originalLon);
      expect(result.geometry.coordinates[1]).toBe(input.geometry.coordinates[1]);
    });

    test('should flip FeatureCollection horizontally', () => {
      const input = JSON.parse(JSON.stringify(sampleFeatureCollection));
      const result = window.ToolVault.tools.flipHorizontal(input, { axis: 'longitude' });
      
      expect(result).toBeValidGeoJSON();
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(2);
      
      // Should maintain same structure
      expect(result.features[0].geometry.type).toBe('Point');
      expect(result.features[1].geometry.type).toBe('LineString');
    });

    test('should handle latitude axis flipping', () => {
      const input = JSON.parse(JSON.stringify(samplePoint));
      const originalLat = input.geometry.coordinates[1];
      const result = window.ToolVault.tools.flipHorizontal(input, { axis: 'latitude' });
      
      expect(result).toBeValidGeoJSON();
      // Latitude should change, longitude should remain same
      expect(result.geometry.coordinates[1]).not.toBe(originalLat);
      expect(result.geometry.coordinates[0]).toBe(input.geometry.coordinates[0]);
    });

    test('should handle LineString geometry', () => {
      const input = JSON.parse(JSON.stringify(sampleLineString));
      const result = window.ToolVault.tools.flipHorizontal(input, { axis: 'longitude' });
      
      expect(result).toBeValidGeoJSON();
      expect(result.geometry.type).toBe('LineString');
      expect(result.geometry.coordinates).toHaveLength(3);
      
      // Coordinates should be flipped (though some may remain the same if they were at center)
      const originalLongitudes = input.geometry.coordinates.map(c => c[0]);
      const flippedLongitudes = result.geometry.coordinates.map(c => c[0]);
      
      // At least one coordinate should be different (unless all were at exact center)
      const hasDifferentCoord = flippedLongitudes.some((lon, index) => lon !== originalLongitudes[index]);
      expect(hasDifferentCoord || originalLongitudes.every(lon => lon === originalLongitudes[0])).toBe(true);
      
      // Latitudes should remain unchanged
      result.geometry.coordinates.forEach((coord, index) => {
        expect(coord[1]).toBe(input.geometry.coordinates[index][1]);
      });
    });

    test('should use default axis when none provided', () => {
      const input = JSON.parse(JSON.stringify(samplePoint));
      const result = window.ToolVault.tools.flipHorizontal(input);
      
      expect(result).toBeValidGeoJSON();
      // Should default to longitude axis
      expect(result.geometry.coordinates[0]).not.toBe(input.geometry.coordinates[0]);
    });

    test('should handle direct geometry input', () => {
      const input = {
        type: 'Point',
        coordinates: [1, 2]
      };
      const result = window.ToolVault.tools.flipHorizontal(input);
      
      expect(result.type).toBe('Point');
      expect(result.coordinates[0]).toBe(-1); // Flipped around center (0)
      expect(result.coordinates[1]).toBe(2);
    });
  });

  describe('Flip Vertical', () => {
    test('should flip Point feature vertically', () => {
      const input = JSON.parse(JSON.stringify(samplePoint));
      const originalLat = input.geometry.coordinates[1];
      const result = window.ToolVault.tools.flipVertical(input);
      
      expect(result).toBeValidGeoJSON();
      // Should flip latitude, preserve longitude
      expect(result.geometry.coordinates[1]).not.toBe(originalLat);
      expect(result.geometry.coordinates[0]).toBe(input.geometry.coordinates[0]);
    });

    test('should handle FeatureCollection', () => {
      const input = JSON.parse(JSON.stringify(sampleFeatureCollection));
      const result = window.ToolVault.tools.flipVertical(input);
      
      expect(result).toBeValidGeoJSON();
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(2);
    });
  });
});