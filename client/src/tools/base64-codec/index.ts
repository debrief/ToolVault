/**
 * Base64 Encoder/Decoder Tool
 * 
 * Encodes text to Base64 or decodes Base64 to text.
 * Handles both operations with proper error handling and validation.
 */

import { ToolValidationError } from '../types';

// Type definitions for this tool
export interface Base64CodecInput {
  text: string;
  operation: 'encode' | 'decode';
  urlSafe?: boolean;
}

export interface Base64CodecOutput {
  input: string;
  output: string;
  operation: 'encode' | 'decode';
  inputLength: number;
  outputLength: number;
  urlSafe?: boolean;
}

/**
 * Input validation for Base64 codec tool
 */
function isBase64CodecInput(input: any): input is Base64CodecInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  
  if (typeof input.text !== 'string') {
    return false;
  }
  
  if (input.operation !== 'encode' && input.operation !== 'decode') {
    return false;
  }
  
  if (input.urlSafe !== undefined && typeof input.urlSafe !== 'boolean') {
    return false;
  }
  
  return true;
}

/**
 * Check if a string is valid Base64
 */
function isValidBase64(str: string): boolean {
  // Basic Base64 pattern (standard or URL-safe)
  const base64Pattern = /^[A-Za-z0-9+/\-_]*={0,2}$/;
  
  if (!base64Pattern.test(str)) {
    return false;
  }
  
  // Check padding
  const padding = str.match(/=*$/)?.[0] || '';
  if (padding.length > 2) {
    return false;
  }
  
  // Check if length is valid (must be multiple of 4 when padded)
  const withoutPadding = str.replace(/=/g, '');
  const expectedLength = Math.ceil(withoutPadding.length / 4) * 4;
  return str.length === expectedLength;
}

/**
 * Convert between standard and URL-safe Base64
 */
function convertBase64Variant(base64: string, toUrlSafe: boolean): string {
  if (toUrlSafe) {
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } else {
    // Add back padding if needed
    let result = base64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding
    while (result.length % 4) {
      result += '=';
    }
    
    return result;
  }
}

/**
 * Main tool execution function
 */
export default function run(input: Base64CodecInput): Base64CodecOutput {
  // Validate input
  if (!isBase64CodecInput(input)) {
    throw new ToolValidationError('Invalid input: expected object with text (string), operation ("encode" or "decode"), and optional urlSafe (boolean)');
  }

  const { text, operation, urlSafe = false } = input;

  try {
    let output: string;
    
    if (operation === 'encode') {
      // Encode text to Base64 (handle Unicode properly)
      try {
        // Use unescape/encodeURIComponent for Unicode handling
        const utf8Text = unescape(encodeURIComponent(text));
        output = btoa(utf8Text);
        
        if (urlSafe) {
          output = convertBase64Variant(output, true);
        }
      } catch (error) {
        throw new ToolValidationError('Failed to encode text: contains invalid characters');
      }
    } else {
      // Decode Base64 to text
      let base64ToDecode = text;
      
      // Handle both URL-safe and standard Base64
      if (urlSafe || text.includes('-') || text.includes('_')) {
        base64ToDecode = convertBase64Variant(text, false);
      }
      
      // Validate Base64 format
      if (!isValidBase64(base64ToDecode)) {
        throw new ToolValidationError('Invalid Base64 format');
      }
      
      try {
        const binaryString = atob(base64ToDecode);
        // Decode UTF-8 properly
        output = decodeURIComponent(escape(binaryString));
      } catch (error) {
        throw new ToolValidationError('Failed to decode Base64: invalid format or corrupted data');
      }
    }
    
    return {
      input: text,
      output,
      operation,
      inputLength: text.length,
      outputLength: output.length,
      urlSafe: urlSafe || undefined
    };
  } catch (error) {
    if (error instanceof ToolValidationError) {
      throw error;
    }
    throw new Error(`Base64 ${operation} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Input validation function
 */
export function validate(input: any): input is Base64CodecInput {
  return isBase64CodecInput(input);
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
  text: 'Hello, World! This is a sample text that will be encoded to Base64. It contains special characters: !@#$%^&*() and unicode: 世界 🌍',
  operation: 'encode' as const,
  urlSafe: false
};