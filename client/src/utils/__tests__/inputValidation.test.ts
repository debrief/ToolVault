import {
  validateInputs,
  getInputType,
  getInputPlaceholder,
  type ValidationResult,
} from '../inputValidation';
import { createMockToolInput } from '../../test-utils/mockData';
import type { ToolInput } from '../../types/index';

describe('inputValidation', () => {
  describe('validateInputs', () => {
    it('should pass validation for valid required inputs', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({
          name: 'text',
          type: 'string',
          required: true,
        }),
      ];
      
      const values = { text: 'Hello World' };
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing required inputs', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({
          name: 'required_field',
          label: 'Required Field',
          type: 'string',
          required: true,
        }),
      ];
      
      const values = {};
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('required_field');
      expect(result.errors[0].message).toBe('Required Field is required');
    });

    it('should handle null and undefined values for required fields', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({ name: 'null_field', required: true }),
        createMockToolInput({ name: 'undefined_field', required: true }),
        createMockToolInput({ name: 'empty_field', required: true }),
      ];
      
      const values = {
        null_field: null,
        undefined_field: undefined,
        empty_field: '',
      };
      
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });

    it('should skip validation for empty optional fields', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({
          name: 'optional_field',
          type: 'email',
          required: false,
        }),
      ];
      
      const values = { optional_field: '' };
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    describe('type-specific validation', () => {
      it('should validate number inputs', () => {
        const inputs: ToolInput[] = [
          createMockToolInput({ name: 'valid_number', type: 'number' }),
          createMockToolInput({ name: 'invalid_number', type: 'number' }),
        ];
        
        const values = {
          valid_number: '42',
          invalid_number: 'not a number',
        };
        
        const result = validateInputs(inputs, values);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('invalid_number');
        expect(result.errors[0].message).toContain('must be a valid number');
      });

      it('should validate email inputs', () => {
        const inputs: ToolInput[] = [
          createMockToolInput({ name: 'valid_email', type: 'email' }),
          createMockToolInput({ name: 'invalid_email', type: 'email' }),
        ];
        
        const values = {
          valid_email: 'user@example.com',
          invalid_email: 'not-an-email',
        };
        
        const result = validateInputs(inputs, values);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('invalid_email');
        expect(result.errors[0].message).toContain('must be a valid email address');
      });

      it('should validate URL inputs', () => {
        const inputs: ToolInput[] = [
          createMockToolInput({ name: 'valid_url', type: 'url' }),
          createMockToolInput({ name: 'invalid_url', type: 'url' }),
        ];
        
        const values = {
          valid_url: 'https://example.com',
          invalid_url: 'not-a-url',
        };
        
        const result = validateInputs(inputs, values);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('invalid_url');
        expect(result.errors[0].message).toContain('must be a valid URL');
      });

      it('should validate JSON inputs', () => {
        const inputs: ToolInput[] = [
          createMockToolInput({ name: 'valid_json', type: 'json' }),
          createMockToolInput({ name: 'invalid_json', type: 'json' }),
        ];
        
        const values = {
          valid_json: '{"key": "value"}',
          invalid_json: '{invalid json',
        };
        
        const result = validateInputs(inputs, values);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('invalid_json');
        expect(result.errors[0].message).toContain('must be valid JSON');
      });

      it('should validate GeoJSON inputs', () => {
        const inputs: ToolInput[] = [
          createMockToolInput({ name: 'valid_geojson', type: 'geojson' }),
          createMockToolInput({ name: 'invalid_geojson', type: 'geojson' }),
        ];
        
        const values = {
          valid_geojson: '{"type": "Feature", "geometry": null, "properties": {}}',
          invalid_geojson: '{invalid geojson',
        };
        
        const result = validateInputs(inputs, values);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('invalid_geojson');
        expect(result.errors[0].message).toContain('must be valid JSON');
      });

      it('should validate string inputs', () => {
        const inputs: ToolInput[] = [
          createMockToolInput({ name: 'valid_string', type: 'string' }),
          createMockToolInput({ name: 'invalid_string', type: 'string' }),
        ];
        
        const values = {
          valid_string: 'Hello World',
          invalid_string: 123,
        };
        
        const result = validateInputs(inputs, values);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('invalid_string');
        expect(result.errors[0].message).toContain('must be a string');
      });

      it('should handle unknown types gracefully', () => {
        const inputs: ToolInput[] = [
          createMockToolInput({ name: 'unknown_type', type: 'unknown' }),
        ];
        
        const values = { unknown_type: 'any value' };
        const result = validateInputs(inputs, values);
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should use field name as fallback when label is not provided', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({
          name: 'field_without_label',
          label: undefined,
          required: true,
        }),
      ];
      
      const values = {};
      const result = validateInputs(inputs, values);
      
      expect(result.errors[0].message).toBe('field_without_label is required');
    });

    it('should validate multiple inputs and collect all errors', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({ name: 'required_field', required: true }),
        createMockToolInput({ name: 'email_field', type: 'email' }),
        createMockToolInput({ name: 'number_field', type: 'number' }),
      ];
      
      const values = {
        email_field: 'invalid-email',
        number_field: 'not-a-number',
      };
      
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      
      const fieldNames = result.errors.map(e => e.field);
      expect(fieldNames).toContain('required_field');
      expect(fieldNames).toContain('email_field');
      expect(fieldNames).toContain('number_field');
    });

    it('should handle case-insensitive type validation', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({ name: 'upper_type', type: 'EMAIL' }),
        createMockToolInput({ name: 'mixed_type', type: 'NuMbEr' }),
      ];
      
      const values = {
        upper_type: 'invalid-email',
        mixed_type: 'not-a-number',
      };
      
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it('should validate zero as a valid number', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({ name: 'zero_number', type: 'number' }),
      ];
      
      const values = { zero_number: '0' };
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(true);
    });

    it('should validate negative numbers', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({ name: 'negative_number', type: 'number' }),
      ];
      
      const values = { negative_number: '-42' };
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(true);
    });

    it('should validate decimal numbers', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({ name: 'decimal_number', type: 'number' }),
      ];
      
      const values = { decimal_number: '3.14' };
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('getInputType', () => {
    it('should return correct HTML input types', () => {
      expect(getInputType('number')).toBe('number');
      expect(getInputType('email')).toBe('email');
      expect(getInputType('url')).toBe('url');
      expect(getInputType('password')).toBe('password');
      expect(getInputType('date')).toBe('date');
      expect(getInputType('time')).toBe('time');
      expect(getInputType('datetime-local')).toBe('datetime-local');
    });

    it('should return textarea for complex types', () => {
      expect(getInputType('json')).toBe('textarea');
      expect(getInputType('geojson')).toBe('textarea');
    });

    it('should return text for unknown types', () => {
      expect(getInputType('string')).toBe('text');
      expect(getInputType('unknown')).toBe('text');
      expect(getInputType('')).toBe('text');
    });

    it('should handle case-insensitive type matching', () => {
      expect(getInputType('EMAIL')).toBe('email');
      expect(getInputType('NuMbEr')).toBe('number');
      expect(getInputType('JSON')).toBe('textarea');
    });
  });

  describe('getInputPlaceholder', () => {
    it('should return type-specific placeholders', () => {
      const emailInput = createMockToolInput({ name: 'email', type: 'email' });
      expect(getInputPlaceholder(emailInput)).toBe('user@example.com');
      
      const urlInput = createMockToolInput({ name: 'url', type: 'url' });
      expect(getInputPlaceholder(urlInput)).toBe('https://example.com');
      
      const numberInput = createMockToolInput({ name: 'number', type: 'number' });
      expect(getInputPlaceholder(numberInput)).toBe('Enter a number');
      
      const jsonInput = createMockToolInput({ name: 'json', type: 'json' });
      expect(getInputPlaceholder(jsonInput)).toBe('{"key": "value"}');
      
      const geojsonInput = createMockToolInput({ name: 'geojson', type: 'geojson' });
      expect(getInputPlaceholder(geojsonInput)).toBe('{"type": "Feature", "geometry": {...}, "properties": {...}}');
    });

    it('should use label in placeholder when provided', () => {
      const input = createMockToolInput({
        name: 'field_name',
        label: 'Field Label',
        type: 'string',
      });
      
      expect(getInputPlaceholder(input)).toBe('Enter Field Label');
    });

    it('should use field name as fallback when label is not provided', () => {
      const input = createMockToolInput({
        name: 'field_name',
        label: undefined,
        type: 'string',
      });
      
      expect(getInputPlaceholder(input)).toBe('Enter field_name');
    });

    it('should handle unknown types with generic placeholder', () => {
      const input = createMockToolInput({
        name: 'unknown_field',
        label: 'Unknown Field',
        type: 'unknown',
      });
      
      expect(getInputPlaceholder(input)).toBe('Enter Unknown Field');
    });

    it('should handle case-insensitive type matching', () => {
      const input = createMockToolInput({
        name: 'email',
        type: 'EMAIL',
      });
      
      expect(getInputPlaceholder(input)).toBe('user@example.com');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input arrays', () => {
      const result = validateInputs([], {});
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle inputs with special characters in names', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({
          name: 'field-with-dashes',
          label: 'Field With Dashes',
          required: true,
        }),
        createMockToolInput({
          name: 'field_with_underscores',
          label: 'Field With Underscores',
          required: true,
        }),
      ];
      
      const values = {};
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].message).toBe('Field With Dashes is required');
      expect(result.errors[1].message).toBe('Field With Underscores is required');
    });

    it('should handle very long email addresses', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({ name: 'long_email', type: 'email' }),
      ];
      
      const longEmail = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.com';
      const values = { long_email: longEmail };
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(true);
    });

    it('should handle complex JSON structures', () => {
      const inputs: ToolInput[] = [
        createMockToolInput({ name: 'complex_json', type: 'json' }),
      ];
      
      const complexJson = JSON.stringify({
        nested: {
          object: {
            with: ['arrays', 'and', { more: 'objects' }],
          },
        },
        numbers: [1, 2, 3.14, -42],
        booleans: [true, false],
        nullValue: null,
      });
      
      const values = { complex_json: complexJson };
      const result = validateInputs(inputs, values);
      
      expect(result.isValid).toBe(true);
    });
  });
});