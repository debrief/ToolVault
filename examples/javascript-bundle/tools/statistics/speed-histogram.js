(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.createSpeedHistogram = function(input, params) {
    const { interval_minutes = 1, bins = 20 } = params || {};
    
    // Use the calculateSpeedSeries function to get speeds
    const speedSeries = window.ToolVault.tools.calculateSpeedSeries(input, { time_unit: 'seconds' });
    
    if (!speedSeries || speedSeries.length === 0) {
      return {
        bins: [],
        counts: [],
        min: 0,
        max: 0
      };
    }
    
    // Group speeds by time intervals
    const intervalMs = interval_minutes * 60 * 1000;
    const intervalGroups = {};
    
    speedSeries.forEach(point => {
      const time = new Date(point.time);
      const intervalKey = Math.floor(time.getTime() / intervalMs) * intervalMs;
      
      if (!intervalGroups[intervalKey]) {
        intervalGroups[intervalKey] = [];
      }
      intervalGroups[intervalKey].push(point.speed);
    });
    
    // Calculate average speed for each interval
    const intervalSpeeds = Object.values(intervalGroups).map(speeds => {
      const sum = speeds.reduce((a, b) => a + b, 0);
      return sum / speeds.length;
    });
    
    if (intervalSpeeds.length === 0) {
      return {
        bins: [],
        counts: [],
        min: 0,
        max: 0
      };
    }
    
    // Find min and max speeds
    const minSpeed = Math.min(...intervalSpeeds);
    const maxSpeed = Math.max(...intervalSpeeds);
    
    // Create histogram bins
    const binWidth = (maxSpeed - minSpeed) / bins;
    const histogram = {
      bins: [],
      counts: new Array(bins).fill(0),
      min: minSpeed,
      max: maxSpeed,
      binWidth: binWidth
    };
    
    // Create bin edges
    for (let i = 0; i < bins; i++) {
      histogram.bins.push({
        min: minSpeed + i * binWidth,
        max: minSpeed + (i + 1) * binWidth,
        center: minSpeed + (i + 0.5) * binWidth
      });
    }
    
    // Count speeds in each bin
    intervalSpeeds.forEach(speed => {
      const binIndex = Math.min(Math.floor((speed - minSpeed) / binWidth), bins - 1);
      if (binIndex >= 0 && binIndex < bins) {
        histogram.counts[binIndex]++;
      }
    });
    
    return histogram;
  };
})();