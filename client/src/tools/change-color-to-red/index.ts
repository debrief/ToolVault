/**
 * Change Color to Red Tool
 * 
 * Takes a GeoJSON feature and sets its properties.color to red.
 * Useful for highlighting features on a map or standardizing feature colors.
 */

import { ToolValidationError } from '../types';
import type { Feature, Geometry } from 'geojson';

// Type definitions for this tool
export interface ChangeColorToRedInput {
  feature: Feature<Geometry>;
}

export interface ChangeColorToRedOutput {
  feature: Feature<Geometry>;
  originalColor?: string;
  colorChanged: boolean;
}

/**
 * Input validation for change color to red tool
 */
function isChangeColorToRedInput(input: any): input is ChangeColorToRedInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  
  if (typeof input.feature !== 'object' || input.feature === null) {
    return false;
  }
  
  if (input.feature.type !== 'Feature') {
    return false;
  }
  
  if (!input.feature.geometry || typeof input.feature.geometry !== 'object' || input.feature.geometry === null) {
    return false;
  }
  
  return true;
}

/**
 * Main tool execution function
 */
export default function run(input: ChangeColorToRedInput): ChangeColorToRedOutput {
  // Validate input
  if (!isChangeColorToRedInput(input)) {
    throw new ToolValidationError('Invalid input: expected object with feature property containing a valid GeoJSON Feature');
  }

  const { feature } = input;

  // Additional validation
  if (!feature.geometry) {
    throw new ToolValidationError('Invalid feature: geometry is required');
  }

  try {
    // Create a deep copy of the feature to avoid mutating the input
    const updatedFeature: Feature<Geometry> = {
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        ...feature.properties,
        color: 'red'
      }
    };

    // If the feature has an id, preserve it
    if (feature.id !== undefined) {
      updatedFeature.id = feature.id;
    }

    // Capture the original color for reporting
    const originalColor = feature.properties?.color;
    const colorChanged = originalColor !== 'red';

    return {
      feature: updatedFeature,
      originalColor: originalColor || undefined,
      colorChanged
    };
  } catch (error) {
    throw new Error(`Change color to red execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Input validation function
 */
export function validate(input: any): input is ChangeColorToRedInput {
  return isChangeColorToRedInput(input);
}

/**
 * Tool metadata
 */
export const metadata = {
  version: '1.0.0',
  author: 'ToolVault',
  dependencies: []
};

/**
 * Sample test data for the tool
 */
export const testData = {
  feature: {
    type: 'Feature',
    id: 'sample-polygon',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.4194, 37.7749], // San Francisco area
        [-122.4094, 37.7749],
        [-122.4094, 37.7849],
        [-122.4194, 37.7849],
        [-122.4194, 37.7749]
      ]]
    },
    properties: {
      name: 'Sample Area',
      color: 'blue',
      description: 'A sample polygon in San Francisco that will be changed to red'
    }
  }
};