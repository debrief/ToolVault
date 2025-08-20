// Jest setup file for ToolVault JavaScript Bundle
// Sets up the global ToolVault namespace and common test utilities

// Initialize global ToolVault namespace
global.window = global.window || {};
global.window.ToolVault = {
  tools: {},
  metadata: {}
};

// Global test helpers
global.expect.extend({
  toBeValidGeoJSON(received) {
    if (!received || typeof received !== 'object') {
      return {
        pass: false,
        message: () => 'Expected valid GeoJSON object'
      };
    }
    
    const validTypes = ['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
    const hasValidType = validTypes.includes(received.type);
    
    return {
      pass: hasValidType,
      message: () => hasValidType ? 
        'Expected invalid GeoJSON but received valid GeoJSON' :
        `Expected valid GeoJSON type, received: ${received.type}`
    };
  }
});