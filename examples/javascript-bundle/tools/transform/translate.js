(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.translateFeatures = function(input, params) {
    const { direction = 0, distance = 100 } = params || {};
    
    // Convert direction to radians
    const directionRad = (direction * Math.PI) / 180;
    
    // Calculate offset in degrees (approximation for small distances)
    // Earth radius in meters
    const earthRadius = 6371000;
    const latOffset = (distance * Math.cos(directionRad)) / earthRadius * (180 / Math.PI);
    const lonOffset = (distance * Math.sin(directionRad)) / earthRadius * (180 / Math.PI);
    
    // Helper function to translate a coordinate
    function translateCoordinate(coord) {
      const avgLat = coord[1];
      const lonCorrection = Math.cos(avgLat * Math.PI / 180);
      return [
        coord[0] + lonOffset / lonCorrection,
        coord[1] + latOffset
      ];
    }
    
    // Helper function to translate coordinates recursively
    function translateCoordinates(coords) {
      if (typeof coords[0] === 'number') {
        return translateCoordinate(coords);
      }
      return coords.map(translateCoordinates);
    }
    
    // Deep clone the input
    const result = JSON.parse(JSON.stringify(input));
    
    // Handle different GeoJSON types
    if (result.type === 'FeatureCollection') {
      result.features = result.features.map(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
          feature.geometry.coordinates = translateCoordinates(feature.geometry.coordinates);
        }
        return feature;
      });
    } else if (result.type === 'Feature') {
      if (result.geometry && result.geometry.coordinates) {
        result.geometry.coordinates = translateCoordinates(result.geometry.coordinates);
      }
    } else if (result.coordinates) {
      result.coordinates = translateCoordinates(result.coordinates);
    }
    
    return result;
  };
})();