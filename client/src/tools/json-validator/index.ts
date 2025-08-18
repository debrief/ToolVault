/**
 * JSON Validator Tool
 * 
 * Validates JSON syntax, formats it, and provides detailed error information.
 * Useful for checking and cleaning up JSON data.
 */

import { ToolValidationError } from '../types';

// Type definitions for this tool
export interface JsonValidatorInput {
  jsonString: string;
  indent?: number;
}

export interface JsonValidatorOutput {
  isValid: boolean;
  formatted?: string;
  error?: string;
  errorLine?: number;
  errorColumn?: number;
  size: number;
  properties?: string[];
  type: string;
}

/**
 * Input validation for JSON validator tool
 */
function isJsonValidatorInput(input: any): input is JsonValidatorInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  
  if (typeof input.jsonString !== 'string') {
    return false;
  }
  
  if (input.indent !== undefined && (typeof input.indent !== 'number' || input.indent < 0 || input.indent > 10)) {
    return false;
  }
  
  return true;
}

/**
 * Extract properties from an object
 */
function extractProperties(obj: any, maxDepth = 2, currentDepth = 0): string[] {
  if (currentDepth >= maxDepth || typeof obj !== 'object' || obj === null) {
    return [];
  }
  
  const properties: string[] = [];
  
  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      properties.push(`[${obj.length} items]`);
      // Sample first item properties
      const firstItem = obj[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        const subProps = extractProperties(firstItem, maxDepth, currentDepth + 1);
        properties.push(...subProps.map(prop => `items.${prop}`));
      }
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      properties.push(key);
      if (typeof value === 'object' && value !== null && currentDepth < maxDepth - 1) {
        const subProps = extractProperties(value, maxDepth, currentDepth + 1);
        properties.push(...subProps.map(prop => `${key}.${prop}`));
      }
    }
  }
  
  return properties.slice(0, 50); // Limit to prevent huge output
}

/**
 * Get the type of a parsed JSON value
 */
function getJsonType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Main tool execution function
 */
export default function run(input: JsonValidatorInput): JsonValidatorOutput {
  // Validate input
  if (!isJsonValidatorInput(input)) {
    throw new ToolValidationError('Invalid input: expected object with jsonString (string) and optional indent (number 0-10)');
  }

  const { jsonString, indent = 2 } = input;

  try {
    // Attempt to parse the JSON
    const parsed = JSON.parse(jsonString);
    
    // Format the JSON
    const formatted = JSON.stringify(parsed, null, indent);
    
    // Extract information about the JSON
    const properties = extractProperties(parsed);
    const type = getJsonType(parsed);
    const size = jsonString.length;
    
    return {
      isValid: true,
      formatted,
      size,
      properties,
      type
    };
  } catch (error) {
    // Parse the error to extract line and column information
    let errorLine: number | undefined;
    let errorColumn: number | undefined;
    let errorMessage = 'Invalid JSON syntax';
    
    if (error instanceof SyntaxError) {
      errorMessage = error.message;
      
      // Try to extract position information from error message
      const positionMatch = errorMessage.match(/position (\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1], 10);
        // Calculate line and column from position
        const lines = jsonString.substring(0, position).split('\n');
        errorLine = lines.length;
        errorColumn = lines[lines.length - 1].length + 1;
      }
      
      // Alternative pattern for different browsers
      const atMatch = errorMessage.match(/at line (\d+) column (\d+)/);
      if (atMatch) {
        errorLine = parseInt(atMatch[1], 10);
        errorColumn = parseInt(atMatch[2], 10);
      }
    }
    
    return {
      isValid: false,
      error: errorMessage,
      errorLine,
      errorColumn,
      size: jsonString.length,
      type: 'invalid'
    };
  }
}

/**
 * Input validation function
 */
export function validate(input: any): input is JsonValidatorInput {
  return isJsonValidatorInput(input);
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
  jsonString: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "addresses": [
    {
      "type": "home",
      "street": "123 Main St",
      "city": "Anytown",
      "country": "USA"
    },
    {
      "type": "work",
      "street": "456 Business Ave", 
      "city": "Corporate City",
      "country": "USA"
    }
  ],
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  }
}`,
  indent: 2
};