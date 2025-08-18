/**
 * Tests for hash-generator tool
 */

import run, { validate, HashGeneratorInput } from '../index';
import { ToolValidationError } from '../../types';

// Mock crypto.subtle for Node.js testing environment
const mockCrypto = {
  subtle: {
    digest: jest.fn().mockImplementation((algorithm: string, data: Uint8Array) => {
      // Simple mock implementation that returns predictable hashes
      const text = String.fromCharCode(...Array.from(data));
      let hashHex = '';
      
      if (algorithm === 'SHA-1') {
        // Mock SHA-1 hash (40 characters)
        hashHex = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';
      } else if (algorithm === 'SHA-256') {
        // Mock SHA-256 hash (64 characters)
        hashHex = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      }
      
      // Modify based on input for some variety
      if (text.length > 0) {
        const variation = text.charCodeAt(0).toString(16).padStart(2, '0');
        hashHex = variation.repeat(Math.ceil(hashHex.length / variation.length)).substring(0, hashHex.length);
      }
      
      // Convert hex string to ArrayBuffer
      const bytes = new Uint8Array(hashHex.length / 2);
      for (let i = 0; i < hashHex.length; i += 2) {
        bytes[i / 2] = parseInt(hashHex.substr(i, 2), 16);
      }
      
      return Promise.resolve(bytes.buffer);
    })
  }
};

// Override global crypto for testing
Object.defineProperty(globalThis, 'crypto', {
  value: mockCrypto,
  writable: true
});

describe('hash-generator tool', () => {
  describe('run function', () => {
    it('should generate hashes for text input', async () => {
      const input = {
        text: 'hello world',
        algorithms: ['md5', 'sha1', 'sha256']
      };
      
      const result = await run(input);
      
      expect(result.original).toBe('hello world');
      expect(result.length).toBe(11);
      expect(result.hashes).toHaveProperty('md5');
      expect(result.hashes).toHaveProperty('sha1');
      expect(result.hashes).toHaveProperty('sha256');
      expect(typeof result.hashes.md5).toBe('string');
      expect(typeof result.hashes.sha1).toBe('string');
      expect(typeof result.hashes.sha256).toBe('string');
    });

    it('should use default algorithms when not specified', async () => {
      const input = {
        text: 'test'
      };
      
      const result = await run(input);
      
      expect(result.hashes).toHaveProperty('md5');
      expect(result.hashes).toHaveProperty('sha1');
      expect(result.hashes).toHaveProperty('sha256');
    });

    it('should handle single algorithm', async () => {
      const input = {
        text: 'test',
        algorithms: ['md5']
      };
      
      const result = await run(input);
      
      expect(result.hashes).toHaveProperty('md5');
      expect(result.hashes).not.toHaveProperty('sha1');
      expect(result.hashes).not.toHaveProperty('sha256');
    });

    it('should handle empty string', async () => {
      const input = {
        text: '',
        algorithms: ['md5']
      };
      
      const result = await run(input);
      
      expect(result.original).toBe('');
      expect(result.length).toBe(0);
      expect(result.hashes).toHaveProperty('md5');
    });

    it('should generate different hashes for different inputs', async () => {
      const input1 = { text: 'hello', algorithms: ['md5'] };
      const input2 = { text: 'world', algorithms: ['md5'] };
      
      const result1 = await run(input1);
      const result2 = await run(input2);
      
      expect(result1.hashes.md5).not.toBe(result2.hashes.md5);
    });

    it('should generate consistent hashes for same input', async () => {
      const input = { text: 'consistent', algorithms: ['md5'] };
      
      const result1 = await run(input);
      const result2 = await run(input);
      
      expect(result1.hashes.md5).toBe(result2.hashes.md5);
    });

    it('should handle case-sensitive algorithms', async () => {
      const input = {
        text: 'test',
        algorithms: ['MD5', 'SHA1', 'SHA256']
      };
      
      const result = await run(input);
      
      expect(result.hashes).toHaveProperty('md5');
      expect(result.hashes).toHaveProperty('sha1');
      expect(result.hashes).toHaveProperty('sha256');
    });

    it('should calculate correct text length', async () => {
      const text = 'Hello, 世界! 🌍';
      const input = { text, algorithms: ['md5'] };
      
      const result = await run(input);
      
      expect(result.length).toBe(text.length);
    });

    it('should throw validation error for invalid input', async () => {
      await expect(run({ notText: 'hello' } as any)).rejects.toThrow(ToolValidationError);
      await expect(run(null as any)).rejects.toThrow(ToolValidationError);
      await expect(run({ text: 123 } as any)).rejects.toThrow(ToolValidationError);
    });

    it('should throw validation error for invalid algorithms', async () => {
      await expect(run({ text: 'hello', algorithms: ['invalid'] } as any)).rejects.toThrow(ToolValidationError);
      await expect(run({ text: 'hello', algorithms: 'not array' } as any)).rejects.toThrow(ToolValidationError);
      await expect(run({ text: 'hello', algorithms: [123] } as any)).rejects.toThrow(ToolValidationError);
    });

    it('should handle special characters and unicode', async () => {
      const input = {
        text: '!@#$%^&*(){}[]|\\:";\'<>?,./ 世界 🌍',
        algorithms: ['md5']
      };
      
      const result = await run(input);
      
      expect(result.original).toBe(input.text);
      expect(typeof result.hashes.md5).toBe('string');
      expect(result.hashes.md5.length).toBe(32);
    });
  });

  describe('validate function', () => {
    it('should validate correct input', () => {
      expect(validate({ text: 'hello' })).toBe(true);
      expect(validate({ text: 'hello', algorithms: ['md5'] })).toBe(true);
      expect(validate({ text: '', algorithms: ['md5', 'sha1', 'sha256'] })).toBe(true);
    });

    it('should reject invalid input', () => {
      expect(validate(null)).toBe(false);
      expect(validate(undefined)).toBe(false);
      expect(validate({ notText: 'hello' })).toBe(false);
      expect(validate({ text: 123 })).toBe(false);
      expect(validate({ text: 'hello', algorithms: 'not array' })).toBe(false);
      expect(validate({ text: 'hello', algorithms: ['invalid'] })).toBe(false);
    });
  });
});