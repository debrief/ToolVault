import type { ToolInput } from '../types/index';
import { ValidationError as ServiceValidationError } from '../services/errors';

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export interface ValidationOptions {
  strict?: boolean;
  skipRequired?: boolean;
  customValidators?: Record<string, (value: any, input: ToolInput) => string | null>;
  sanitizeInput?: boolean;
}

/**
 * Sanitizes input value based on type
 */
function sanitizeValue(value: any, type: string): any {
  if (value === undefined || value === null) return value;
  
  switch (type.toLowerCase()) {
    case 'string':
      return typeof value === 'string' ? value.trim() : String(value).trim();
    case 'number':
      return typeof value === 'number' ? value : Number(value);
    case 'email':
      return typeof value === 'string' ? value.toLowerCase().trim() : String(value).toLowerCase().trim();
    case 'url':
      return typeof value === 'string' ? value.trim() : String(value).trim();
    default:
      return value;
  }
}

/**
 * Validates a single input value
 */
function validateSingleInput(
  input: ToolInput, 
  value: any, 
  options: ValidationOptions = {}
): { errors: ValidationError[]; warnings: ValidationError[]; sanitizedValue: any } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let sanitizedValue = options.sanitizeInput ? sanitizeValue(value, input.type) : value;
  
  const isEmpty = sanitizedValue === undefined || 
                  sanitizedValue === null || 
                  sanitizedValue === '' ||
                  (Array.isArray(sanitizedValue) && sanitizedValue.length === 0);

  const fieldLabel = input.label || input.name;

  try {
    // Check required fields
    if (!options.skipRequired && input.required && isEmpty) {
      errors.push({
        field: input.name,
        message: `${fieldLabel} is required`,
        code: 'REQUIRED',
        value: sanitizedValue,
      });
      return { errors, warnings, sanitizedValue };
    }

    // Skip validation for empty optional fields
    if (isEmpty) {
      return { errors, warnings, sanitizedValue };
    }

    // Custom validator first
    if (options.customValidators?.[input.name]) {
      const customError = options.customValidators[input.name](sanitizedValue, input);
      if (customError) {
        errors.push({
          field: input.name,
          message: customError,
          code: 'CUSTOM',
          value: sanitizedValue,
        });
        return { errors, warnings, sanitizedValue };
      }
    }

    // Type-specific validation with enhanced error handling
    switch (input.type.toLowerCase()) {
      case 'number':
        const numValue = Number(sanitizedValue);
        if (isNaN(numValue)) {
          errors.push({
            field: input.name,
            message: `${fieldLabel} must be a valid number`,
            code: 'INVALID_NUMBER',
            value: sanitizedValue,
          });
        } else {
          sanitizedValue = numValue;
          
          // Check number constraints
          if ('minimum' in input && typeof input.minimum === 'number' && numValue < input.minimum) {
            errors.push({
              field: input.name,
              message: `${fieldLabel} must be at least ${input.minimum}`,
              code: 'MIN_VALUE',
              value: numValue,
            });
          }
          
          if ('maximum' in input && typeof input.maximum === 'number' && numValue > input.maximum) {
            errors.push({
              field: input.name,
              message: `${fieldLabel} must be at most ${input.maximum}`,
              code: 'MAX_VALUE',
              value: numValue,
            });
          }
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedValue)) {
          errors.push({
            field: input.name,
            message: `${fieldLabel} must be a valid email address`,
            code: 'INVALID_EMAIL',
            value: sanitizedValue,
          });
        }
        break;

      case 'url':
        try {
          new URL(sanitizedValue);
        } catch {
          errors.push({
            field: input.name,
            message: `${fieldLabel} must be a valid URL`,
            code: 'INVALID_URL',
            value: sanitizedValue,
          });
        }
        break;

      case 'json':
      case 'geojson':
        let parsed: any;
        
        // Handle both string and object inputs
        if (typeof sanitizedValue === 'string') {
          try {
            parsed = JSON.parse(sanitizedValue);
          } catch (error) {
            errors.push({
              field: input.name,
              message: `${fieldLabel} must be valid JSON`,
              code: 'INVALID_JSON',
              value: sanitizedValue,
            });
            break;
          }
        } else if (typeof sanitizedValue === 'object' && sanitizedValue !== null) {
          // Value is already an object (e.g., from test data)
          parsed = sanitizedValue;
        } else {
          errors.push({
            field: input.name,
            message: `${fieldLabel} must be valid JSON`,
            code: 'INVALID_JSON',
            value: sanitizedValue,
          });
          break;
        }
        
        sanitizedValue = parsed;
        
        // Additional GeoJSON validation
        if (input.type === 'geojson') {
          if (!parsed.type || !['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'].includes(parsed.type)) {
            warnings.push({
              field: input.name,
              message: `${fieldLabel} may not be valid GeoJSON format`,
              code: 'INVALID_GEOJSON',
              value: parsed,
            });
          }
        }
        break;

      case 'string':
        if (typeof sanitizedValue !== 'string') {
          sanitizedValue = String(sanitizedValue);
          if (options.strict) {
            warnings.push({
              field: input.name,
              message: `${fieldLabel} was converted to string`,
              code: 'TYPE_CONVERSION',
              value: sanitizedValue,
            });
          }
        }
        
        // Check string length constraints
        if ('minLength' in input && typeof input.minLength === 'number' && sanitizedValue.length < input.minLength) {
          errors.push({
            field: input.name,
            message: `${fieldLabel} must be at least ${input.minLength} characters`,
            code: 'MIN_LENGTH',
            value: sanitizedValue,
          });
        }
        
        if ('maxLength' in input && typeof input.maxLength === 'number' && sanitizedValue.length > input.maxLength) {
          errors.push({
            field: input.name,
            message: `${fieldLabel} must be at most ${input.maxLength} characters`,
            code: 'MAX_LENGTH',
            value: sanitizedValue,
          });
        }
        break;

      case 'array':
        if (!Array.isArray(sanitizedValue)) {
          try {
            // Try to parse as JSON array
            sanitizedValue = JSON.parse(sanitizedValue);
            if (!Array.isArray(sanitizedValue)) {
              throw new Error('Not an array');
            }
          } catch {
            errors.push({
              field: input.name,
              message: `${fieldLabel} must be an array`,
              code: 'INVALID_ARRAY',
              value: sanitizedValue,
            });
          }
        }
        break;

      default:
        // No specific validation for unknown types
        if (options.strict) {
          warnings.push({
            field: input.name,
            message: `Unknown input type: ${input.type}`,
            code: 'UNKNOWN_TYPE',
            value: sanitizedValue,
          });
        }
        break;
    }
  } catch (error) {
    // Catch any unexpected errors in validation
    errors.push({
      field: input.name,
      message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: 'VALIDATION_ERROR',
      value: sanitizedValue,
    });
  }

  return { errors, warnings, sanitizedValue };
}

