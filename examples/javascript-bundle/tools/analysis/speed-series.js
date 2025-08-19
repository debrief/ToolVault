(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.calculateSpeedSeries = function(input, params) {
    const { time_unit = 'seconds' } = params || {};
    
    // Haversine formula to calculate distance between two points
    function haversineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371000; // Earth radius in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;
      
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      return R * c; // Distance in meters
    }
    
    // Extract coordinates and timestamps
    let coordinates = [];
    let timestamps = [];
    
    if (input.type === 'Feature' && input.geometry.type === 'LineString') {
      coordinates = input.geometry.coordinates;
      timestamps = input.properties?.timestamps || [];
    } else if (input.type === 'LineString') {
      coordinates = input.coordinates;
      timestamps = input.properties?.timestamps || [];
    }
    
    // Calculate speeds
    const series = [];
    
    for (let i = 1; i < coordinates.length && i < timestamps.length; i++) {
      const coord1 = coordinates[i - 1];
      const coord2 = coordinates[i];
      const time1 = new Date(timestamps[i - 1]);
      const time2 = new Date(timestamps[i]);
      
      // Calculate distance in meters
      const distance = haversineDistance(coord1[1], coord1[0], coord2[1], coord2[0]);
      
      // Calculate time difference in seconds
      const timeDiff = (time2 - time1) / 1000;
      
      if (timeDiff > 0) {
        // Calculate speed based on requested unit
        let speed = distance / timeDiff; // m/s
        
        if (time_unit === 'minutes') {
          speed = speed / 60; // m/min
        } else if (time_unit === 'hours') {
          speed = speed / 3600; // m/h
        }
        
        series.push({
          time: timestamps[i],
          speed: speed
        });
      }
    }
    
    return series;
  };
})();