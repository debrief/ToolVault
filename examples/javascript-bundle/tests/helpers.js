// Test helper functions and sample data for ToolVault JavaScript Bundle

// Sample GeoJSON Feature for Point testing
const samplePoint = {
  type: 'Feature',
  properties: { 
    name: 'Test Point',
    timestamp: 1640995200000 // 2022-01-01T00:00:00Z
  },
  geometry: {
    type: 'Point',
    coordinates: [-0.1276, 51.5074] // London coordinates
  }
};

// Sample LineString for track testing
const sampleLineString = {
  type: 'Feature',
  properties: { 
    name: 'Test Line',
    timestamps: [
      1640995200000, // 2022-01-01T00:00:00Z
      1640995260000, // 2022-01-01T00:01:00Z  
      1640995320000  // 2022-01-01T00:02:00Z
    ]
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [-0.1276, 51.5074],
      [-0.1278, 51.5076], 
      [-0.1280, 51.5078]
    ]
  }
};

// Sample FeatureCollection for testing multiple features
const sampleFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    samplePoint,
    sampleLineString
  ]
};

// GPS track with timestamps for speed/direction analysis
const sampleTrackWithTimestamps = {
  type: 'Feature',
  properties: { 
    name: 'GPS Track',
    timestamps: [
      1642505200000, // 2022-01-18T10:00:00Z
      1642505205000, // 2022-01-18T10:00:05Z (5 second intervals)
      1642505210000  // 2022-01-18T10:00:10Z
    ]
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [-0.1276, 51.5074],
      [-0.1278, 51.5076],
      [-0.1280, 51.5078]
    ]
  }
};

// Helper function to create realistic GPS tracks for performance testing
function createLargeTrack(numPoints = 100) {
  const coordinates = [];
  const timestamps = [];
  const startTime = 1642505200000;
  const startLat = 51.5074;
  const startLon = -0.1276;
  
  for (let i = 0; i < numPoints; i++) {
    // Small random movements to simulate GPS track
    const lat = startLat + (Math.random() - 0.5) * 0.01;
    const lon = startLon + (Math.random() - 0.5) * 0.01;
    coordinates.push([lon, lat]);
    timestamps.push(startTime + i * 60000); // 1 minute intervals
  }
  
  return {
    type: 'Feature',
    properties: { 
      name: 'Large Track',
      timestamps: timestamps
    },
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  };
}

module.exports = {
  samplePoint,
  sampleLineString,
  sampleFeatureCollection,
  sampleTrackWithTimestamps,
  createLargeTrack
};