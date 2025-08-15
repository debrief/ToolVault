/**
 * Type definitions for the change-color-to-red tool
 */

import type { Feature, Geometry } from 'geojson';

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
export function isChangeColorToRedInput(input: any): input is ChangeColorToRedInput {
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