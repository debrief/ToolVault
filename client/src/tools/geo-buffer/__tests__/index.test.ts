/**
 * Tests for geo-buffer tool
 */

import run, { validate, GeoBufferInput } from '../index';
import { ToolValidationError } from '../../types';
import type { Feature, Geometry, Point } from 'geojson';

describe('geo-buffer tool', () => {
  const samplePoint: Feature<Point> = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-122.4194, 37.7749]
    },
    properties: {
      name: 'Test Point'
    }
  };

  describe('run function', () => {
    it('should create buffer around point geometry', () => {
      const input = { geometry: samplePoint, distance: 1000 };
      const result = run(input);
      
      expect(result.buffered_geometry.type).toBe('Feature');
      expect(result.buffered_geometry.geometry.type).toBe('Polygon');
      expect(result.buffered_geometry.geometry.coordinates).toHaveLength(1);
      expect(result.buffered_geometry.geometry.coordinates[0]).toHaveLength(5); // Closed polygon
      expect(result.buffered_geometry.properties?.buffer_distance).toBe(1000);
      expect(result.buffered_geometry.properties?.buffer_units).toBe('meters');
      expect(result.buffered_geometry.properties?.original_geometry_type).toBe('Point');
    });

    it('should preserve original properties', () => {
      const input = { geometry: samplePoint, distance: 500 };
      const result = run(input);
      
      expect(result.buffered_geometry.properties?.name).toBe('Test Point');
    });

    it('should handle different buffer distances', () => {
      const input1 = { geometry: samplePoint, distance: 100 };
      const input2 = { geometry: samplePoint, distance: 1000 };
      
      const result1 = run(input1);
      const result2 = run(input2);
      
      expect(result1.buffered_geometry.properties?.buffer_distance).toBe(100);
      expect(result2.buffered_geometry.properties?.buffer_distance).toBe(1000);
      
      // Larger buffer should have larger coordinate differences
      const coords1 = result1.buffered_geometry.geometry.coordinates[0];
      const coords2 = result2.buffered_geometry.geometry.coordinates[0];
      
      const range1 = Math.abs(coords1[1][0] - coords1[0][0]); // lon difference
      const range2 = Math.abs(coords2[1][0] - coords2[0][0]); // lon difference
      
      expect(range2).toBeGreaterThan(range1);
    });

    it('should handle polygon geometry', () => {
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
          name: 'Test Polygon'
        }
      };

      const input = { geometry: polygon, distance: 500 };
      const result = run(input);
      
      expect(result.buffered_geometry.type).toBe('Feature');
      expect(result.buffered_geometry.geometry.type).toBe('Polygon');
      expect(result.buffered_geometry.properties?.original_geometry_type).toBe('Polygon');
    });

    it('should handle LineString geometry', () => {
      const lineString: Feature<Geometry> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-122.4194, 37.7749],
            [-122.4094, 37.7849]
          ]
        },
        properties: {
          name: 'Test Line'
        }
      };

      const input = { geometry: lineString, distance: 250 };
      const result = run(input);
      
      expect(result.buffered_geometry.type).toBe('Feature');
      expect(result.buffered_geometry.geometry.type).toBe('Polygon');
      expect(result.buffered_geometry.properties?.original_geometry_type).toBe('LineString');
    });

    it('should throw validation error for invalid input', () => {
      expect(() => run({ notGeometry: 'hello' } as any)).toThrow(ToolValidationError);
      expect(() => run(null as any)).toThrow(ToolValidationError);
      expect(() => run(undefined as any)).toThrow(ToolValidationError);
    });

    it('should throw validation error for invalid geometry', () => {
      expect(() => run({ geometry: 'not a feature', distance: 100 } as any)).toThrow(ToolValidationError);
      expect(() => run({ geometry: { type: 'NotFeature' }, distance: 100 } as any)).toThrow(ToolValidationError);
    });

    it('should throw validation error for invalid distance', () => {
      expect(() => run({ geometry: samplePoint, distance: 0 } as any)).toThrow(ToolValidationError);
      expect(() => run({ geometry: samplePoint, distance: -100 } as any)).toThrow(ToolValidationError);
      expect(() => run({ geometry: samplePoint, distance: 'not a number' } as any)).toThrow(ToolValidationError);
    });

    it('should throw validation error for geometry without geometry property', () => {
      const invalidFeature = {
        geometry: {
          type: 'Feature',
          properties: { name: 'Invalid' }
          // Missing geometry property
        },
        distance: 100
      };
      expect(() => run(invalidFeature as any)).toThrow(ToolValidationError);
    });

    it('should throw error for unsupported geometry type', () => {
      const unsupportedGeometry = {
        geometry: {
          type: 'Feature',
          geometry: {
            type: 'GeometryCollection',
            geometries: []
          },
          properties: {}
        },
        distance: 100
      };
      expect(() => run(unsupportedGeometry as any)).toThrow();
    });
  });

  describe('validate function', () => {
    it('should validate correct input', () => {
      expect(validate({ geometry: samplePoint, distance: 1000 })).toBe(true);
    });

    it('should reject invalid input', () => {
      expect(validate(null)).toBe(false);
      expect(validate(undefined)).toBe(false);
      expect(validate({ notGeometry: 'hello' })).toBe(false);
      expect(validate({ geometry: 'not a feature', distance: 100 })).toBe(false);
      expect(validate({ geometry: samplePoint, distance: 0 })).toBe(false);
      expect(validate({ geometry: samplePoint, distance: -100 })).toBe(false);
    });

    it('should reject geometry without geometry property', () => {
      const invalidFeature = {
        geometry: {
          type: 'Feature',
          properties: { name: 'Invalid' }
        },
        distance: 100
      };
      expect(validate(invalidFeature)).toBe(false);
    });
  });
});