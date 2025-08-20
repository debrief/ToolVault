// Load tool
require('../../tools/io/export-csv.js');
const { samplePoint, sampleLineString, sampleTrackWithTimestamps } = require('../helpers');

// Initialize window object
global.window = global.window || {};

describe('Export to CSV', () => {
  test('should export Point feature to CSV format', () => {
    const input = JSON.parse(JSON.stringify(samplePoint));
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('longitude,latitude');
    expect(result).toContain('-0.1276,51.5074');
  });

  test('should export LineString feature to CSV format', () => {
    const input = JSON.parse(JSON.stringify(sampleLineString));
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('longitude,latitude');
    
    // Should contain multiple rows for LineString coordinates
    const lines = result.split('\n').filter(line => line.trim());
    expect(lines.length).toBeGreaterThan(1); // Header + data rows
    expect(lines[0]).toBe('longitude,latitude,timestamp');
  });

  test('should include timestamps when available', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('longitude,latitude,timestamp');
    
    // Should contain timestamp values
    expect(result).toContain('1642505200000');
    expect(result).toContain('1642505205000');
    expect(result).toContain('1642505210000');
  });

  test('should handle FeatureCollection input', () => {
    const input = {
      type: 'FeatureCollection',
      features: [
        JSON.parse(JSON.stringify(samplePoint)),
        JSON.parse(JSON.stringify(sampleLineString))
      ]
    };
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('longitude,latitude');
    
    // Should contain data from multiple features
    const lines = result.split('\n').filter(line => line.trim());
    expect(lines.length).toBeGreaterThan(4); // Header + multiple data rows
  });

  test('should handle direct geometry input', () => {
    const input = {
      type: 'Point',
      coordinates: [-1, 52]
    };
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('longitude,latitude');
    expect(result).toContain('-1,52');
  });

  test('should include properties when include_properties is true', () => {
    const input = {
      type: 'Feature',
      properties: {
        name: 'Test Point',
        speed: 10.5,
        heading: 45
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportCSV(input, { include_properties: true });
    
    expect(result).toContain('longitude,latitude,name,speed,heading');
    expect(result).toContain('0,0,Test Point,10.5,45');
  });

  test('should exclude properties when include_properties is false', () => {
    const input = {
      type: 'Feature',
      properties: {
        name: 'Test Point',
        speed: 10.5
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportCSV(input, { include_properties: false });
    
    expect(result).toContain('longitude,latitude');
    expect(result).not.toContain('name');
    expect(result).not.toContain('speed');
    expect(result).toContain('0,0');
  });

  test('should use default parameters when none provided', () => {
    const input = JSON.parse(JSON.stringify(samplePoint));
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('longitude,latitude');
  });

  test('should handle custom separator', () => {
    const input = JSON.parse(JSON.stringify(samplePoint));
    const result = window.ToolVault.tools.exportCSV(input, { separator: ';' });
    
    expect(result).toContain('longitude;latitude');
    expect(result).toContain('-0.1276;51.5074');
  });

  test('should handle empty FeatureCollection', () => {
    const input = {
      type: 'FeatureCollection',
      features: []
    };
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(typeof result).toBe('string');
    expect(result).toBe('longitude,latitude\n');
  });

  test('should handle LineString with timestamps', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1000, 2000, 3000]
      },
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1], [2, 2]]
      }
    };
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(result).toContain('longitude,latitude,timestamp');
    expect(result).toContain('0,0,1000');
    expect(result).toContain('1,1,2000');
    expect(result).toContain('2,2,3000');
  });

  test('should handle mismatched timestamps and coordinates', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1000, 2000] // Only 2 timestamps
      },
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1], [2, 2]] // 3 coordinates
      }
    };
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(result).toContain('longitude,latitude,timestamp');
    expect(result).toContain('0,0,1000');
    expect(result).toContain('1,1,2000');
    expect(result).toContain('2,2,'); // No timestamp for third coordinate
  });

  test('should handle Polygon geometry', () => {
    const input = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    };
    const result = window.ToolVault.tools.exportCSV(input);
    
    expect(result).toContain('longitude,latitude');
    const lines = result.split('\n').filter(line => line.trim());
    expect(lines.length).toBe(6); // Header + 5 coordinates
  });

  test('should escape CSV special characters in properties', () => {
    const input = {
      type: 'Feature',
      properties: {
        name: 'Point, with comma',
        description: 'Has "quotes" in it'
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportCSV(input, { include_properties: true });
    
    expect(result).toContain('"Point, with comma"');
    expect(result).toContain('"Has ""quotes"" in it"');
  });

  test('should handle null and undefined property values', () => {
    const input = {
      type: 'Feature',
      properties: {
        name: null,
        speed: undefined,
        heading: 0
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportCSV(input, { include_properties: true });
    
    expect(result).toContain('longitude,latitude,name,speed,heading');
    expect(result).toContain('0,0,,,0');
  });
});