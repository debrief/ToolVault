(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.importREP = function(input, params) {
    const { encoding = 'utf-8' } = params || {};
    
    // REP format is a simple text format with lines of coordinates
    // Format: lat,lon[,altitude][,time]
    // Lines starting with # are comments
    // First non-comment line may contain metadata
    
    const lines = input.split('\n');
    const features = [];
    const coordinates = [];
    const timestamps = [];
    let metadata = {};
    
    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        continue;
      }
      
      // Parse line as coordinate data
      const parts = line.split(',').map(p => p.trim());
      
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          coordinates.push([lon, lat]); // GeoJSON uses [lon, lat]
          
          // Check for timestamp (4th field)
          if (parts.length >= 4 && parts[3]) {
            timestamps.push(parts[3]);
          }
        } else if (coordinates.length === 0) {
          // First non-coordinate line might be metadata
          try {
            metadata = { description: line };
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }
    
    // Create GeoJSON output
    if (coordinates.length > 0) {
      const feature = {
        type: 'Feature',
        properties: {
          ...metadata,
          source: 'REP import'
        },
        geometry: {
          type: coordinates.length === 1 ? 'Point' : 'LineString',
          coordinates: coordinates.length === 1 ? coordinates[0] : coordinates
        }
      };
      
      // Add timestamps if available
      if (timestamps.length > 0) {
        feature.geometry.properties = {
          timestamps: timestamps
        };
      }
      
      features.push(feature);
    }
    
    return {
      type: 'FeatureCollection',
      features: features
    };
  };
})();