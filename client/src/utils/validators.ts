import Ajv from 'ajv';
import schema from '../types/index.schema.json';
import type { ToolVaultIndex } from '../types/index';

const ajv = new Ajv({ allErrors: true });

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