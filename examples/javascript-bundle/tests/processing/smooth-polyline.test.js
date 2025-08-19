// Load tool
require('../../tools/processing/smooth-polyline.js');
const { sampleLineString } = require('../helpers');

// Initialize window object
global.window = global.window || {};

describe('Smooth Polyline', () => {
  test('should smooth LineString geometry with Gaussian algorithm', () => {
    const input = JSON.parse(JSON.stringify(sampleLineString));
    const result = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'gaussian', 
      window_size: 3 
    });
    
    expect(result).toBeValidGeoJSON();
    expect(result.geometry.type).toBe('LineString');
    expect(result.geometry.coordinates).toHaveLength(input.geometry.coordinates.length);
    
    // Smoothed coordinates should be different from original
    const originalCoords = input.geometry.coordinates;
    const smoothedCoords = result.geometry.coordinates;
    expect(smoothedCoords[1]).not.toEqual(originalCoords[1]);
  });

  test('should smooth LineString geometry with moving average algorithm', () => {
    const input = JSON.parse(JSON.stringify(sampleLineString));
    const result = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'moving_average', 
      window_size: 3 
    });
    
    expect(result).toBeValidGeoJSON();
    expect(result.geometry.type).toBe('LineString');
    expect(result.geometry.coordinates).toHaveLength(input.geometry.coordinates.length);
  });

  test('should handle FeatureCollection input', () => {
    const input = {
      type: 'FeatureCollection',
      features: [
        JSON.parse(JSON.stringify(sampleLineString))
      ]
    };
    const result = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'gaussian', 
      window_size: 3 
    });
    
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.type).toBe('LineString');
  });

  test('should handle direct LineString geometry input', () => {
    const input = {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [1, 1],
        [2, 0],
        [3, 1],
        [4, 0]
      ]
    };
    const result = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'gaussian', 
      window_size: 3 
    });
    
    expect(result.type).toBe('LineString');
    expect(result.coordinates).toHaveLength(5);
  });

  test('should use default parameters when none provided', () => {
    const input = JSON.parse(JSON.stringify(sampleLineString));
    const result = window.ToolVault.tools.smoothPolyline(input);
    
    expect(result).toBeValidGeoJSON();
    expect(result.geometry.type).toBe('LineString');
    // Should default to gaussian with window_size 3
  });

  test('should handle different window sizes', () => {
    const input = JSON.parse(JSON.stringify(sampleLineString));
    
    const small = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'gaussian', 
      window_size: 1 
    });
    const large = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'gaussian', 
      window_size: 5 
    });
    
    expect(small.geometry.coordinates).toHaveLength(input.geometry.coordinates.length);
    expect(large.geometry.coordinates).toHaveLength(input.geometry.coordinates.length);
  });

  test('should handle LineString with insufficient points for smoothing', () => {
    const input = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1]
        ]
      }
    };
    const result = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'gaussian', 
      window_size: 5 
    });
    
    expect(result).toBeValidGeoJSON();
    expect(result.geometry.coordinates).toHaveLength(2);
    // Should return original coordinates when insufficient points
  });

  test('should handle empty LineString', () => {
    const input = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    };
    const result = window.ToolVault.tools.smoothPolyline(input);
    
    expect(result).toBeValidGeoJSON();
    expect(result.geometry.coordinates).toHaveLength(0);
  });

  test('should handle single point LineString', () => {
    const input = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0]]
      }
    };
    const result = window.ToolVault.tools.smoothPolyline(input);
    
    expect(result).toBeValidGeoJSON();
    expect(result.geometry.coordinates).toHaveLength(1);
    expect(result.geometry.coordinates[0]).toEqual([0, 0]);
  });

  test('should preserve properties when smoothing Feature', () => {
    const input = {
      type: 'Feature',
      properties: {
        name: 'Test Track',
        color: 'red'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
          [2, 0],
          [3, 1]
        ]
      }
    };
    const result = window.ToolVault.tools.smoothPolyline(input);
    
    expect(result.properties).toEqual(input.properties);
  });

  test('should handle invalid algorithm gracefully', () => {
    const input = JSON.parse(JSON.stringify(sampleLineString));
    const result = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'invalid_algorithm', 
      window_size: 3 
    });
    
    expect(result).toBeValidGeoJSON();
    // Should default to gaussian when invalid algorithm provided
    expect(result.geometry.coordinates).toHaveLength(input.geometry.coordinates.length);
  });

  test('should handle non-LineString geometries by returning them unchanged', () => {
    const input = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.smoothPolyline(input);
    
    expect(result).toEqual(input);
  });

  test('should produce different results for different algorithms', () => {
    const input = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 2],
          [2, 0],
          [3, 2],
          [4, 0]
        ]
      }
    };
    
    const gaussianResult = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'gaussian', 
      window_size: 3 
    });
    const movingAvgResult = window.ToolVault.tools.smoothPolyline(input, { 
      algorithm: 'moving_average', 
      window_size: 3 
    });
    
    // The middle coordinates should be different between algorithms
    expect(gaussianResult.geometry.coordinates[2]).not.toEqual(movingAvgResult.geometry.coordinates[2]);
  });
});