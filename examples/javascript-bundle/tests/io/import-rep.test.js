// Load tool
require('../../tools/io/import-rep.js');

// Initialize window object
global.window = global.window || {};

describe('Import REP Format', () => {
  test('should import single track point from REP format', () => {
    const repData = '220118 120000.000 NELSON @ 50 54 0.000 N 1 24 0.000 W 45 10 100';
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
    
    const track = result.features[0];
    expect(track.type).toBe('Feature');
    expect(track.properties.vessel_name).toBe('NELSON');
    expect(track.geometry.type).toBe('LineString');
    expect(track.geometry.coordinates).toHaveLength(1);
    
    // Should convert DMS to decimal degrees
    expect(track.geometry.coordinates[0][0]).toBeCloseTo(-1.4, 1); // 1°24'0" W
    expect(track.geometry.coordinates[0][1]).toBeCloseTo(50.9, 1); // 50°54'0" N
    
    // Should have timestamp
    expect(track.properties.timestamps).toHaveLength(1);
    expect(track.properties.timestamps[0]).toBe(1642507200000); // 2022-01-18 12:00:00 UTC
  });

  test('should import multiple track points for single vessel', () => {
    const repData = `220118 120000.000 NELSON @ 50 54 0.000 N 1 24 0.000 W 45 10 100
220118 120100.000 NELSON @ 50 55 0.000 N 1 25 0.000 W 90 15 105`;
    
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1); // Single vessel
    
    const track = result.features[0];
    expect(track.properties.vessel_name).toBe('NELSON');
    expect(track.geometry.coordinates).toHaveLength(2);
    expect(track.properties.timestamps).toHaveLength(2);
    
    // Verify second point
    expect(track.geometry.coordinates[1][1]).toBeCloseTo(50.916667, 4); // 50°55'0" N
  });

  test('should import multiple vessels as separate features', () => {
    const repData = `220118 120000.000 NELSON @ 50 54 0.000 N 1 24 0.000 W 45 10 100
220118 120000.000 CARRIER @ 51 30 0.000 N 0 10 0.000 W 180 20 50`;
    
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(2);
    
    const vesselNames = result.features.map(f => f.properties.vessel_name);
    expect(vesselNames).toContain('NELSON');
    expect(vesselNames).toContain('CARRIER');
  });

  test('should handle quoted vessel names', () => {
    const repData = '220118 120000.000 "HMS Nelson" @ 50 54 0.000 N 1 24 0.000 W 45 10 100';
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.features[0].properties.vessel_name).toBe('HMS Nelson');
  });

  test('should ignore comment lines starting with semicolon', () => {
    const repData = `; This is a comment
220118 120000.000 NELSON @ 50 54 0.000 N 1 24 0.000 W 45 10 100
; Another comment
220118 120100.000 NELSON @ 50 55 0.000 N 1 25 0.000 W 90 15 105`;
    
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.coordinates).toHaveLength(2);
  });

  test('should handle empty lines and whitespace', () => {
    const repData = `
220118 120000.000 NELSON @ 50 54 0.000 N 1 24 0.000 W 45 10 100

220118 120100.000 NELSON @ 50 55 0.000 N 1 25 0.000 W 90 15 105
    `;
    
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.coordinates).toHaveLength(2);
  });

  test('should handle southern and western hemispheres', () => {
    const repData = '220118 120000.000 SOUTHERN @ 30 30 30.000 S 45 45 45.000 W 0 0 0';
    const result = window.ToolVault.tools.importREP(repData);
    
    const coords = result.features[0].geometry.coordinates[0];
    expect(coords[0]).toBeLessThan(0); // Western longitude should be negative
    expect(coords[1]).toBeLessThan(0); // Southern latitude should be negative
    
    // Should be approximately -45.7625° (45°45'45" W) and -30.5083° (30°30'30" S)
    expect(coords[0]).toBeCloseTo(-45.7625, 3);
    expect(coords[1]).toBeCloseTo(-30.5083, 3);
  });

  test('should handle missing optional parameters', () => {
    const repData = '220118 120000.000 BASIC @ 50 0 0.000 N 0 0 0.000 E';
    const result = window.ToolVault.tools.importREP(repData);
    
    const track = result.features[0];
    expect(track.properties.vessel_name).toBe('BASIC');
    expect(track.geometry.coordinates).toHaveLength(1);
    expect(track.geometry.coordinates[0]).toEqual([0, 50]);
  });

  test('should handle malformed lines gracefully', () => {
    const repData = `220118 120000.000 GOOD @ 50 0 0.000 N 0 0 0.000 E 0 0 0
invalid line format
220118 120100.000 GOOD @ 51 0 0.000 N 0 0 0.000 E 0 0 0`;
    
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.coordinates).toHaveLength(2); // Should skip invalid line
  });

  test('should store heading, speed, and depth when provided', () => {
    const repData = '220118 120000.000 VESSEL @ 50 0 0.000 N 0 0 0.000 E 90 25 150';
    const result = window.ToolVault.tools.importREP(repData);
    
    const track = result.features[0];
    expect(track.properties).toHaveProperty('heading');
    expect(track.properties).toHaveProperty('speed');
    expect(track.properties).toHaveProperty('depth');
    
    expect(track.properties.heading[0]).toBe(90);
    expect(track.properties.speed[0]).toBe(25);
    expect(track.properties.depth[0]).toBe(150);
  });

  test('should handle fractional seconds in timestamps', () => {
    const repData = '220118 120030.500 VESSEL @ 50 0 0.000 N 0 0 0.000 E 0 0 0';
    const result = window.ToolVault.tools.importREP(repData);
    
    const timestamp = result.features[0].properties.timestamps[0];
    // Should be 30.5 seconds after 12:00:00 on 2022-01-18 (12:00:30.500 UTC)
    expect(timestamp).toBe(1642507230500);
  });

  test('should handle vessel name with spaces and special characters', () => {
    const repData = '220118 120000.000 "HMS Victory-2" @ 50 0 0.000 N 0 0 0.000 E 0 0 0';
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.features[0].properties.vessel_name).toBe('HMS Victory-2');
  });

  test('should handle different date formats correctly', () => {
    const repData = '211225 235959.999 NEWYEAR @ 0 0 0.000 N 0 0 0.000 E 0 0 0';
    const result = window.ToolVault.tools.importREP(repData);
    
    // Should parse as December 25, 2021, 23:59:59.999
    const timestamp = result.features[0].properties.timestamps[0];
    const date = new Date(timestamp);
    expect(date.getUTCFullYear()).toBe(2021);
    expect(date.getUTCMonth()).toBe(11); // December (0-indexed)
    expect(date.getUTCDate()).toBe(25);
  });

  test('should handle empty input', () => {
    const result = window.ToolVault.tools.importREP('');
    
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(0);
  });

  test('should handle input with only comments', () => {
    const repData = `; Comment 1
; Comment 2
; Comment 3`;
    
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(0);
  });

  test('should handle precise DMS coordinates', () => {
    const repData = '220118 120000.000 PRECISE @ 50 30 45.123 N 1 15 30.456 W 0 0 0';
    const result = window.ToolVault.tools.importREP(repData);
    
    const coords = result.features[0].geometry.coordinates[0];
    
    // 1°15'30.456" W = -1.2584600°
    expect(coords[0]).toBeCloseTo(-1.2584600, 6);
    // 50°30'45.123" N = 50.5125342°
    expect(coords[1]).toBeCloseTo(50.5125342, 6);
  });

  test('should create proper GeoJSON structure', () => {
    const repData = '220118 120000.000 TEST @ 50 0 0.000 N 0 0 0.000 E 0 0 0';
    const result = window.ToolVault.tools.importREP(repData);
    
    // Verify GeoJSON structure
    expect(result).toHaveProperty('type', 'FeatureCollection');
    expect(result).toHaveProperty('features');
    expect(Array.isArray(result.features)).toBe(true);
    
    const feature = result.features[0];
    expect(feature).toHaveProperty('type', 'Feature');
    expect(feature).toHaveProperty('properties');
    expect(feature).toHaveProperty('geometry');
    expect(feature.geometry).toHaveProperty('type', 'LineString');
    expect(feature.geometry).toHaveProperty('coordinates');
    expect(Array.isArray(feature.geometry.coordinates)).toBe(true);
  });

  test('should handle vessel tracks with large time gaps', () => {
    const repData = `220118 120000.000 VESSEL @ 50 0 0.000 N 0 0 0.000 E 0 0 0
220119 120000.000 VESSEL @ 51 0 0.000 N 1 0 0.000 E 0 0 0`;
    
    const result = window.ToolVault.tools.importREP(repData);
    
    expect(result.features).toHaveLength(1); // Same vessel
    expect(result.features[0].geometry.coordinates).toHaveLength(2);
    
    const timestamps = result.features[0].properties.timestamps;
    expect(timestamps[1] - timestamps[0]).toBe(86400000); // 24 hours in milliseconds
  });
});