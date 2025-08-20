// Load tool
require('../../tools/analysis/speed-series.js');
const { sampleTrackWithTimestamps } = require('../helpers');

// Initialize window object
global.window = global.window || {};

describe('Calculate Speed Series', () => {
  test('should calculate speed series from GPS track', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const params = { time_unit: 'seconds' };
    const result = window.ToolVault.tools.calculateSpeedSeries(input, params);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('time');
    expect(result[0]).toHaveProperty('speed');
    expect(typeof result[0].speed).toBe('number');
    expect(result[0].speed).toBeGreaterThan(0);
  });

  test('should handle different time units', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    
    const secondsResult = window.ToolVault.tools.calculateSpeedSeries(input, { time_unit: 'seconds' });
    const minutesResult = window.ToolVault.tools.calculateSpeedSeries(input, { time_unit: 'minutes' });
    const hoursResult = window.ToolVault.tools.calculateSpeedSeries(input, { time_unit: 'hours' });
    
    expect(secondsResult[0].speed).toBeGreaterThan(minutesResult[0].speed);
    expect(minutesResult[0].speed).toBeGreaterThan(hoursResult[0].speed);
  });

  test('should handle direct LineString geometry', () => {
    const input = {
      type: 'LineString',
      coordinates: [
        [-0.1276, 51.5074],
        [-0.1278, 51.5076]
      ],
      properties: {
        timestamps: [1642505200000, 1642505260000] // 60 second interval
      }
    };
    const result = window.ToolVault.tools.calculateSpeedSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('should use default parameters when none provided', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.calculateSpeedSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(typeof result[0].speed).toBe('number');
  });

  test('should handle track with insufficient timestamps', () => {
    const input = {
      type: 'Feature',
      properties: { 
        timestamps: [1642505200000] // Only one timestamp
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-0.1276, 51.5074],
          [-0.1278, 51.5076]
        ]
      }
    };
    const result = window.ToolVault.tools.calculateSpeedSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0); // No speed calculations possible
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
    const result = window.ToolVault.tools.calculateSpeedSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test('should skip zero time intervals', () => {
    const input = {
      type: 'Feature',
      properties: { 
        timestamps: [1642505200000, 1642505200000, 1642505260000] // Same timestamp twice
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-0.1276, 51.5074],
          [-0.1278, 51.5076],
          [-0.1280, 51.5078]
        ]
      }
    };
    const result = window.ToolVault.tools.calculateSpeedSeries(input);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1); // Only one valid speed calculation
  });
});