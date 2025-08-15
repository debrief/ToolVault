import type { ToolInput } from '../types/index';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates input values against tool input requirements
 */
export function validateInputs(
  inputs: ToolInput[],
  values: Record<string, any>
): ValidationResult {
  const errors: ValidationError[] = [];

  inputs.forEach(input => {
    const value = values[input.name];
    const isEmpty = value === undefined || value === null || value === '';

    // Check required fields
    if (input.required && isEmpty) {
      errors.push({
        field: input.name,
        message: `${input.label || input.name} is required`,
      });
      return;
    }

    // Skip validation for empty optional fields
    if (isEmpty) return;

    // Type-specific validation
    switch (input.type.toLowerCase()) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push({
            field: input.name,
            message: `${input.label || input.name} must be a valid number`,
          });
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({
            field: input.name,
            message: `${input.label || input.name} must be a valid email address`,
          });
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          errors.push({
            field: input.name,
            message: `${input.label || input.name} must be a valid URL`,
          });
        }
        break;

      case 'json':
      case 'geojson':
        try {
          JSON.parse(value);
        } catch {
          errors.push({
            field: input.name,
            message: `${input.label || input.name} must be valid JSON`,
          });
        }
        break;

      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            field: input.name,
            message: `${input.label || input.name} must be a string`,
          });
        }
        break;

      default:
        // No specific validation for unknown types
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets the appropriate input type for HTML form elements
 */
export function getInputType(type: string): string {
  switch (type.toLowerCase()) {
    case 'number':
      return 'number';
    case 'email':
      return 'email';
    case 'url':
      return 'url';
    case 'password':
      return 'password';
    case 'date':
      return 'date';
    case 'time':
      return 'time';
    case 'datetime-local':
      return 'datetime-local';
    case 'json':
    case 'geojson':
      return 'textarea';
    default:
      return 'text';
  }
}

/**
 * Gets an appropriate placeholder for the input type
 */
export function getInputPlaceholder(input: ToolInput): string {
  switch (input.type.toLowerCase()) {
    case 'email':
      return 'user@example.com';
    case 'url':
      return 'https://example.com';
    case 'number':
      return 'Enter a number';
    case 'json':
      return '{"key": "value"}';
    case 'geojson':
      return '{"type": "Feature", "geometry": {...}, "properties": {...}}';
    case 'string':
      return `Enter ${input.label || input.name}`;
    default:
      return `Enter ${input.label || input.name}`;
  }
}