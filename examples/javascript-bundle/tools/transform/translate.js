(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.translate = function(input, params) {
    // Handle null input gracefully
    if (!input) {
      return null;
    }
    
    const { distance = 0, direction = 0, units = 'meters', dx = 0, dy = 0 } = params || {};
    
    let deltaLon, deltaLat;
    
    // Support both dx/dy (simple offset) and distance/direction (polar) parameters
    if (dx !== 0 || dy !== 0) {
      // Simple dx/dy offset in degrees
      deltaLon = dx;
      deltaLat = dy;
    } else {
      // Convert distance to degrees (approximate)
      // 1 degree latitude ≈ 111,320 meters
      const metersPerDegreeLat = 111320;
      let distanceInDegrees = distance / metersPerDegreeLat;
      
      if (units === 'kilometers') {
        distanceInDegrees = (distance * 1000) / metersPerDegreeLat;
      }
      
      // Convert direction to radians
      const directionRad = (direction * Math.PI) / 180;
      
      // Calculate offset components
      deltaLat = distanceInDegrees * Math.cos(directionRad);
      deltaLon = distanceInDegrees * Math.sin(directionRad);
    }
    
    // Deep clone the input
    const result = JSON.parse(JSON.stringify(input));
    
    // Helper function to translate coordinates
    function translateCoordinates(coords) {
      if (typeof coords[0] === 'number') {
        // Single coordinate pair
        return [coords[0] + deltaLon, coords[1] + deltaLat];
      } else {
        // Array of coordinates
        return coords.map(c => translateCoordinates(c));
      }
    }
    
    // Process based on input type
    if (result.type === 'FeatureCollection') {
      result.features.forEach(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
          feature.geometry.coordinates = translateCoordinates(feature.geometry.coordinates);
        }
      });
    } else if (result.type === 'Feature') {
      if (result.geometry && result.geometry.coordinates) {
        result.geometry.coordinates = translateCoordinates(result.geometry.coordinates);
      }
    } else if (result.type && result.coordinates) {
      // Direct geometry
      result.coordinates = translateCoordinates(result.coordinates);
    }
    
    return result;
  };
})();