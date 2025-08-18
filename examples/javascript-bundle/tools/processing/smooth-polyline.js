(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.smoothPolyline = function(input, params) {
    const { algorithm = 'moving_average', window_size = 3 } = params || {};
    
    // Extract coordinates
    let coordinates = [];
    let inputType = null;
    
    if (input.type === 'Feature' && input.geometry.type === 'LineString') {
      coordinates = input.geometry.coordinates;
      inputType = 'Feature';
    } else if (input.type === 'LineString') {
      coordinates = input.coordinates;
      inputType = 'LineString';
    }
    
    if (coordinates.length < 2) {
      return input; // Not enough points to smooth
    }
    
    // Deep clone the input
    const result = JSON.parse(JSON.stringify(input));
    
    // Apply smoothing based on algorithm
    let smoothedCoords = [];
    
    if (algorithm === 'moving_average') {
      // Moving average smoothing
      const halfWindow = Math.floor(window_size / 2);
      
      for (let i = 0; i < coordinates.length; i++) {
        let sumLon = 0;
        let sumLat = 0;
        let count = 0;
        
        for (let j = Math.max(0, i - halfWindow); 
             j <= Math.min(coordinates.length - 1, i + halfWindow); 
             j++) {
          sumLon += coordinates[j][0];
          sumLat += coordinates[j][1];
          count++;
        }
        
        smoothedCoords.push([sumLon / count, sumLat / count]);
      }
    } else if (algorithm === 'gaussian') {
      // Gaussian smoothing
      const sigma = window_size / 3; // Standard deviation
      
      // Generate Gaussian weights
      function gaussianWeight(distance, sigma) {
        return Math.exp(-(distance * distance) / (2 * sigma * sigma));
      }
      
      for (let i = 0; i < coordinates.length; i++) {
        let weightedSumLon = 0;
        let weightedSumLat = 0;
        let totalWeight = 0;
        
        for (let j = 0; j < coordinates.length; j++) {
          const distance = Math.abs(i - j);
          const weight = gaussianWeight(distance, sigma);
          
          weightedSumLon += coordinates[j][0] * weight;
          weightedSumLat += coordinates[j][1] * weight;
          totalWeight += weight;
        }
        
        smoothedCoords.push([
          weightedSumLon / totalWeight,
          weightedSumLat / totalWeight
        ]);
      }
    } else {
      // Default to original coordinates if algorithm not recognized
      smoothedCoords = coordinates;
    }
    
    // Update the result with smoothed coordinates
    if (inputType === 'Feature') {
      result.geometry.coordinates = smoothedCoords;
    } else if (inputType === 'LineString') {
      result.coordinates = smoothedCoords;
    }
    
    return result;
  };
})();