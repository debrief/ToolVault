(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.smoothPolyline = function(input, params) {
    const { algorithm = 'moving_average', window_size = 3, sigma = 1.0 } = params || {};
    
    // Deep clone the input
    const result = JSON.parse(JSON.stringify(input));
    
    // Helper function to apply moving average smoothing
    function movingAverageSmooth(coordinates, windowSize) {
      if (coordinates.length <= windowSize) {
        return coordinates;
      }
      
      const smoothed = [];
      const halfWindow = Math.floor(windowSize / 2);
      
      for (let i = 0; i < coordinates.length; i++) {
        let sumLon = 0, sumLat = 0, count = 0;
        
        const start = Math.max(0, i - halfWindow);
        const end = Math.min(coordinates.length - 1, i + halfWindow);
        
        for (let j = start; j <= end; j++) {
          sumLon += coordinates[j][0];
          sumLat += coordinates[j][1];
          count++;
        }
        
        smoothed.push([sumLon / count, sumLat / count]);
      }
      
      return smoothed;
    }
    
    // Helper function to apply Gaussian smoothing
    function gaussianSmooth(coordinates, sigma) {
      if (coordinates.length < 3) {
        return coordinates;
      }
      
      const smoothed = [];
      const kernelSize = Math.ceil(3 * sigma) * 2 + 1;
      const halfKernel = Math.floor(kernelSize / 2);
      
      // Generate Gaussian kernel
      const kernel = [];
      let kernelSum = 0;
      for (let i = -halfKernel; i <= halfKernel; i++) {
        const weight = Math.exp(-(i * i) / (2 * sigma * sigma));
        kernel.push(weight);
        kernelSum += weight;
      }
      
      // Normalize kernel
      for (let i = 0; i < kernel.length; i++) {
        kernel[i] /= kernelSum;
      }
      
      // Apply convolution
      for (let i = 0; i < coordinates.length; i++) {
        let sumLon = 0, sumLat = 0;
        
        for (let j = 0; j < kernel.length; j++) {
          const coordIndex = i - halfKernel + j;
          
          if (coordIndex >= 0 && coordIndex < coordinates.length) {
            sumLon += coordinates[coordIndex][0] * kernel[j];
            sumLat += coordinates[coordIndex][1] * kernel[j];
          }
        }
        
        smoothed.push([sumLon, sumLat]);
      }
      
      return smoothed;
    }
    
    // Apply smoothing to coordinates
    function smoothCoordinates(coords) {
      if (algorithm === 'moving_average') {
        return movingAverageSmooth(coords, window_size);
      } else if (algorithm === 'gaussian') {
        return gaussianSmooth(coords, sigma);
      }
      return coords;
    }
    
    // Process based on input type
    if (result.type === 'FeatureCollection') {
      result.features.forEach(feature => {
        if (feature.geometry && feature.geometry.type === 'LineString') {
          feature.geometry.coordinates = smoothCoordinates(feature.geometry.coordinates);
        }
      });
    } else if (result.type === 'Feature') {
      if (result.geometry && result.geometry.type === 'LineString') {
        result.geometry.coordinates = smoothCoordinates(result.geometry.coordinates);
      }
    } else if (result.type === 'LineString') {
      result.coordinates = smoothCoordinates(result.coordinates);
    }
    
    return result;
  };
})();