/**
 * Tests for base64-codec tool
 */

import run, { validate, Base64CodecInput } from '../index';
import { ToolValidationError } from '../../types';

describe('base64-codec tool', () => {
  describe('run function - encoding', () => {
    it('should encode text to Base64', () => {
      const input = {
        text: 'Hello, World!',
        operation: 'encode' as const
      };
      
      const result = run(input);
      
      expect(result.input).toBe('Hello, World!');
      expect(result.output).toBe('SGVsbG8sIFdvcmxkIQ==');
      expect(result.operation).toBe('encode');
      expect(result.inputLength).toBe(13);
      expect(result.outputLength).toBe(20);
    });

    it('should encode empty string', () => {
      const input = {
        text: '',
        operation: 'encode' as const
      };
      
      const result = run(input);
      
      expect(result.input).toBe('');
      expect(result.output).toBe('');
      expect(result.operation).toBe('encode');
    });

    it('should encode special characters', () => {
      const input = {
        text: '!@#$%^&*()',
        operation: 'encode' as const
      };
      
      const result = run(input);
      
      expect(result.input).toBe('!@#$%^&*()');
      expect(typeof result.output).toBe('string');
      expect(result.output.length).toBeGreaterThan(0);
    });

    it('should encode Unicode characters', () => {
      const input = {
        text: 'Hello 世界 🌍',
        operation: 'encode' as const
      };
      
      const result = run(input);
      
      expect(result.input).toBe('Hello 世界 🌍');
      expect(typeof result.output).toBe('string');
      expect(result.output.length).toBeGreaterThan(0);
    });

    it('should encode to URL-safe Base64', () => {
      const input = {
        text: 'Hello, World!',
        operation: 'encode' as const,
        urlSafe: true
      };
      
      const result = run(input);
      
      expect(result.input).toBe('Hello, World!');
      expect(result.output).toBe('SGVsbG8sIFdvcmxkIQ'); // No padding in URL-safe
      expect(result.urlSafe).toBe(true);
      expect(result.output).not.toContain('=');
      expect(result.output).not.toContain('+');
      expect(result.output).not.toContain('/');
    });
  });

  describe('run function - decoding', () => {
    it('should decode Base64 to text', () => {
      const input = {
        text: 'SGVsbG8sIFdvcmxkIQ==',
        operation: 'decode' as const
      };
      
      const result = run(input);
      
      expect(result.input).toBe('SGVsbG8sIFdvcmxkIQ==');
      expect(result.output).toBe('Hello, World!');
      expect(result.operation).toBe('decode');
      expect(result.inputLength).toBe(20);
      expect(result.outputLength).toBe(13);
    });

    it('should decode empty Base64', () => {
      const input = {
        text: '',
        operation: 'decode' as const
      };
      
      const result = run(input);
      
      expect(result.input).toBe('');
      expect(result.output).toBe('');
      expect(result.operation).toBe('decode');
    });

    it('should decode URL-safe Base64', () => {
      const input = {
        text: 'SGVsbG8sIFdvcmxkIQ', // URL-safe without padding
        operation: 'decode' as const,
        urlSafe: true
      };
      
      const result = run(input);
      
      expect(result.input).toBe('SGVsbG8sIFdvcmxkIQ');
      expect(result.output).toBe('Hello, World!');
      expect(result.urlSafe).toBe(true);
    });

    it('should auto-detect URL-safe Base64', () => {
      const input = {
        text: 'aGVsbG8tV29ybGRf', // Contains URL-safe characters
        operation: 'decode' as const
      };
      
      const result = run(input);
      
      expect(typeof result.output).toBe('string');
    });

    it('should throw error for invalid Base64', () => {
      const input = {
        text: 'invalid base64!',
        operation: 'decode' as const
      };
      
      expect(() => run(input)).toThrow(ToolValidationError);
    });

    it('should throw error for corrupted Base64', () => {
      const input = {
        text: 'SGVsbG8=invalid',
        operation: 'decode' as const
      };
      
      expect(() => run(input)).toThrow(ToolValidationError);
    });
  });

  describe('round-trip encoding/decoding', () => {
    it('should preserve data through encode-decode cycle', () => {
      const originalText = 'This is a test message with special chars: !@#$%';
      
      // Encode
      const encodeResult = run({
        text: originalText,
        operation: 'encode'
      });
      
      // Decode
      const decodeResult = run({
        text: encodeResult.output,
        operation: 'decode'
      });
      
      expect(decodeResult.output).toBe(originalText);
    });

    it('should preserve Unicode through encode-decode cycle', () => {
      const originalText = 'Hello 世界 🌍 नमस्ते';
      
      // Encode
      const encodeResult = run({
        text: originalText,
        operation: 'encode'
      });
      
      // Decode
      const decodeResult = run({
        text: encodeResult.output,
        operation: 'decode'
      });
      
      expect(decodeResult.output).toBe(originalText);
    });

    it('should preserve data through URL-safe encode-decode cycle', () => {
      const originalText = 'URL-safe test with special characters: +=//==';
      
      // Encode
      const encodeResult = run({
        text: originalText,
        operation: 'encode',
        urlSafe: true
      });
      
      // Decode
      const decodeResult = run({
        text: encodeResult.output,
        operation: 'decode',
        urlSafe: true
      });
      
      expect(decodeResult.output).toBe(originalText);
    });
  });

  describe('validation', () => {
    it('should throw validation error for invalid input', () => {
      expect(() => run({ notText: 'hello' } as any)).toThrow(ToolValidationError);
      expect(() => run(null as any)).toThrow(ToolValidationError);
      expect(() => run({ text: 123 } as any)).toThrow(ToolValidationError);
    });

    it('should throw validation error for invalid operation', () => {
      expect(() => run({ text: 'hello', operation: 'invalid' } as any)).toThrow(ToolValidationError);
      expect(() => run({ text: 'hello', operation: 123 } as any)).toThrow(ToolValidationError);
    });

    it('should throw validation error for invalid urlSafe', () => {
      expect(() => run({ text: 'hello', operation: 'encode', urlSafe: 'not boolean' } as any)).toThrow(ToolValidationError);
    });
  });

  describe('validate function', () => {
    it('should validate correct input', () => {
      expect(validate({ text: 'hello', operation: 'encode' })).toBe(true);
      expect(validate({ text: 'SGVsbG8=', operation: 'decode' })).toBe(true);
      expect(validate({ text: 'hello', operation: 'encode', urlSafe: true })).toBe(true);
      expect(validate({ text: 'hello', operation: 'encode', urlSafe: false })).toBe(true);
    });

    it('should reject invalid input', () => {
      expect(validate(null)).toBe(false);
      expect(validate(undefined)).toBe(false);
      expect(validate({ notText: 'hello' })).toBe(false);
      expect(validate({ text: 123 })).toBe(false);
      expect(validate({ text: 'hello', operation: 'invalid' })).toBe(false);
      expect(validate({ text: 'hello', operation: 'encode', urlSafe: 'not boolean' })).toBe(false);
    });
  });
});