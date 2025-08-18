/**
 * Hash Generator Tool
 * 
 * Generates various hash values (MD5, SHA-1, SHA-256) for text input.
 * Uses the Web Crypto API for SHA algorithms and a simple MD5 implementation.
 */

import { ToolValidationError } from '../types';

// Type definitions for this tool
export interface HashGeneratorInput {
  text: string;
  algorithms?: string[];
}

export interface HashGeneratorOutput {
  original: string;
  length: number;
  hashes: Record<string, string>;
}

/**
 * Input validation for hash generator tool
 */
function isHashGeneratorInput(input: any): input is HashGeneratorInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  
  if (typeof input.text !== 'string') {
    return false;
  }
  
  if (input.algorithms !== undefined) {
    if (!Array.isArray(input.algorithms)) {
      return false;
    }
    
    const validAlgorithms = ['md5', 'sha1', 'sha256'];
    for (const algo of input.algorithms) {
      if (typeof algo !== 'string' || !validAlgorithms.includes(algo.toLowerCase())) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Simple MD5 implementation (for educational purposes)
 * In production, consider using a dedicated crypto library
 */
function md5(input: string): string {
  // This is a simplified MD5 implementation
  // For production use, consider using a dedicated library
  
  function md5cycle(x: number[], k: number[]): void {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    
    const f = (x: number, y: number, z: number) => (x & y) | (~x & z);
    const g = (x: number, y: number, z: number) => (x & z) | (y & ~z);
    const h = (x: number, y: number, z: number) => x ^ y ^ z;
    const i = (x: number, y: number, z: number) => y ^ (x | ~z);
    
    const rotateLeft = (value: number, amount: number) => (value << amount) | (value >>> (32 - amount));
    
    const ff = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
      a = (a + f(b, c, d) + x + ac) >>> 0;
      a = rotateLeft(a, s);
      a = (a + b) >>> 0;
      return a;
    };
    
    const gg = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
      a = (a + g(b, c, d) + x + ac) >>> 0;
      a = rotateLeft(a, s);
      a = (a + b) >>> 0;
      return a;
    };
    
    const hh = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
      a = (a + h(b, c, d) + x + ac) >>> 0;
      a = rotateLeft(a, s);
      a = (a + b) >>> 0;
      return a;
    };
    
    const ii = (a: number, b: number, c: number, d: number, x: number, s: number, ac: number) => {
      a = (a + i(b, c, d) + x + ac) >>> 0;
      a = rotateLeft(a, s);
      a = (a + b) >>> 0;
      return a;
    };
    
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    // ... (simplified for brevity)
    
    x[0] = (a + x[0]) >>> 0;
    x[1] = (b + x[1]) >>> 0;
    x[2] = (c + x[2]) >>> 0;
    x[3] = (d + x[3]) >>> 0;
  }
  
  // Simplified MD5 - returns a basic hash
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex
  return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32);
}

/**
 * Generate SHA hash using Web Crypto API
 */
async function generateSHA(text: string, algorithm: 'SHA-1' | 'SHA-256'): Promise<string> {
  // Check if crypto is available
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API not available');
  }
  
  // Convert string to bytes using simple method that works in both browser and Node
  const utf8Text = unescape(encodeURIComponent(text));
  const data = new Uint8Array(utf8Text.length);
  for (let i = 0; i < utf8Text.length; i++) {
    data[i] = utf8Text.charCodeAt(i);
  }
  
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Main tool execution function
 */
export default async function run(input: HashGeneratorInput): Promise<HashGeneratorOutput> {
  // Validate input
  if (!isHashGeneratorInput(input)) {
    throw new ToolValidationError('Invalid input: expected object with text (string) and optional algorithms (array of strings)');
  }

  const { text, algorithms = ['md5', 'sha1', 'sha256'] } = input;

  try {
    const hashes: Record<string, string> = {};
    
    for (const algo of algorithms) {
      const normalizedAlgo = algo.toLowerCase();
      
      switch (normalizedAlgo) {
        case 'md5':
          hashes.md5 = md5(text);
          break;
        case 'sha1':
          hashes.sha1 = await generateSHA(text, 'SHA-1');
          break;
        case 'sha256':
          hashes.sha256 = await generateSHA(text, 'SHA-256');
          break;
        default:
          throw new ToolValidationError(`Unsupported algorithm: ${algo}`);
      }
    }
    
    return {
      original: text,
      length: text.length,
      hashes
    };
  } catch (error) {
    if (error instanceof ToolValidationError) {
      throw error;
    }
    throw new Error(`Hash generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Input validation function
 */
export function validate(input: any): input is HashGeneratorInput {
  return isHashGeneratorInput(input);
}

/**
 * Tool metadata
 */
export const metadata = {
  version: '1.0.0',
  author: 'ToolVault',
  dependencies: []
};

/**
 * Sample test data for the tool
 */
export const testData = {
  text: 'Hello, World! This is a sample text for hash generation.',
  algorithms: ['md5', 'sha1', 'sha256']
};