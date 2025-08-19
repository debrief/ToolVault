(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.calculateAverageSpeed = function(input, params) {
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
    
    // Calculate total distance and time
    let totalDistance = 0;
    let totalTime = 0;
    
    for (let i = 1; i < coordinates.length && i < timestamps.length; i++) {
      const coord1 = coordinates[i - 1];
      const coord2 = coordinates[i];
      const time1 = new Date(timestamps[i - 1]);
      const time2 = new Date(timestamps[i]);
      
      // Calculate distance in meters
      totalDistance += haversineDistance(coord1[1], coord1[0], coord2[1], coord2[0]);
      
      // Calculate time difference in seconds
      totalTime += (time2 - time1) / 1000;
    }
    
    if (totalTime === 0) {
      return 0;
    }
    
    // Calculate average speed based on requested unit
    let averageSpeed = totalDistance / totalTime; // m/s
    
    if (time_unit === 'minutes') {
      averageSpeed = averageSpeed / 60; // m/min
    } else if (time_unit === 'hours') {
      averageSpeed = averageSpeed / 3600; // m/h
    }
    
    return averageSpeed;
  };
})();