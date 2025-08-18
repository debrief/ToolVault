(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.exportREP = function(input, params) {
    const { precision = 6 } = params || {};
    
    // REP format output
    let output = [];
    
    // Add header comment
    output.push('# REP Format Export from ToolVault');
    output.push('# Format: lat,lon[,altitude][,timestamp]');
    output.push('');
    
    // Helper function to format number with precision
    function formatNumber(num) {
      return Number(num).toFixed(precision);
    }
    
    // Helper function to extract coordinates from geometry
    function extractCoordinates(geometry) {
      const coords = [];
      const timestamps = geometry.properties?.timestamps || [];
      
      if (geometry.type === 'Point') {
        const lon = formatNumber(geometry.coordinates[0]);
        const lat = formatNumber(geometry.coordinates[1]);
        const alt = geometry.coordinates[2] ? formatNumber(geometry.coordinates[2]) : '0';
        const time = timestamps[0] || '';
        coords.push(`${lat},${lon},${alt},${time}`);
      } else if (geometry.type === 'LineString') {
        geometry.coordinates.forEach((coord, index) => {
          const lon = formatNumber(coord[0]);
          const lat = formatNumber(coord[1]);
          const alt = coord[2] ? formatNumber(coord[2]) : '0';
          const time = timestamps[index] || '';
          coords.push(`${lat},${lon},${alt},${time}`);
        });
      } else if (geometry.type === 'Polygon') {
        // Export only the outer ring
        geometry.coordinates[0].forEach((coord, index) => {
          const lon = formatNumber(coord[0]);
          const lat = formatNumber(coord[1]);
          const alt = coord[2] ? formatNumber(coord[2]) : '0';
          coords.push(`${lat},${lon},${alt},`);
        });
      }
      
      return coords;
    }
    
    // Process input based on type
    if (input.type === 'FeatureCollection') {
      input.features.forEach((feature, featureIndex) => {
        if (featureIndex > 0) {
          output.push(''); // Empty line between features
        }
        
        // Add feature name/description if available
        if (feature.properties?.name) {
          output.push(`# ${feature.properties.name}`);
        }
        
        if (feature.geometry) {
          const coords = extractCoordinates(feature.geometry);
          output = output.concat(coords);
        }
      });
    } else if (input.type === 'Feature') {
      if (input.properties?.name) {
        output.push(`# ${input.properties.name}`);
      }
      
      if (input.geometry) {
        const coords = extractCoordinates(input.geometry);
        output = output.concat(coords);
      }
    } else if (input.type && input.coordinates) {
      // Direct geometry object
      const coords = extractCoordinates(input);
      output = output.concat(coords);
    }
    
    return output.join('\n');
  };
})();