(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.exportCSV = function(input, params) {
    const { include_properties = false, coordinate_format = 'separate', separator = ',' } = params || {};
    
    const rows = [];
    const headers = [];
    
    // Helper function to escape CSV values
    function escapeCSV(value) {
      if (value === null || value === undefined) {
        return '';
      }
      value = String(value);
      if (value.includes(separator) || value.includes('"') || value.includes('\n')) {
        return '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    }
    
    // Helper function to convert geometry to WKT
    function geometryToWKT(geometry) {
      if (geometry.type === 'Point') {
        return `POINT(${geometry.coordinates[0]} ${geometry.coordinates[1]})`;
      } else if (geometry.type === 'LineString') {
        const coords = geometry.coordinates
          .map(c => `${c[0]} ${c[1]}`)
          .join(',');
        return `LINESTRING(${coords})`;
      } else if (geometry.type === 'Polygon') {
        const rings = geometry.coordinates
          .map(ring => {
            const coords = ring.map(c => `${c[0]} ${c[1]}`).join(',');
            return `(${coords})`;
          })
          .join(',');
        return `POLYGON${rings}`;
      } else if (geometry.type === 'MultiPoint') {
        const points = geometry.coordinates
          .map(c => `${c[0]} ${c[1]}`)
          .join(',');
        return `MULTIPOINT(${points})`;
      }
      return '';
    }
    
    // Helper function to flatten geometry coordinates
    function flattenCoordinates(geometry) {
      const points = [];
      
      if (geometry.type === 'Point') {
        points.push(geometry.coordinates);
      } else if (geometry.type === 'LineString') {
        points.push(...geometry.coordinates);
      } else if (geometry.type === 'Polygon') {
        points.push(...geometry.coordinates[0]); // Only outer ring
      } else if (geometry.type === 'MultiPoint') {
        points.push(...geometry.coordinates);
      }
      
      return points;
    }
    
    // Process features
    let features = [];
    
    if (input.type === 'FeatureCollection') {
      features = input.features;
    } else if (input.type === 'Feature') {
      features = [input];
    } else if (input.type && input.coordinates) {
      // Direct geometry
      features = [{
        type: 'Feature',
        properties: {},
        geometry: input
      }];
    }
    
    // Check for timestamps - include when present
    const hasTimestamps = features.some(f => f.properties?.timestamps && Array.isArray(f.properties.timestamps));
    const shouldIncludeTimestamps = hasTimestamps;
    
    // Collect all property keys for headers (excluding timestamps which get special treatment)
    const propertyKeys = new Set();
    
    if (include_properties) {
      features.forEach(feature => {
        if (feature.properties) {
          Object.keys(feature.properties).forEach(key => {
            if (key !== 'timestamps') { // Handle timestamps separately
              propertyKeys.add(key);
            }
          });
        }
      });
    }
    
    // Build headers
    if (coordinate_format === 'wkt') {
      headers.push('geometry');
    } else {
      headers.push('longitude', 'latitude');
    }
    
    // Add timestamp header if timestamps should be included
    if (shouldIncludeTimestamps) {
      headers.push('timestamp');
    }
    
    if (include_properties) {
      headers.push(...Array.from(propertyKeys));
    }
    
    rows.push(headers.map(escapeCSV).join(separator));
    
    // Process each feature
    features.forEach(feature => {
      if (!feature.geometry) {
        return;
      }
      
      if (coordinate_format === 'wkt') {
        // Single row per feature with WKT geometry
        const row = [];
        row.push(escapeCSV(geometryToWKT(feature.geometry)));
        
        if (include_properties && feature.properties) {
          propertyKeys.forEach(key => {
            row.push(escapeCSV(feature.properties[key]));
          });
        }
        
        rows.push(row.join(separator));
      } else {
        // One row per coordinate pair
        const coordinates = flattenCoordinates(feature.geometry);
        const timestamps = feature.properties?.timestamps || [];
        
        coordinates.forEach((coord, index) => {
          const row = [];
          row.push(escapeCSV(coord[0])); // longitude
          row.push(escapeCSV(coord[1])); // latitude
          
          // Add timestamp if available for this coordinate
          if (shouldIncludeTimestamps) {
            row.push(escapeCSV(timestamps[index] || ''));
          }
          
          if (include_properties && feature.properties) {
            propertyKeys.forEach(key => {
              row.push(escapeCSV(feature.properties[key]));
            });
          }
          
          rows.push(row.join(separator));
        });
      }
    });
    
    return rows.join('\n') + (rows.length === 1 ? '\n' : '');
  };
})();