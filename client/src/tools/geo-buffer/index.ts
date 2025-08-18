/**
 * Geospatial Buffer Tool
 * 
 * Creates a buffer polygon around a given GeoJSON geometry.
 * This is a simplified implementation using a basic approximation.
 * For production use, consider using a proper geospatial library like Turf.js.
 */

import { ToolValidationError } from '../types';
import type { Feature, Geometry, Polygon } from 'geojson';

// Type definitions for this tool
export interface GeoBufferInput {
  geometry: Feature<Geometry>;
  distance: number;
}

export interface GeoBufferOutput {
  buffered_geometry: Feature<Polygon>;
  original_area?: number;
  buffered_area?: number;
}

/**
 * Input validation for geo buffer tool
 */
function isGeoBufferInput(input: any): input is GeoBufferInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  
  if (typeof input.geometry !== 'object' || input.geometry === null) {
    return false;
  }
  
  if (input.geometry.type !== 'Feature') {
    return false;
  }
  
  if (!input.geometry.geometry || typeof input.geometry.geometry !== 'object') {
    return false;
  }
  
  if (typeof input.distance !== 'number' || input.distance <= 0) {
    return false;
  }
  
  return true;
}

/**
 * Simple coordinate buffer calculation (approximation)
 * In real applications, use proper geospatial libraries
 */
function bufferCoordinates(coords: number[], distance: number): number[][] {
  const [lon, lat] = coords;
  
  // Convert distance from meters to approximate degrees
  // This is a rough approximation: 1 degree ≈ 111,000 meters at equator
  const degreeDistance = distance / 111000;
  
  // Create a simple square buffer around the point
  return [
    [lon - degreeDistance, lat - degreeDistance],
    [lon + degreeDistance, lat - degreeDistance], 
    [lon + degreeDistance, lat + degreeDistance],
    [lon - degreeDistance, lat + degreeDistance],
    [lon - degreeDistance, lat - degreeDistance] // Close the polygon
  ];
}

/**
 * Main tool execution function
 */
export default function run(input: GeoBufferInput): GeoBufferOutput {
  // Validate input
  if (!isGeoBufferInput(input)) {
    throw new ToolValidationError('Invalid input: expected object with geometry (GeoJSON Feature) and distance (positive number)');
  }

  const { geometry, distance } = input;

  try {
    let bufferedCoordinates: number[][];

    // Handle different geometry types
    switch (geometry.geometry.type) {
      case 'Point':
        bufferedCoordinates = bufferCoordinates(geometry.geometry.coordinates as number[], distance);
        break;
      
      case 'Polygon':
        // Use the first coordinate of the first ring
        const polygonCoords = geometry.geometry.coordinates as number[][][];
        bufferedCoordinates = bufferCoordinates(polygonCoords[0][0], distance);
        break;
      
      case 'LineString':
        // Use the first coordinate of the line
        const lineCoords = geometry.geometry.coordinates as number[][];
        bufferedCoordinates = bufferCoordinates(lineCoords[0], distance);
        break;
      
      case 'MultiPoint':
        // Use the first point
        const multiPointCoords = geometry.geometry.coordinates as number[][];
        bufferedCoordinates = bufferCoordinates(multiPointCoords[0], distance);
        break;
      
      case 'MultiPolygon':
        // Use the first coordinate of the first polygon's first ring
        const multiPolygonCoords = geometry.geometry.coordinates as number[][][][];
        bufferedCoordinates = bufferCoordinates(multiPolygonCoords[0][0][0], distance);
        break;
      
      case 'MultiLineString':
        // Use the first coordinate of the first line
        const multiLineCoords = geometry.geometry.coordinates as number[][][];
        bufferedCoordinates = bufferCoordinates(multiLineCoords[0][0], distance);
        break;
      
      default:
        throw new ToolValidationError(`Unsupported geometry type: ${(geometry.geometry as any).type}`);
    }

    // Create the buffered feature
    const bufferedFeature: Feature<Polygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [bufferedCoordinates]
      },
      properties: {
        ...geometry.properties,
        buffer_distance: distance,
        buffer_units: 'meters',
        original_geometry_type: geometry.geometry.type
      }
    };

    return {
      buffered_geometry: bufferedFeature,
      original_area: undefined, // Could calculate if needed
      buffered_area: undefined  // Could calculate if needed
    };
  } catch (error) {
    throw new Error(`Geo buffer execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Input validation function
 */
export function validate(input: any): input is GeoBufferInput {
  return isGeoBufferInput(input);
}

/**
 * Tool metadata
 */
export const metadata = {
  version: '1.0.0',
  author: 'ToolVault',
  dependencies: [],
  note: 'This is a simplified implementation. For production use, consider using Turf.js or similar geospatial libraries.'
};

/**
 * Sample test data for the tool
 */
export const testData = {
  geometry: {
    type: 'Feature',
    id: 'sample-point',
    geometry: {
      type: 'Point',
      coordinates: [-122.4194, 37.7749] // San Francisco coordinates
    },
    properties: {
      name: 'San Francisco Point',
      description: 'A sample point to create a buffer around'
    }
  },
  distance: 1000 // 1 kilometer buffer
};