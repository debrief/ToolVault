/**
 * Tests for json-validator tool
 */

import run, { validate, JsonValidatorInput } from '../index';
import { ToolValidationError } from '../../types';

describe('json-validator tool', () => {
  describe('run function', () => {
    it('should validate and format valid JSON', () => {
      const input = {
        jsonString: '{"name":"John","age":30}',
        indent: 2
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('{\n  "name": "John",\n  "age": 30\n}');
      expect(result.type).toBe('object');
      expect(result.properties).toContain('name');
      expect(result.properties).toContain('age');
      expect(result.size).toBe(input.jsonString.length);
      expect(result.error).toBeUndefined();
    });

    it('should handle arrays', () => {
      const input = {
        jsonString: '[1,2,3]'
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('array');
      expect(result.properties).toContain('[3 items]');
    });

    it('should handle primitive values', () => {
      const input = {
        jsonString: '"hello world"'
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('string');
      expect(result.formatted).toBe('"hello world"');
    });

    it('should handle null values', () => {
      const input = {
        jsonString: 'null'
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('null');
      expect(result.formatted).toBe('null');
    });

    it('should handle boolean values', () => {
      const input = {
        jsonString: 'true'
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('boolean');
      expect(result.formatted).toBe('true');
    });

    it('should handle numbers', () => {
      const input = {
        jsonString: '42.5'
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('number');
      expect(result.formatted).toBe('42.5');
    });

    it('should detect invalid JSON syntax', () => {
      const input = {
        jsonString: '{"name": "John", "age": 30'  // Missing closing brace
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.type).toBe('invalid');
      expect(result.formatted).toBeUndefined();
    });

    it('should detect invalid JSON with trailing comma', () => {
      const input = {
        jsonString: '{"name": "John", "age": 30,}'
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle different indentation levels', () => {
      const input = {
        jsonString: '{"name":"John","nested":{"value":123}}',
        indent: 4
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.formatted).toContain('    '); // 4 spaces
      expect(result.properties).toContain('name');
      expect(result.properties).toContain('nested');
    });

    it('should extract nested properties', () => {
      const input = {
        jsonString: '{"user":{"profile":{"name":"John"}},"settings":{"theme":"dark"}}'
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.properties).toContain('user');
      expect(result.properties).toContain('settings');
      expect(result.properties).toContain('user.profile');
      expect(result.properties).toContain('settings.theme');
    });

    it('should handle arrays with objects', () => {
      const input = {
        jsonString: '[{"id":1,"name":"Item 1"},{"id":2,"name":"Item 2"}]'
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('array');
      expect(result.properties).toContain('[2 items]');
      expect(result.properties).toContain('items.id');
      expect(result.properties).toContain('items.name');
    });

    it('should calculate correct size', () => {
      const jsonString = '{"test": "value"}';
      const input = { jsonString };
      
      const result = run(input);
      
      expect(result.size).toBe(jsonString.length);
    });

    it('should use default indent when not specified', () => {
      const input = {
        jsonString: '{"name":"John"}'
      };
      
      const result = run(input);
      
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('{\n  "name": "John"\n}'); // 2 spaces default
    });

    it('should throw validation error for invalid input', () => {
      expect(() => run({ notJsonString: 'hello' } as any)).toThrow(ToolValidationError);
      expect(() => run(null as any)).toThrow(ToolValidationError);
      expect(() => run({ jsonString: 123 } as any)).toThrow(ToolValidationError);
    });

    it('should throw validation error for invalid indent', () => {
      expect(() => run({ jsonString: '{}', indent: -1 } as any)).toThrow(ToolValidationError);
      expect(() => run({ jsonString: '{}', indent: 11 } as any)).toThrow(ToolValidationError);
      expect(() => run({ jsonString: '{}', indent: 'not a number' } as any)).toThrow(ToolValidationError);
    });
  });

  describe('validate function', () => {
    it('should validate correct input', () => {
      expect(validate({ jsonString: '{}' })).toBe(true);
      expect(validate({ jsonString: '{}', indent: 2 })).toBe(true);
      expect(validate({ jsonString: '{}', indent: 0 })).toBe(true);
    });

    it('should reject invalid input', () => {
      expect(validate(null)).toBe(false);
      expect(validate(undefined)).toBe(false);
      expect(validate({ notJsonString: 'hello' })).toBe(false);
      expect(validate({ jsonString: 123 })).toBe(false);
      expect(validate({ jsonString: '{}', indent: -1 })).toBe(false);
      expect(validate({ jsonString: '{}', indent: 11 })).toBe(false);
    });
  });
});