/**
 * Tests for word-count tool
 */

import run, { validate } from '../index';
import { ToolValidationError } from '../../types';

describe('word-count tool', () => {
  describe('run function', () => {
    it('should count words correctly', () => {
      const input = { text: 'Hello world test' };
      const result = run(input);
      
      expect(result.count).toBe(3);
      expect(result.words).toEqual(['Hello', 'world', 'test']);
    });

    it('should handle empty string', () => {
      const input = { text: '' };
      const result = run(input);
      
      expect(result.count).toBe(0);
      expect(result.words).toEqual([]);
      expect(result.characters).toBe(0);
      expect(result.charactersNoSpaces).toBe(0);
    });

    it('should handle whitespace only', () => {
      const input = { text: '   \n\t  ' };
      const result = run(input);
      
      expect(result.count).toBe(0);
      expect(result.words).toEqual([]);
    });

    it('should count characters correctly', () => {
      const input = { text: 'Hello world!' };
      const result = run(input);
      
      expect(result.characters).toBe(12);
      expect(result.charactersNoSpaces).toBe(11);
    });

    it('should count sentences correctly', () => {
      const input = { text: 'Hello world! How are you? I am fine.' };
      const result = run(input);
      
      expect(result.sentences).toBe(3);
    });

    it('should handle multiple whitespace between words', () => {
      const input = { text: 'Hello    world   test' };
      const result = run(input);
      
      expect(result.count).toBe(3);
      expect(result.words).toEqual(['Hello', 'world', 'test']);
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