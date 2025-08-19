(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.createSpeedHistogram = function(input, params) {
    const { bins = 10, time_unit = 'seconds' } = params || {};
    
    // First get the speed series using the calculateSpeedSeries tool
    // This requires the speed-series tool to be loaded
    if (!window.ToolVault.tools.calculateSpeedSeries) {
      throw new Error('Speed series tool not available. Please load speed-series.js first.');
    }
    
    const speedSeries = window.ToolVault.tools.calculateSpeedSeries(input, { time_unit });
    
    if (speedSeries.length === 0) {
      return {
        bins: [],
        counts: [],
        min: 0,
        max: 0,
        total: 0
      };
    }
    
    // Extract speeds
    const speeds = speedSeries.map(s => s.speed);
    const minSpeed = Math.min(...speeds);
    const maxSpeed = Math.max(...speeds);
    
    // Create histogram bins
    const binWidth = (maxSpeed - minSpeed) / bins;
    const histogramBins = [];
    const counts = [];
    
    for (let i = 0; i < bins; i++) {
      const binStart = minSpeed + i * binWidth;
      const binEnd = i === bins - 1 ? maxSpeed + 0.001 : binStart + binWidth; // Include max in last bin
      
      histogramBins.push({
        min: binStart,
        max: binEnd,
        center: (binStart + binEnd) / 2
      });
      
      // Count speeds in this bin
      const count = speeds.filter(speed => speed >= binStart && speed < binEnd).length;
      counts.push(count);
    }
    
    return {
      bins: histogramBins,
      counts: counts,
      min: minSpeed,
      max: maxSpeed,
      total: speeds.length
    };
  };
})();