import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../types/index.schema.json';
import type { ToolVaultIndex } from '../types/index';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Compile the schema validator
const validateToolVaultIndex = ajv.compile(schema);

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validates data against the ToolVault index schema
 */
export function validateIndex(data: unknown): ValidationResult {
  const valid = validateToolVaultIndex(data);
  
  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors: ValidationError[] = (validateToolVaultIndex.errors || []).map(
    (error) => ({
      path: error.instancePath || 'root',
      message: error.message || 'Validation error',
    })
  );

  return { valid: false, errors };
}

/**
 * Type-safe validator that returns typed data if valid
 */
export function parseToolVaultIndex(data: unknown): ToolVaultIndex {
  const result = validateIndex(data);
  
  if (!result.valid) {
    const errorMessages = result.errors.map(
      (e) => `${e.path}: ${e.message}`
    ).join('; ');
    throw new Error(`Invalid ToolVault index data: ${errorMessages}`);
  }
  
  return data as ToolVaultIndex;
}

/**
 * Mock tool definitions for input validation
 */
const mockToolDefinitions: Record<string, any> = {
  'wordcount': {
    inputs: [
      { name: 'text', type: 'string', required: true },
      { name: 'case_sensitive', type: 'boolean', required: false }
    ]
  },
  'geospatial-analysis': {
    inputs: [
      { name: 'geojson', type: 'object', required: true },
      { name: 'analysis_type', type: 'string', required: true }
    ]
  },
  'data-visualizer': {
    inputs: [
      { name: 'data', type: 'object', required: true },
      { name: 'chart_type', type: 'string', required: false }
    ]
  },
  'data-processor': {
    inputs: [
      { name: 'dataset', type: 'object', required: true },
      { name: 'operations', type: 'array', required: false }
    ]
  }
};

/**
 * Validate tool inputs against tool schema
 */
export interface ToolInputValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export function validateToolInputs(toolId: string, inputs: Record<string, any>): ToolInputValidationResult {
  const toolDef = mockToolDefinitions[toolId];
  
  if (!toolDef) {
    return {
      isValid: true, // Allow unknown tools for now
      errors: []
    };
  }

  const errors: Array<{ field: string; message: string; code: string }> = [];

  // Check required inputs
  for (const inputDef of toolDef.inputs) {
    if (inputDef.required && (inputs[inputDef.name] === undefined || inputs[inputDef.name] === null)) {
      errors.push({
        field: inputDef.name,
        message: `Required input '${inputDef.name}' is missing`,
        code: 'REQUIRED_FIELD_MISSING'
      });
    }

    // Type validation for provided inputs
    const value = inputs[inputDef.name];
    if (value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (inputDef.type !== actualType) {
        errors.push({
          field: inputDef.name,
          message: `Input '${inputDef.name}' must be of type '${inputDef.type}', got '${actualType}'`,
          code: 'INVALID_TYPE'
        });
      }

      // Additional validation for specific types
      if (inputDef.type === 'string' && typeof value === 'string' && value.length === 0) {
        errors.push({
          field: inputDef.name,
          message: `Input '${inputDef.name}' cannot be an empty string`,
          code: 'EMPTY_STRING'
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}