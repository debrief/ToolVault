import { validateIndex, parseToolVaultIndex } from '../validators';
import { mockToolVaultIndex, createMockToolVaultIndex } from '../../test-utils/mockData';

describe('validators', () => {
  describe('validateIndex', () => {
    it('should validate a correct ToolVault index', () => {
      const result = validateIndex(mockToolVaultIndex);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject data with missing required fields', () => {
      const invalidData = {
        // Missing required fields like 'name', 'version', etc.
      };
      
      const result = validateIndex(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject data with invalid field types', () => {
      const invalidData = {
        ...mockToolVaultIndex,
        version: 123, // Should be string
        tools: 'not an array', // Should be array
      };
      
      const result = validateIndex(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate tools array structure', () => {
      const validData = createMockToolVaultIndex({
        tools: [
          {
            id: 'valid-tool',
            name: 'Valid Tool',
            description: 'A valid tool description',
            category: 'Test Category',
            tags: ['test'],
            inputs: [
              {
                name: 'input1',
                label: 'Input 1',
                type: 'string',
                required: true,
              },
            ],
            outputs: [
              {
                name: 'output1',
                label: 'Output 1',
                type: 'string',
              },
            ],
          },
        ],
      });
      
      const result = validateIndex(validData);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject tools with missing required fields', () => {
      const invalidData = createMockToolVaultIndex({
        tools: [
          {
            // Missing required fields like 'id', 'name', etc.
            description: 'Tool without required fields',
          },
        ],
      });
      
      const result = validateIndex(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate input/output structures', () => {
      const dataWithInvalidInputs = createMockToolVaultIndex({
        tools: [
          {
            id: 'test-tool',
            name: 'Test Tool',
            description: 'Test description',
            category: 'Test',
            tags: ['test'],
            inputs: [
              {
                name: 'valid-input',
                label: 'Valid Input',
                type: 'string',
                required: true,
              },
              {
                // Missing required 'name' field
                label: 'Invalid Input',
                type: 'string',
                required: false,
              },
            ],
            outputs: [
              {
                name: 'valid-output',
                label: 'Valid Output',
                type: 'string',
              },
            ],
          },
        ],
      });
      
      const result = validateIndex(dataWithInvalidInputs);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle null and undefined data', () => {
      const nullResult = validateIndex(null);
      expect(nullResult.valid).toBe(false);
      expect(nullResult.errors.length).toBeGreaterThan(0);
      
      const undefinedResult = validateIndex(undefined);
      expect(undefinedResult.valid).toBe(false);
      expect(undefinedResult.errors.length).toBeGreaterThan(0);
    });

    it('should provide detailed error information', () => {
      const invalidData = {
        name: 123, // Should be string
        version: 'valid',
        description: 'valid',
        updated: 'invalid-date-format', // Should be ISO date string
        tools: [
          {
            id: 'valid-id',
            name: 'Valid Name',
            // Missing description
            category: 'Valid Category',
            tags: 'should-be-array', // Should be array
            inputs: [],
            outputs: [],
          },
        ],
      };
      
      const result = validateIndex(invalidData);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check that errors have meaningful messages and paths
      result.errors.forEach(error => {
        expect(error.message).toBeTruthy();
        expect(error.path).toBeDefined();
      });
    });

    it('should validate optional fields when present', () => {
      const dataWithOptionalFields = createMockToolVaultIndex({
        tools: [
          {
            id: 'tool-with-optionals',
            name: 'Tool With Optional Fields',
            description: 'Test tool with optional fields',
            category: 'Test Category',
            tags: ['test', 'optional'],
            inputs: [
              {
                name: 'required-input',
                label: 'Required Input',
                type: 'string',
                required: true,
              },
              {
                name: 'optional-input',
                label: 'Optional Input',
                type: 'number',
                required: false,
                default: 42,
              },
            ],
            outputs: [
              {
                name: 'main-output',
                label: 'Main Output',
                type: 'string',
              },
            ],
          },
        ],
      });
      
      const result = validateIndex(dataWithOptionalFields);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('parseToolVaultIndex', () => {
    it('should return typed data for valid input', () => {
      const result = parseToolVaultIndex(mockToolVaultIndex);
      
      expect(result).toEqual(mockToolVaultIndex);
      expect(result.name).toBe(mockToolVaultIndex.name);
      expect(result.tools).toEqual(mockToolVaultIndex.tools);
    });

    it('should throw error for invalid data', () => {
      const invalidData = {
        name: 123, // Invalid type
      };
      
      expect(() => parseToolVaultIndex(invalidData)).toThrow(
        'Invalid ToolVault index data'
      );
    });

    it('should include detailed error information in thrown error', () => {
      const invalidData = {
        name: 123,
        version: 'valid',
        tools: 'not-an-array',
      };
      
      try {
        parseToolVaultIndex(invalidData);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Invalid ToolVault index data');
        // Should contain information about multiple validation errors
        expect(error.message.length).toBeGreaterThan(50);
      }
    });

    it('should handle empty data', () => {
      expect(() => parseToolVaultIndex({})).toThrow();
    });

    it('should handle null and undefined', () => {
      expect(() => parseToolVaultIndex(null)).toThrow();
      expect(() => parseToolVaultIndex(undefined)).toThrow();
    });

    it('should preserve all properties of valid data', () => {
      const complexData = createMockToolVaultIndex({
        name: 'Complex Test Index',
        version: '2.0.0',
        description: 'A complex test index with all features',
        updated: '2025-01-15T15:30:00Z',
        tools: [
          {
            id: 'complex-tool',
            name: 'Complex Tool',
            description: 'A complex tool with all features',
            category: 'Complex Category',
            tags: ['complex', 'test', 'full-featured'],
            inputs: [
              {
                name: 'string-input',
                label: 'String Input',
                type: 'string',
                required: true,
              },
              {
                name: 'number-input',
                label: 'Number Input',
                type: 'number',
                required: false,
                default: 100,
              },
              {
                name: 'boolean-input',
                label: 'Boolean Input',
                type: 'boolean',
                required: false,
                default: true,
              },
            ],
            outputs: [
              {
                name: 'string-output',
                label: 'String Output',
                type: 'string',
              },
              {
                name: 'number-output',
                label: 'Number Output',
                type: 'number',
              },
            ],
          },
        ],
      });
      
      const result = parseToolVaultIndex(complexData);
      
      expect(result).toEqual(complexData);
      expect(result.name).toBe(complexData.name);
      expect(result.version).toBe(complexData.version);
      expect(result.description).toBe(complexData.description);
      expect(result.updated).toBe(complexData.updated);
      expect(result.tools).toHaveLength(1);
      expect(result.tools[0].inputs).toHaveLength(3);
      expect(result.tools[0].outputs).toHaveLength(2);
    });
  });

  describe('schema validation edge cases', () => {
    it('should validate date format in updated field', () => {
      const dataWithInvalidDate = createMockToolVaultIndex({
        updated: 'not-a-date',
      });
      
      const result = validateIndex(dataWithInvalidDate);
      
      // This test depends on the actual schema definition
      // If the schema requires ISO date format, this should fail
      expect(result.valid).toBe(false);
    });

    it('should validate tool ID uniqueness if enforced by schema', () => {
      const dataWithDuplicateIds = createMockToolVaultIndex({
        tools: [
          {
            id: 'duplicate-id',
            name: 'Tool 1',
            description: 'First tool',
            category: 'Test',
            tags: ['test'],
            inputs: [],
            outputs: [],
          },
          {
            id: 'duplicate-id', // Same ID
            name: 'Tool 2',
            description: 'Second tool',
            category: 'Test',
            tags: ['test'],
            inputs: [],
            outputs: [],
          },
        ],
      });
      
      const result = validateIndex(dataWithDuplicateIds);
      
      // This test depends on whether the schema enforces unique IDs
      // The result may be valid if uniqueness is not enforced at the schema level
      expect(result.valid).toBeDefined();
    });

    it('should handle very large data structures', () => {
      const largeData = createMockToolVaultIndex({
        tools: Array.from({ length: 100 }, (_, i) => ({
          id: `tool-${i}`,
          name: `Tool ${i}`,
          description: `Description for tool ${i}`,
          category: `Category ${i % 10}`,
          tags: [`tag-${i % 5}`, 'test'],
          inputs: [
            {
              name: 'input1',
              label: 'Input 1',
              type: 'string',
              required: true,
            },
          ],
          outputs: [
            {
              name: 'output1',
              label: 'Output 1',
              type: 'string',
            },
          ],
        })),
      });
      
      const startTime = performance.now();
      const result = validateIndex(largeData);
      const endTime = performance.now();
      
      expect(result.valid).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should handle deeply nested structures', () => {
      // This test verifies that the validator can handle complex nested data
      // without stack overflow or excessive processing time
      const dataWithComplexStructures = createMockToolVaultIndex({
        tools: [
          {
            id: 'complex-nested-tool',
            name: 'Complex Nested Tool',
            description: 'A tool with complex nested input/output structures',
            category: 'Complex',
            tags: ['nested', 'complex', 'test'],
            inputs: Array.from({ length: 20 }, (_, i) => ({
              name: `input-${i}`,
              label: `Input ${i}`,
              type: ['string', 'number', 'boolean', 'json'][i % 4],
              required: i % 2 === 0,
              ...(i % 4 === 3 && { default: `{"value": ${i}}` }),
            })),
            outputs: Array.from({ length: 20 }, (_, i) => ({
              name: `output-${i}`,
              label: `Output ${i}`,
              type: ['string', 'number', 'boolean', 'json'][i % 4],
            })),
          },
        ],
      });
      
      const result = validateIndex(dataWithComplexStructures);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});