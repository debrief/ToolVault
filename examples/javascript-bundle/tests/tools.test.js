// Load all tool files
require('../tools/transform/translate.js');
require('../tools/transform/flip-horizontal.js');
require('../tools/transform/flip-vertical.js');
require('../tools/analysis/speed-series.js');
require('../tools/analysis/direction-series.js');
require('../tools/statistics/average-speed.js');
require('../tools/statistics/speed-histogram.js');
require('../tools/processing/smooth-polyline.js');
require('../tools/io/import-rep.js');
require('../tools/io/export-rep.js');
require('../tools/io/export-csv.js');

const {
  samplePoint,
  sampleLineString,
  sampleTrackWithTimestamps,
  sampleFeatureCollection
} = require('./helpers');

// Initialize window object for browser environment simulation
global.window = global.window || {};

describe('Transform Tools', () => {
  describe('translateFeatures', () => {
    test('should translate features by specified distance and direction', () => {
      const input = JSON.parse(JSON.stringify(samplePoint));
      const params = { direction: 0, distance: 100 };
      const result = window.ToolVault.tools.translateFeatures(input, params);
      
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('Point');
      // Check that coordinates have changed
      expect(result.geometry.coordinates[1]).toBeGreaterThan(input.geometry.coordinates[1]);
    });

    test('should handle FeatureCollection', () => {
      const input = JSON.parse(JSON.stringify(sampleFeatureCollection));
      const params = { direction: 90, distance: 100 };
      const result = window.ToolVault.tools.translateFeatures(input, params);
      
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(2);
    });
  });

  describe('flipHorizontal', () => {
    test('should flip features horizontally', () => {
      const input = JSON.parse(JSON.stringify(sampleLineString));
      const params = { axis: 'longitude' };
      const result = window.ToolVault.tools.flipHorizontal(input, params);
      
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('LineString');
      // First and last coordinates should be swapped in longitude
      const origFirst = input.geometry.coordinates[0][0];
      const origLast = input.geometry.coordinates[2][0];
      const center = (origFirst + origLast + input.geometry.coordinates[1][0]) / 3;
      expect(Math.abs(result.geometry.coordinates[0][0] - (2 * center - origFirst))).toBeLessThan(0.0001);
    });
  });

  describe('flipVertical', () => {
    test('should flip features vertically', () => {
      const input = JSON.parse(JSON.stringify(sampleLineString));
      const params = { axis: 'latitude' };
      const result = window.ToolVault.tools.flipVertical(input, params);
      
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('LineString');
    });
  });
});

describe('Analysis Tools', () => {
  describe('calculateSpeedSeries', () => {
    test('should calculate speed series from GPS track', () => {
      const input = sampleTrackWithTimestamps;
      const params = { time_unit: 'seconds' };
      const result = window.ToolVault.tools.calculateSpeedSeries(input, params);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2); // One less than number of points
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('speed');
      expect(typeof result[0].speed).toBe('number');
    });

    test('should handle different time units', () => {
      const input = sampleTrackWithTimestamps;
      const resultSeconds = window.ToolVault.tools.calculateSpeedSeries(input, { time_unit: 'seconds' });
      const resultMinutes = window.ToolVault.tools.calculateSpeedSeries(input, { time_unit: 'minutes' });
      
      expect(resultMinutes[0].speed).toBeCloseTo(resultSeconds[0].speed * 60, 2);
    });
  });

  describe('calculateDirectionSeries', () => {
    test('should calculate direction series from GPS track', () => {
      const input = sampleTrackWithTimestamps;
      const params = { smoothing: false };
      const result = window.ToolVault.tools.calculateDirectionSeries(input, params);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('direction');
      expect(result[0].direction).toBeGreaterThanOrEqual(0);
      expect(result[0].direction).toBeLessThanOrEqual(360);
    });

    test('should apply smoothing when requested', () => {
      const input = sampleTrackWithTimestamps;
      const resultNoSmooth = window.ToolVault.tools.calculateDirectionSeries(input, { smoothing: false });
      const resultSmooth = window.ToolVault.tools.calculateDirectionSeries(input, { smoothing: true, window_size: 3 });
      
      expect(resultSmooth.length).toBe(resultNoSmooth.length);
    });
  });
});

