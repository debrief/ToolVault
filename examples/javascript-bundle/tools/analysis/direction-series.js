(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.calculateDirectionSeries = function(input, params) {
    const { smoothing = false, window_size = 3 } = params || {};
    
    // Calculate bearing between two points
    function calculateBearing(lat1, lon1, lat2, lon2) {
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;
      
      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
      
      const θ = Math.atan2(y, x);
      
      return ((θ * 180 / Math.PI) + 360) % 360; // Convert to degrees and normalize to 0-360
    }
    
    // Extract coordinates and timestamps
    let coordinates = [];
    let timestamps = [];
    
    if (input.type === 'Feature' && input.geometry.type === 'LineString') {
      coordinates = input.geometry.coordinates;
      timestamps = input.geometry.properties?.timestamps || [];
    } else if (input.type === 'LineString') {
      coordinates = input.coordinates;
      timestamps = input.properties?.timestamps || [];
    }
    
    // Calculate directions
    const rawSeries = [];
    
    for (let i = 1; i < coordinates.length && i < timestamps.length; i++) {
      const coord1 = coordinates[i - 1];
      const coord2 = coordinates[i];
      
      const bearing = calculateBearing(coord1[1], coord1[0], coord2[1], coord2[0]);
      
      rawSeries.push({
        time: timestamps[i],
        direction: bearing
      });
    }
    
    // Apply smoothing if requested
    if (smoothing && window_size > 1) {
      const smoothedSeries = [];
      const halfWindow = Math.floor(window_size / 2);
      
      for (let i = 0; i < rawSeries.length; i++) {
        let sum = 0;
        let count = 0;
        
        for (let j = Math.max(0, i - halfWindow); 
             j <= Math.min(rawSeries.length - 1, i + halfWindow); 
             j++) {
          sum += rawSeries[j].direction;
          count++;
        }
        
        smoothedSeries.push({
          time: rawSeries[i].time,
          direction: sum / count
        });
      }
      
      return smoothedSeries;
    }
    
    return rawSeries;
  };
})();