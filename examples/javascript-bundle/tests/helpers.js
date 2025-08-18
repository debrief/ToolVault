// Test helpers and fixtures

const samplePoint = {
  type: 'Feature',
  properties: { name: 'Test Point' },
  geometry: {
    type: 'Point',
    coordinates: [-0.1276, 51.5074]
  }
};

const sampleLineString = {
  type: 'Feature',
  properties: { name: 'Test Line' },
  geometry: {
    type: 'LineString',
    coordinates: [
      [-0.1276, 51.5074],
      [-0.1278, 51.5076],
      [-0.1280, 51.5078]
    ]
  }
};

const sampleTrackWithTimestamps = {
  type: 'Feature',
  properties: { name: 'GPS Track' },
  geometry: {
    type: 'LineString',
    coordinates: [
      [-0.1276, 51.5074],
      [-0.1278, 51.5076],
      [-0.1280, 51.5078]
    ],
    properties: {
      timestamps: [
        '2024-01-18T10:00:00Z',
        '2024-01-18T10:00:05Z',
        '2024-01-18T10:00:10Z'
      ]
    }
  }
};

const sampleFeatureCollection = {
  type: 'FeatureCollection',
  features: [samplePoint, sampleLineString]
};

module.exports = {
  samplePoint,
  sampleLineString,
  sampleTrackWithTimestamps,
  sampleFeatureCollection
};