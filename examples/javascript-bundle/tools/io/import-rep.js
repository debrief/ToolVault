(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.importREP = function(input, params) {
    const { encoding = 'utf-8' } = params || {};
    
    // Debrief REP format parser
    // Format: YYMMDD HHMMSS.SSS vessel_name symbol lat_deg lat_min lat_sec lat_hem lon_deg lon_min lon_sec lon_hem heading speed depth [label]
    // Lines starting with ; are comments (ignored)
    // Multiple tracks distinguished by vessel name
    
    const lines = input.split('\n');
    const vesselTracks = new Map(); // vessel name -> array of points
    
    // Helper function to convert DMS to decimal degrees
    function convertFromDMS(degrees, minutes, seconds, hemisphere) {
      let decimal = degrees + (minutes / 60) + (seconds / 3600);
      if (hemisphere === 'S' || hemisphere === 'W') {
        decimal = -decimal;
      }
      return decimal;
    }
    
    // Helper function to parse REP timestamp
    function parseREPTimestamp(dateStr, timeStr) {
      // Handle both YY and YYYY formats
      let year;
      if (dateStr.length === 6) {
        const yy = parseInt(dateStr.substring(0, 2));
        // Assume 70-99 = 1970-1999, 00-69 = 2000-2069
        year = yy >= 70 ? 1900 + yy : 2000 + yy;
      } else {
        year = parseInt(dateStr.substring(0, 4));
      }
      
      const month = parseInt(dateStr.substring(dateStr.length - 4, dateStr.length - 2)) - 1; // 0-indexed
      const day = parseInt(dateStr.substring(dateStr.length - 2));
      
      const hours = parseInt(timeStr.substring(0, 2));
      const minutes = parseInt(timeStr.substring(2, 4));
      const secondsFloat = parseFloat(timeStr.substring(4));
      const seconds = Math.floor(secondsFloat);
      const milliseconds = Math.round((secondsFloat - seconds) * 1000);
      
      return Date.UTC(year, month, day, hours, minutes, seconds, milliseconds);
    }
    
    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines and comments (starting with ;)
      if (!line || line.startsWith(';')) {
        continue;
      }
      
      // Split by whitespace, handling quoted vessel names
      const parts = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ' ' && !inQuotes && current.length > 0) {
          parts.push(current);
          current = '';
        } else if (char !== ' ' || inQuotes) {
          current += char;
        }
      }
      if (current.length > 0) {
        parts.push(current);
      }
      
      // Minimum fields required for a valid track point
      if (parts.length < 12) {
        continue;
      }
      
      try {
        const dateStr = parts[0];
        const timeStr = parts[1];
        const vesselName = parts[2].replace(/"/g, ''); // Remove quotes
        const symbol = parts[3];
        
        const latDeg = parseInt(parts[4]);
        const latMin = parseFloat(parts[5]);
        const latSec = parseFloat(parts[6]);
        const latHem = parts[7];
        
        const lonDeg = parseInt(parts[8]);
        const lonMin = parseFloat(parts[9]);
        const lonSec = parseFloat(parts[10]);
        const lonHem = parts[11];
        
        const heading = parts.length > 12 ? parseFloat(parts[12]) || 0 : 0;
        const speed = parts.length > 13 ? parseFloat(parts[13]) || 0 : 0;
        const depth = parts.length > 14 ? parseFloat(parts[14]) || 0 : 0;
        const label = parts.length > 15 ? parts.slice(15).join(' ') : '';
        
        // Convert to decimal degrees
        const lat = convertFromDMS(latDeg, latMin, latSec, latHem);
        const lon = convertFromDMS(lonDeg, lonMin, lonSec, lonHem);
        
        // Parse timestamp
        const timestamp = parseREPTimestamp(dateStr, timeStr);
        
        // Add to vessel track
        if (!vesselTracks.has(vesselName)) {
          vesselTracks.set(vesselName, []);
        }
        
        vesselTracks.get(vesselName).push({
          coordinates: [lon, lat],
          timestamp: timestamp,
          heading: heading,
          speed: speed,
          depth: depth,
          label: label
        });
        
      } catch (e) {
        // Skip malformed lines
        continue;
      }
    }
    
    // Create GeoJSON FeatureCollection
    const features = [];
    
    for (const [vesselName, points] of vesselTracks.entries()) {
      if (points.length === 0) continue;
      
      let geometry;
      const timestamps = points.map(p => p.timestamp);
      const properties = {
        name: vesselName,
        vessel_name: vesselName,
        timestamps: timestamps
      };
      
      // Add additional data if available
      if (points.some(p => p.heading !== 0)) {
        properties.heading = points.map(p => p.heading);
      }
      if (points.some(p => p.speed !== 0)) {
        properties.speed = points.map(p => p.speed);
      }
      if (points.some(p => p.depth !== 0)) {
        properties.depth = points.map(p => p.depth);
      }
      if (points.some(p => p.label)) {
        properties.labels = points.map(p => p.label);
      }
      
      // Always create LineString for vessel tracks (even single points)
      geometry = {
        type: 'LineString',
        coordinates: points.map(p => p.coordinates)
      };
      
      features.push({
        type: 'Feature',
        properties: properties,
        geometry: geometry
      });
    }
    
    return {
      type: 'FeatureCollection',
      features: features
    };
  };
})();