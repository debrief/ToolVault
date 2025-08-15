/**
 * Tests for change-color-to-red tool
 */

import run, { validate } from '../index';
import { isChangeColorToRedInput } from '../types';
import { ToolValidationError } from '../../types';
import type { Feature, Geometry } from 'geojson';

describe('change-color-to-red tool', () => {
  const sampleFeature: Feature<Geometry> = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-122.4194, 37.7749]
    },
    properties: {
      name: 'Test Point',
      color: 'blue'
    }
  };

  describe('run function', () => {
    it('should change feature color to red', () => {
      const input = { feature: sampleFeature };
      const result = run(input);
      
      expect(result.feature.properties?.color).toBe('red');
      expect(result.originalColor).toBe('blue');
      expect(result.colorChanged).toBe(true);
    });

    it('should preserve other properties', () => {
      const input = { feature: sampleFeature };
      const result = run(input);
      
      expect(result.feature.properties?.name).toBe('Test Point');
      expect(result.feature.geometry).toEqual(sampleFeature.geometry);
      expect(result.feature.type).toBe('Feature');
    });

    it('should handle feature without existing color property', () => {
      const featureWithoutColor: Feature<Geometry> = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        properties: {
          name: 'Test Point'
        }
      };

      const input = { feature: featureWithoutColor };
      const result = run(input);
      
      expect(result.feature.properties?.color).toBe('red');
      expect(result.originalColor).toBeUndefined();
      expect(result.colorChanged).toBe(true);
    });

    it('should handle feature with null properties', () => {
      const featureWithNullProps: Feature<Geometry> = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        properties: null
      };

      const input = { feature: featureWithNullProps };
      const result = run(input);
      
      expect(result.feature.properties?.color).toBe('red');
      expect(result.originalColor).toBeUndefined();
      expect(result.colorChanged).toBe(true);
    });

    it('should detect when color is already red', () => {
      const redFeature: Feature<Geometry> = {
        ...sampleFeature,
        properties: {
          ...sampleFeature.properties,
          color: 'red'
        }
      };

      const input = { feature: redFeature };
      const result = run(input);
      
      expect(result.feature.properties?.color).toBe('red');
      expect(result.originalColor).toBe('red');
      expect(result.colorChanged).toBe(false);
    });

    it('should preserve feature id', () => {
      const featureWithId: Feature<Geometry> = {
        ...sampleFeature,
        id: 'test-feature-123'
      };

      const input = { feature: featureWithId };
      const result = run(input);
      
      expect(result.feature.id).toBe('test-feature-123');
    });

    it('should handle different geometry types', () => {
      const polygon: Feature<Geometry> = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-122.4194, 37.7749],
            [-122.4094, 37.7749],
            [-122.4094, 37.7849],
            [-122.4194, 37.7849],
            [-122.4194, 37.7749]
          ]]
        },
        properties: {
          color: 'green'
        }
      };

      const input = { feature: polygon };
      const result = run(input);
      
      expect(result.feature.properties?.color).toBe('red');
      expect(result.feature.geometry.type).toBe('Polygon');
    });

    it('should throw validation error for invalid input', () => {
      expect(() => run({ notFeature: 'hello' } as any)).toThrow(ToolValidationError);
      expect(() => run(null as any)).toThrow(ToolValidationError);
      expect(() => run(undefined as any)).toThrow(ToolValidationError);
    });

    it('should throw validation error for invalid feature', () => {
      expect(() => run({ feature: 'not a feature' } as any)).toThrow(ToolValidationError);
      expect(() => run({ feature: { type: 'NotFeature' } } as any)).toThrow(ToolValidationError);
    });

    it('should throw validation error for feature without geometry', () => {
      const featureWithoutGeometry = {
        feature: {
          type: 'Feature',
          properties: { color: 'blue' }
        }
      };
      expect(() => run(featureWithoutGeometry as any)).toThrow(ToolValidationError);
    });
  });

  describe('validate function', () => {
    it('should validate correct input', () => {
      expect(validate({ feature: sampleFeature })).toBe(true);
    });

    it('should reject invalid input', () => {
      expect(validate(null)).toBe(false);
      expect(validate(undefined)).toBe(false);
      expect(validate({ notFeature: 'hello' })).toBe(false);
      expect(validate({ feature: 'not a feature' })).toBe(false);
      expect(validate({ feature: { type: 'NotFeature' } })).toBe(false);
    });

    it('should reject feature without geometry', () => {
      const featureWithoutGeometry = {
        feature: {
          type: 'Feature',
          properties: { color: 'blue' }
          // Missing geometry property
        }
      };
      const result = isChangeColorToRedInput(featureWithoutGeometry);
      expect(result).toBe(false);
    });
  });
});