describe('Statistics Tools', () => {
  describe('calculateAverageSpeed', () => {
    test('should calculate average speed from GPS track', () => {
      const input = sampleTrackWithTimestamps;
      const params = { time_unit: 'seconds' };
      const result = window.ToolVault.tools.calculateAverageSpeed(input, params);
      
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('createSpeedHistogram', () => {
    test('should create speed histogram from GPS track', () => {
      const input = sampleTrackWithTimestamps;
      const params = { interval_minutes: 1, bins: 10 };
      const result = window.ToolVault.tools.createSpeedHistogram(input, params);
      
      expect(result).toHaveProperty('bins');
      expect(result).toHaveProperty('counts');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('max');
      expect(Array.isArray(result.bins)).toBe(true);
      expect(Array.isArray(result.counts)).toBe(true);
    });
  });
});

describe('Processing Tools', () => {
  describe('smoothPolyline', () => {
    test('should smooth polyline with moving average', () => {
      const input = sampleLineString;
      const params = { algorithm: 'moving_average', window_size: 3 };
      const result = window.ToolVault.tools.smoothPolyline(input, params);
      
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('LineString');
      expect(result.geometry.coordinates).toHaveLength(input.geometry.coordinates.length);
    });

    test('should smooth polyline with gaussian', () => {
      const input = sampleLineString;
      const params = { algorithm: 'gaussian', window_size: 3 };
      const result = window.ToolVault.tools.smoothPolyline(input, params);
      
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('LineString');
      expect(result.geometry.coordinates).toHaveLength(input.geometry.coordinates.length);
    });
  });
});

describe('I/O Tools', () => {
  describe('importREP', () => {
    test('should import REP format to GeoJSON', () => {
      const repContent = `# Test REP file
51.5074,-0.1276,0,2024-01-18T10:00:00Z
51.5076,-0.1278,0,2024-01-18T10:00:05Z
51.5078,-0.1280,0,2024-01-18T10:00:10Z`;
      
      const result = window.ToolVault.tools.importREP(repContent, {});
      
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
      expect(result.features[0].geometry.type).toBe('LineString');
      expect(result.features[0].geometry.coordinates).toHaveLength(3);
    });

    test('should handle single point', () => {
      const repContent = '51.5074,-0.1276,0,2024-01-18T10:00:00Z';
      const result = window.ToolVault.tools.importREP(repContent, {});
      
      expect(result.features[0].geometry.type).toBe('Point');
    });
  });

  describe('exportREP', () => {
    test('should export GeoJSON to REP format', () => {
      const input = sampleLineString;
      const params = { precision: 4 };
      const result = window.ToolVault.tools.exportREP(input, params);
      
      expect(typeof result).toBe('string');
      expect(result).toContain('51.5074');
      expect(result).toContain('-0.1276');
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(3); // Headers + coordinates
    });

    test('should export FeatureCollection', () => {
      const input = sampleFeatureCollection;
      const result = window.ToolVault.tools.exportREP(input, { precision: 6 });
      
      expect(typeof result).toBe('string');
      expect(result).toContain('REP Format Export');
    });
  });

  describe('exportCSV', () => {
    test('should export GeoJSON to CSV with separate coordinates', () => {
      const input = sampleLineString;
      const params = { include_properties: true, coordinate_format: 'separate' };
      const result = window.ToolVault.tools.exportCSV(input, params);
      
      expect(typeof result).toBe('string');
      const lines = result.split('\n');
      expect(lines[0]).toContain('longitude');
      expect(lines[0]).toContain('latitude');
      expect(lines.length).toBe(4); // Header + 3 coordinates
    });

    test('should export to WKT format', () => {
      const input = sampleLineString;
      const params = { include_properties: false, coordinate_format: 'wkt' };
      const result = window.ToolVault.tools.exportCSV(input, params);
      
      expect(result).toContain('LINESTRING');
      const lines = result.split('\n');
      expect(lines.length).toBe(2); // Header + 1 WKT row
    });

    test('should handle FeatureCollection', () => {
      const input = sampleFeatureCollection;
      const result = window.ToolVault.tools.exportCSV(input, { coordinate_format: 'wkt' });
      
      expect(result).toContain('POINT');
      expect(result).toContain('LINESTRING');
    });
  });
});