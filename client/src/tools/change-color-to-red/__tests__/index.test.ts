/**
 * Tests for change-color-to-red tool
 */

import run, { validate } from '../index';
import { ToolValidationError } from '../../types';

describe('change-color-to-red tool', () => {
  describe('run function', () => {
    it('should replace color words with red styling', () => {
      const input = { text: 'The sky is blue and the grass is green' };
      const result = run(input);
      
      expect(result.html).toContain('<span style="color: red; font-weight: bold;">red</span>');
      expect(result.colorChanges).toBe(2);
      expect(result.originalText).toBe('The sky is blue and the grass is green');
    });

    it('should handle text with no color words', () => {
      const input = { text: 'Hello world test' };
      const result = run(input);
      
      expect(result.html).toBe('Hello world test');
      expect(result.colorChanges).toBe(0);
      expect(result.originalText).toBe('Hello world test');
    });

    it('should handle empty string', () => {
      const input = { text: '' };
      const result = run(input);
      
      expect(result.html).toBe('');
      expect(result.colorChanges).toBe(0);
      expect(result.originalText).toBe('');
    });

    it('should handle case-insensitive matching', () => {
      const input = { text: 'The BLUE car and the Green house' };
      const result = run(input);
      
      expect(result.colorChanges).toBe(2);
      expect(result.html).toContain('<span style="color: red; font-weight: bold;">red</span>');
    });

    it('should only match whole words', () => {
      const input = { text: 'The blueprint contains blue ink' };
      const result = run(input);
      
      // Should only match "blue", not "blueprint"
      expect(result.colorChanges).toBe(1);
    });

    it('should handle multiple occurrences of the same color', () => {
      const input = { text: 'blue blue blue' };
      const result = run(input);
      
      expect(result.colorChanges).toBe(3);
    });

    it('should handle mixed colors', () => {
      const input = { text: 'red blue green yellow purple orange' };
      const result = run(input);
      
      // "red" won't be changed since it's already red, but the others will be
      expect(result.colorChanges).toBe(5); // blue, green, yellow, purple, orange
    });

    it('should throw validation error for invalid input', () => {
      expect(() => run({ notText: 'hello' } as any)).toThrow(ToolValidationError);
      expect(() => run(null as any)).toThrow(ToolValidationError);
      expect(() => run(undefined as any)).toThrow(ToolValidationError);
    });

    it('should throw validation error for non-string text', () => {
      expect(() => run({ text: 123 } as any)).toThrow(ToolValidationError);
    });
  });

  describe('validate function', () => {
    it('should validate correct input', () => {
      expect(validate({ text: 'hello world' })).toBe(true);
      expect(validate({ text: '' })).toBe(true);
    });

    it('should reject invalid input', () => {
      expect(validate(null)).toBe(false);
      expect(validate(undefined)).toBe(false);
      expect(validate({ notText: 'hello' })).toBe(false);
      expect(validate({ text: 123 })).toBe(false);
      expect(validate('string')).toBe(false);
    });
  });
});