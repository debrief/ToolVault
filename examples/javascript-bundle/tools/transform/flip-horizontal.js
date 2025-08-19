(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.flipHorizontal = function(input, params) {
    const { axis = 'longitude' } = params || {};
    
    // Deep clone the input
    const result = JSON.parse(JSON.stringify(input));
    
    // Find the center point for flipping
    let center = 0;
    let coordCount = 0;
    let allCoords = [];
    
    // Helper to collect all coordinates
    function collectCoordinates(coords, axisIndex) {
      if (typeof coords[0] === 'number') {
        center += coords[axisIndex];
        coordCount++;
        allCoords.push(coords[axisIndex]);
      } else {
        coords.forEach(c => collectCoordinates(c, axisIndex));
      }
    }
    
    // Helper to flip coordinates
    function flipCoordinate(coord, axisIndex, centerValue) {
      const newCoord = [...coord];
      newCoord[axisIndex] = 2 * centerValue - coord[axisIndex];
      return newCoord;
    }
    
    // Helper to flip coordinates recursively
    function flipCoordinates(coords, axisIndex, centerValue) {
      if (typeof coords[0] === 'number') {
        return flipCoordinate(coords, axisIndex, centerValue);
      }
      return coords.map(c => flipCoordinates(c, axisIndex, centerValue));
    }
    
    // Determine axis index (0 for longitude, 1 for latitude)
    const axisIndex = axis === 'latitude' ? 1 : 0;
    
    // Collect all coordinates to find center
    if (result.type === 'FeatureCollection') {
      result.features.forEach(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
          collectCoordinates(feature.geometry.coordinates, axisIndex);
        }
      });
    } else if (result.type === 'Feature') {
      if (result.geometry && result.geometry.coordinates) {
        collectCoordinates(result.geometry.coordinates, axisIndex);
      }
    } else if (result.coordinates) {
      collectCoordinates(result.coordinates, axisIndex);
    }
    
    // Calculate center
    if (coordCount === 1) {
      // For single points, flip around 0
      center = 0;
    } else if (coordCount > 1) {
      // For multiple points, use the bounding box center
      const min = Math.min(...allCoords);
      const max = Math.max(...allCoords);
      center = (min + max) / 2;
    } else {
      center = 0;
    }
    
    // Apply flipping
    if (result.type === 'FeatureCollection') {
      result.features = result.features.map(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
          feature.geometry.coordinates = flipCoordinates(
            feature.geometry.coordinates, 
            axisIndex, 
            center
          );
        }
        return feature;
      });
    } else if (result.type === 'Feature') {
      if (result.geometry && result.geometry.coordinates) {
        result.geometry.coordinates = flipCoordinates(
          result.geometry.coordinates, 
          axisIndex, 
          center
        );
      }
    } else if (result.coordinates) {
      result.coordinates = flipCoordinates(result.coordinates, axisIndex, center);
    }
    
    return result;
  };
})();