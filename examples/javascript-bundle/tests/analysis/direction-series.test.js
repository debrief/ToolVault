// Load tool
require('../../tools/analysis/direction-series.js');
const { sampleTrackWithTimestamps } = require('../helpers');

// Initialize window object
global.window = global.window || {};

describe('Calculate Direction Series', () => {
  test('should calculate direction series from GPS track', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.calculateDirectionSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('time');
    expect(result[0]).toHaveProperty('direction');
    expect(typeof result[0].direction).toBe('number');
    expect(result[0].direction).toBeGreaterThanOrEqual(0);
    expect(result[0].direction).toBeLessThan(360);
  });

  test('should apply smoothing when requested', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const rawResult = window.ToolVault.tools.calculateDirectionSeries(input, { smoothing: false });
    const smoothedResult = window.ToolVault.tools.calculateDirectionSeries(input, { 
      smoothing: true, 
      window_size: 3 
    });
    
    expect(rawResult.length).toBe(smoothedResult.length);
    expect(smoothedResult[0]).toHaveProperty('time');
    expect(smoothedResult[0]).toHaveProperty('direction');
  });

  test('should handle direct LineString geometry', () => {
    const input = {
      type: 'LineString',
      coordinates: [
        [-0.1276, 51.5074],
        [-0.1278, 51.5076]
      ],
      properties: {
        timestamps: [1642505200000, 1642505260000]
      }
    };
    const result = window.ToolVault.tools.calculateDirectionSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('should use default parameters when none provided', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.calculateDirectionSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('should handle track with insufficient coordinates', () => {
    const input = {
      type: 'Feature',
      properties: { 
        timestamps: [1642505200000]
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-0.1276, 51.5074]
        ]
      }
    };
    const result = window.ToolVault.tools.calculateDirectionSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test('should handle track with no timestamps', () => {
    const input = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-0.1276, 51.5074],
          [-0.1278, 51.5076]
        ]
      }
    };
    const result = window.ToolVault.tools.calculateDirectionSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test('should calculate correct bearings for cardinal directions', () => {
    // North movement
    const northInput = {
      type: 'Feature',
      properties: { 
        timestamps: [1642505200000, 1642505260000]
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [0, 1] // Move north
        ]
      }
    };
    const northResult = window.ToolVault.tools.calculateDirectionSeries(northInput);
    expect(northResult[0].direction).toBeCloseTo(0, 1); // Should be close to 0° (north)

    // East movement
    const eastInput = {
      type: 'Feature',
      properties: { 
        timestamps: [1642505200000, 1642505260000]
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 0] // Move east
        ]
      }
    };
    const eastResult = window.ToolVault.tools.calculateDirectionSeries(eastInput);
    expect(eastResult[0].direction).toBeCloseTo(90, 1); // Should be close to 90° (east)
  });

  test('should handle smoothing with different window sizes', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    
    const smallWindow = window.ToolVault.tools.calculateDirectionSeries(input, { 
      smoothing: true, 
      window_size: 1 
    });
    const largeWindow = window.ToolVault.tools.calculateDirectionSeries(input, { 
      smoothing: true, 
      window_size: 5 
    });
    
    expect(smallWindow.length).toBe(largeWindow.length);
    expect(smallWindow[0]).toHaveProperty('direction');
    expect(largeWindow[0]).toHaveProperty('direction');
  });
});