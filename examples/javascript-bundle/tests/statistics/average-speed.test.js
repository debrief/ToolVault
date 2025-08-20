// Load tool
require('../../tools/statistics/average-speed.js');
const { sampleTrackWithTimestamps } = require('../helpers');

// Initialize window object
global.window = global.window || {};

describe('Calculate Average Speed', () => {
  test('should calculate average speed from GPS track', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.calculateAverageSpeed(input, { time_unit: 'seconds' });
    
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  test('should handle different time units', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    
    const secondsResult = window.ToolVault.tools.calculateAverageSpeed(input, { time_unit: 'seconds' });
    const minutesResult = window.ToolVault.tools.calculateAverageSpeed(input, { time_unit: 'minutes' });
    const hoursResult = window.ToolVault.tools.calculateAverageSpeed(input, { time_unit: 'hours' });
    
    expect(secondsResult).toBeGreaterThan(minutesResult);
    expect(minutesResult).toBeGreaterThan(hoursResult);
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
    const result = window.ToolVault.tools.calculateAverageSpeed(input);
    
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  test('should use default parameters when none provided', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.calculateAverageSpeed(input);
    
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  test('should handle track with timestamps in properties', () => {
    const input = {
      type: 'Feature',
      properties: { 
        name: 'Test Track',
        timestamps: [
          1642505200000,
          1642505260000,
          1642505320000
        ]
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
    const result = window.ToolVault.tools.calculateAverageSpeed(input);
    
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  test('should handle track with insufficient points', () => {
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
    const result = window.ToolVault.tools.calculateAverageSpeed(input);
    
    expect(result).toBe(0);
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
    const result = window.ToolVault.tools.calculateAverageSpeed(input);
    
    expect(result).toBe(0);
  });

  test('should handle invalid time_unit', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.calculateAverageSpeed(input, { time_unit: 'invalid' });
    
    expect(typeof result).toBe('number');
    // Should default to seconds
    expect(result).toBeGreaterThan(0);
  });

  test('should handle zero time intervals', () => {
    const input = {
      type: 'Feature',
      properties: { 
        timestamps: [1642505200000, 1642505200000] // Same timestamp
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-0.1276, 51.5074],
          [-0.1278, 51.5076]
        ]
      }
    };
    const result = window.ToolVault.tools.calculateAverageSpeed(input);
    
    expect(result).toBe(0);
  });

  test('should calculate realistic speeds', () => {
    // Create a track with known distance and time
    const input = {
      type: 'Feature',
      properties: { 
        timestamps: [0, 1000] // 1 second apart
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [0, 0.009] // Approximately 1km north
        ]
      }
    };
    const result = window.ToolVault.tools.calculateAverageSpeed(input, { time_unit: 'seconds' });
    
    // Should be roughly 1000 m/s (very fast, but mathematically correct)
    expect(result).toBeGreaterThan(900);
    expect(result).toBeLessThan(1100);
  });
});