(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.exportREP = function(input, params) {
    const { precision = 6 } = params || {};
    
    // REP format output - actual Debrief REP format
    let output = [];
    
    // Helper function to convert decimal degrees to degrees, minutes, seconds
    function convertToDMS(decimal) {
      const abs = Math.abs(decimal);
      const degrees = Math.floor(abs);
      const minutesFloat = (abs - degrees) * 60;
      const minutes = Math.floor(minutesFloat);
      const seconds = (minutesFloat - minutes) * 60;
      return {
        degrees: degrees,
        minutes: minutes,
        seconds: parseFloat(seconds.toFixed(precision))
      };
    }
    
    // Helper function to format timestamp for REP format
    function formatREPTimestamp(timestamp) {
      const date = new Date(timestamp);
      const year = date.getUTCFullYear().toString().slice(2); // YY format
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
      
      return {
        date: `${year}${month}${day}`,
        time: `${hours}${minutes}${seconds}.${ms}`
      };
    }
    
    // Helper function to create REP track point
    function createREPPoint(lon, lat, timestamp, vesselName = 'UNKNOWN', heading = 0, speed = 0, depth = 0) {
      const latDMS = convertToDMS(lat);
      const lonDMS = convertToDMS(lon);
      const latHem = lat >= 0 ? 'N' : 'S';
      const lonHem = lon >= 0 ? 'E' : 'W';
      
      let dateStr, timeStr;
      if (timestamp) {
        const repTime = formatREPTimestamp(timestamp);
        dateStr = repTime.date;
        timeStr = repTime.time;
      } else {
        // Default to epoch start if no timestamp
        dateStr = '700101';
        timeStr = '000000.000';
      }
      
      // REP format: YYMMDD HHMMSS.SSS vessel_name symbol lat_deg lat_min lat_sec lat_hem lon_deg lon_min lon_sec lon_hem heading speed depth
      return `${dateStr} ${timeStr} ${vesselName} @ ${latDMS.degrees} ${latDMS.minutes} ${latDMS.seconds} ${latHem} ${lonDMS.degrees} ${lonDMS.minutes} ${lonDMS.seconds} ${lonHem} ${heading} ${speed} ${depth}`;
    }
    
    // Process input based on type
    if (input.type === 'FeatureCollection') {
      input.features.forEach((feature) => {
        if (feature.geometry) {
          const vesselName = feature.properties?.vessel_name || feature.properties?.name || 'UNKNOWN';
          const timestamps = feature.properties?.timestamps || [];
          const headings = feature.properties?.heading || feature.properties?.headings || [];
          const speeds = feature.properties?.speed || feature.properties?.speeds || [];
          const depths = feature.properties?.depth || feature.properties?.depths || [];
          
          if (feature.geometry.type === 'Point') {
            const [lon, lat] = feature.geometry.coordinates;
            const timestamp = timestamps[0];
            const heading = headings[0] || 0;
            const speed = speeds[0] || 0;
            const depth = depths[0] || 0;
            if (timestamp !== undefined) {
              output.push(createREPPoint(lon, lat, timestamp, vesselName, heading, speed, depth));
            }
          } else if (feature.geometry.type === 'LineString') {
            feature.geometry.coordinates.forEach((coord, index) => {
              const [lon, lat] = coord;
              const timestamp = timestamps[index];
              const heading = headings[index] || 0;
              const speed = speeds[index] || 0;
              const depth = depths[index] || 0;
              if (timestamp !== undefined) {
                output.push(createREPPoint(lon, lat, timestamp, vesselName, heading, speed, depth));
              }
            });
          } else if (feature.geometry.type === 'Polygon') {
            // Export outer ring only
            feature.geometry.coordinates[0].forEach((coord, index) => {
              const [lon, lat] = coord;
              const timestamp = timestamps[index];
              const heading = headings[index] || 0;
              const speed = speeds[index] || 0;
              const depth = depths[index] || 0;
              if (timestamp !== undefined) {
                output.push(createREPPoint(lon, lat, timestamp, vesselName, heading, speed, depth));
              }
            });
          }
        }
      });
    } else if (input.type === 'Feature') {
      const vesselName = input.properties?.vessel_name || input.properties?.name || 'UNKNOWN';
      const timestamps = input.properties?.timestamps || [];
      const headings = input.properties?.heading || input.properties?.headings || [];
      const speeds = input.properties?.speed || input.properties?.speeds || [];
      const depths = input.properties?.depth || input.properties?.depths || [];
      
      if (input.geometry.type === 'Point') {
        const [lon, lat] = input.geometry.coordinates;
        const timestamp = timestamps[0];
        const heading = headings[0] || 0;
        const speed = speeds[0] || 0;
        const depth = depths[0] || 0;
        if (timestamp !== undefined) {
          output.push(createREPPoint(lon, lat, timestamp, vesselName, heading, speed, depth));
        }
      } else if (input.geometry.type === 'LineString') {
        input.geometry.coordinates.forEach((coord, index) => {
          const [lon, lat] = coord;
          const timestamp = timestamps[index];
          const heading = headings[index] || 0;
          const speed = speeds[index] || 0;
          const depth = depths[index] || 0;
          if (timestamp !== undefined) {
            output.push(createREPPoint(lon, lat, timestamp, vesselName, heading, speed, depth));
          }
        });
      } else if (input.geometry.type === 'Polygon') {
        // Export outer ring only
        input.geometry.coordinates[0].forEach((coord, index) => {
          const [lon, lat] = coord;
          const timestamp = timestamps[index];
          const heading = headings[index] || 0;
          const speed = speeds[index] || 0;
          const depth = depths[index] || 0;
          if (timestamp !== undefined) {
            output.push(createREPPoint(lon, lat, timestamp, vesselName, heading, speed, depth));
          }
        });
      }
    } else if (input.type && input.coordinates) {
      // Direct geometry object
      const vesselName = 'UNKNOWN';
      
      if (input.type === 'Point') {
        const [lon, lat] = input.coordinates;
        output.push(createREPPoint(lon, lat, null, vesselName));
      } else if (input.type === 'LineString') {
        input.coordinates.forEach((coord) => {
          const [lon, lat] = coord;
          output.push(createREPPoint(lon, lat, null, vesselName));
        });
      } else if (input.type === 'Polygon') {
        // Export outer ring only
        input.coordinates[0].forEach((coord) => {
          const [lon, lat] = coord;
          output.push(createREPPoint(lon, lat, null, vesselName));
        });
      }
    }
    
    return output.join('\n');
  };
})();