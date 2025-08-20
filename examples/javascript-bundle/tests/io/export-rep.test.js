// Load tool
require('../../tools/io/export-rep.js');
const { samplePoint, sampleLineString, sampleTrackWithTimestamps } = require('../helpers');

// Initialize window object
global.window = global.window || {};

describe('Export to REP Format', () => {
  test('should export Point feature to REP format', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1642505200000],
        vessel_name: 'TEST_VESSEL'
      },
      geometry: {
        type: 'Point',
        coordinates: [-0.1276, 51.5074]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('TEST_VESSEL');
    expect(result).toContain('220118'); // Date: 18 Jan 2022
    expect(result).toContain('112640.000'); // Time: 11:26:40.000
    
    // Should contain DMS coordinates
    expect(result).toMatch(/\d+ \d+ [\d.]+ [NSEW]/); // DMS format
  });

  test('should export LineString feature to REP format', () => {
    const input = JSON.parse(JSON.stringify(sampleTrackWithTimestamps));
    input.properties.vessel_name = 'TRACK_VESSEL';
    
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('TRACK_VESSEL');
    
    // Should have multiple lines for LineString coordinates
    const lines = result.split('\n').filter(line => line.trim());
    expect(lines.length).toBeGreaterThan(1);
    
    // Each line should follow REP format
    lines.forEach(line => {
      if (line.trim()) {
        expect(line).toMatch(/^\d{6} \d{6}\.\d{3} .+ @ \d+ \d+ [\d.]+ [NS] \d+ \d+ [\d.]+ [EW] \d+ \d+ \d+$/);
      }
    });
  });

  test('should handle FeatureCollection input', () => {
    const input = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            timestamps: [1642505200000],
            vessel_name: 'VESSEL_1'
          },
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          }
        },
        {
          type: 'Feature',
          properties: {
            timestamps: [1642505260000],
            vessel_name: 'VESSEL_2'
          },
          geometry: {
            type: 'Point',
            coordinates: [1, 1]
          }
        }
      ]
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toContain('VESSEL_1');
    expect(result).toContain('VESSEL_2');
    
    const lines = result.split('\n').filter(line => line.trim());
    expect(lines.length).toBe(2);
  });

  test('should handle direct geometry input', () => {
    const input = {
      type: 'Point',
      coordinates: [0, 0],
      properties: {
        timestamps: [1642505200000]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('UNKNOWN'); // Default vessel name
    expect(result).toContain('700101'); // Default date when no timestamp provided
  });

  test('should use default vessel name when not provided', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1642505200000]
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toContain('UNKNOWN');
  });

  test('should handle timestamps in different formats', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: ['2022-01-18T12:00:00.000Z'],
        vessel_name: 'TEST_VESSEL'
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toContain('220118');
    expect(result).toContain('120000.000');
  });

  test('should handle negative coordinates correctly', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1642505200000],
        vessel_name: 'SOUTH_WEST'
      },
      geometry: {
        type: 'Point',
        coordinates: [-1.5, -2.5] // West longitude, South latitude
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toContain('S'); // South hemisphere
    expect(result).toContain('W'); // West hemisphere
    
    // Should contain positive DMS values (hemisphere indicator handles sign)
    expect(result).toMatch(/\d+ \d+ [\d.]+ S/);
    expect(result).toMatch(/\d+ \d+ [\d.]+ W/);
  });

  test('should include heading, speed, and depth when provided', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1642505200000],
        vessel_name: 'VESSEL_WITH_DATA',
        heading: [45],
        speed: [10.5],
        depth: [100]
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toContain('45'); // Heading
    expect(result).toContain('10.5'); // Speed
    expect(result).toContain('100'); // Depth
  });

  test('should use default values for missing heading, speed, depth', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1642505200000],
        vessel_name: 'MINIMAL_VESSEL'
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toMatch(/0 0 0$/); // Default heading, speed, depth
  });

  test('should handle empty timestamps gracefully', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [],
        vessel_name: 'NO_TIME_VESSEL'
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toBe(''); // No output for no timestamps
  });

  test('should handle coordinates without timestamps', () => {
    const input = {
      type: 'Feature',
      properties: {
        vessel_name: 'NO_TIMESTAMPS'
      },
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1]]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toBe(''); // No output without timestamps
  });

  test('should convert DMS coordinates correctly', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1642505200000],
        vessel_name: 'DMS_TEST'
      },
      geometry: {
        type: 'Point',
        coordinates: [1.5, 2.5] // 1°30'0" E, 2°30'0" N
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toContain('2 30 0 N'); // Latitude: 2°30'0" N
    expect(result).toContain('1 30 0 E'); // Longitude: 1°30'0" E
  });

  test('should handle Polygon geometry', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1000, 2000, 3000, 4000, 5000],
        vessel_name: 'POLYGON_VESSEL'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    const lines = result.split('\n').filter(line => line.trim());
    expect(lines.length).toBe(5); // 5 coordinates with timestamps
    
    lines.forEach(line => {
      expect(line).toContain('POLYGON_VESSEL');
    });
  });

  test('should handle mismatched timestamps and coordinates', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1000, 2000], // Only 2 timestamps
        vessel_name: 'MISMATCH_VESSEL'
      },
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1], [2, 2]] // 3 coordinates
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    const lines = result.split('\n').filter(line => line.trim());
    expect(lines.length).toBe(2); // Only 2 lines for 2 timestamps
  });

  test('should format vessel names with special characters', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1642505200000],
        vessel_name: 'VESSEL-WITH_SPECIAL.CHARS'
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(result).toContain('VESSEL-WITH_SPECIAL.CHARS');
  });

  test('should handle very precise coordinates', () => {
    const input = {
      type: 'Feature',
      properties: {
        timestamps: [1642505200000],
        vessel_name: 'PRECISE_VESSEL'
      },
      geometry: {
        type: 'Point',
        coordinates: [1.123456789, 2.987654321]
      }
    };
    const result = window.ToolVault.tools.exportREP(input);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('PRECISE_VESSEL');
    // Should handle precision in DMS conversion
    expect(result).toMatch(/\d+ \d+ [\d.]+ [NS]/);
    expect(result).toMatch(/\d+ \d+ [\d.]+ [EW]/);
  });
});