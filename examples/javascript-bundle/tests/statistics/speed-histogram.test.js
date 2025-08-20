// Load tools - histogram depends on speed-series
require('../../tools/analysis/speed-series.js');
require('../../tools/statistics/speed-histogram.js');
const { sampleTrackWithTimestamps } = require('../helpers');

// Initialize window object
global.window = global.window || {};

describe('Create Speed Histogram', () => {
  test('should create speed histogram from GPS track', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.createSpeedHistogram(input, { bins: 5 });
    
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('bins');
    expect(result).toHaveProperty('counts');
    expect(result).toHaveProperty('min');
    expect(result).toHaveProperty('max');
    expect(result).toHaveProperty('total');
    
    expect(Array.isArray(result.bins)).toBe(true);
    expect(Array.isArray(result.counts)).toBe(true);
    expect(result.bins.length).toBe(5);
    expect(result.counts.length).toBe(5);
  });

  test('should handle different bin counts', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    
    const result5 = window.ToolVault.tools.createSpeedHistogram(input, { bins: 5 });
    const result10 = window.ToolVault.tools.createSpeedHistogram(input, { bins: 10 });
    
    expect(result5.bins.length).toBe(5);
    expect(result10.bins.length).toBe(10);
  });

  test('should use default parameters when none provided', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.createSpeedHistogram(input);
    
    expect(result.bins.length).toBe(10); // Default bins
    expect(result.counts.length).toBe(10);
  });

  test('should handle different time units', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    
    const secondsResult = window.ToolVault.tools.createSpeedHistogram(input, { 
      bins: 5, 
      time_unit: 'seconds' 
    });
    const minutesResult = window.ToolVault.tools.createSpeedHistogram(input, { 
      bins: 5, 
      time_unit: 'minutes' 
    });
    
    // Minutes should have smaller speeds than seconds
    expect(minutesResult.max).toBeLessThan(secondsResult.max);
  });

  test('should handle track with no movement', () => {
    const input = {
      type: 'Feature',
      properties: { 
        timestamps: [1642505200000, 1642505260000]
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [0, 0] // Same coordinates
        ]
      }
    };
    const result = window.ToolVault.tools.createSpeedHistogram(input);
    
    expect(result.min).toBe(0);
    expect(result.max).toBe(0);
    expect(result.total).toBe(1);
  });

  test('should handle empty track', () => {
    const input = {
      type: 'Feature',
      properties: { 
        timestamps: []
      },
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    };
    const result = window.ToolVault.tools.createSpeedHistogram(input);
    
    expect(result.bins.length).toBe(0);
    expect(result.counts.length).toBe(0);
    expect(result.total).toBe(0);
  });

  test('should throw error when speed-series tool not available', () => {
    // Temporarily remove the speed series tool
    const originalTool = window.ToolVault.tools.calculateSpeedSeries;
    delete window.ToolVault.tools.calculateSpeedSeries;
    
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    
    expect(() => {
      window.ToolVault.tools.createSpeedHistogram(input);
    }).toThrow('Speed series tool not available');
    
    // Restore the tool
    window.ToolVault.tools.calculateSpeedSeries = originalTool;
  });

  test('should have correct bin structure', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.createSpeedHistogram(input, { bins: 3 });
    
    result.bins.forEach(bin => {
      expect(bin).toHaveProperty('min');
      expect(bin).toHaveProperty('max');
      expect(bin).toHaveProperty('center');
      expect(typeof bin.min).toBe('number');
      expect(typeof bin.max).toBe('number');
      expect(typeof bin.center).toBe('number');
      expect(bin.max).toBeGreaterThanOrEqual(bin.min);
      expect(bin.center).toBeGreaterThanOrEqual(bin.min);
      expect(bin.center).toBeLessThanOrEqual(bin.max);
    });
  });

  test('should have counts that sum to total', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.createSpeedHistogram(input, { bins: 5 });
    
    const countsSum = result.counts.reduce((sum, count) => sum + count, 0);
    expect(countsSum).toBe(result.total);
  });

  test('should handle single bin', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.createSpeedHistogram(input, { bins: 1 });
    
    expect(result.bins.length).toBe(1);
    expect(result.counts.length).toBe(1);
    expect(result.counts[0]).toBe(result.total);
  });
});