/**
 * Validates input values against tool input requirements with enhanced error handling
 */
export function validateInputs(
  inputs: ToolInput[],
  values: Record<string, any>,
  options: ValidationOptions = {}
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  if (!Array.isArray(inputs)) {
    throw new ServiceValidationError('Inputs must be an array', { inputs });
  }

  if (!values || typeof values !== 'object') {
    throw new ServiceValidationError('Values must be an object', { values });
  }

  try {
    inputs.forEach(input => {
      if (!input || typeof input !== 'object') {
        warnings.push({
          field: 'unknown',
          message: 'Invalid input definition',
          code: 'INVALID_INPUT_DEF',
          value: input,
        });
        return;
      }

      if (!input.name) {
        warnings.push({
          field: 'unknown',
          message: 'Input missing name property',
          code: 'MISSING_NAME',
          value: input,
        });
        return;
      }

      const value = values[input.name];
      const result = validateSingleInput(input, value, options);
      
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });
  } catch (error) {
    throw new ServiceValidationError(
      `Validation process failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: error }
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validates and sanitizes a single field
 */
export function validateField(
  input: ToolInput, 
  value: any, 
  options: ValidationOptions = {}
): ValidationResult {
  try {
    const result = validateSingleInput(input, value, options);
    
    return {
      isValid: result.errors.length === 0,
      errors: result.errors,
      warnings: result.warnings.length > 0 ? result.warnings : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        field: input.name || 'unknown',
        message: `Field validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'VALIDATION_FAILED',
        value,
      }],
    };
  }
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