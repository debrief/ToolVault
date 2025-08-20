/**
 * Parameter validation service for dynamic forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ParameterSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'enum';
  default?: string | number | boolean | unknown[];
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  enum?: string[];
  required?: boolean;
  description?: string;
}

export const ParameterValidation = {
  validateParameter(value: unknown, schema: ParameterSchema): ValidationResult {
    // Handle empty/undefined values
    if (value === undefined || value === null || value === '') {
      if (schema.required) {
        return { isValid: false, error: `${schema.name} is required` };
      }
      return { isValid: true };
    }

    switch (schema.type) {
      case 'number':
        return this.validateNumber(value, schema);
      case 'string':
        return this.validateString(value, schema);
      case 'boolean':
        return this.validateBoolean(value, schema);
      case 'array':
        return this.validateArray(value, schema);
      case 'enum':
        return this.validateString(value, schema); // Enums are validated as strings
      default:
        return { isValid: true };
    }
  },

  validateNumber(value: unknown, schema: ParameterSchema): ValidationResult {
    const num = Number(value);
    
    if (isNaN(num)) {
      return { isValid: false, error: `${schema.name} must be a number` };
    }

    if (schema.min !== undefined && num < schema.min) {
      return { isValid: false, error: `${schema.name} must be at least ${schema.min}` };
    }

    if (schema.max !== undefined && num > schema.max) {
      return { isValid: false, error: `${schema.name} must be at most ${schema.max}` };
    }

    if (schema.step !== undefined && (num % schema.step) !== 0) {
      return { isValid: false, error: `${schema.name} must be a multiple of ${schema.step}` };
    }

    return { isValid: true };
  },

  validateString(value: unknown, schema: ParameterSchema): ValidationResult {
    const str = String(value);

    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(str)) {
        return { isValid: false, error: `${schema.name} format is invalid` };
      }
    }

    if (schema.enum && !schema.enum.includes(str)) {
      return { isValid: false, error: `${schema.name} must be one of: ${schema.enum.join(', ')}` };
    }

    return { isValid: true };
  },

  validateBoolean(value: unknown, schema: ParameterSchema): ValidationResult {
    if (typeof value !== 'boolean') {
      return { isValid: false, error: `${schema.name} must be true or false` };
    }
    return { isValid: true };
  },

  validateArray(value: unknown, schema: ParameterSchema): ValidationResult {
    if (!Array.isArray(value)) {
      return { isValid: false, error: `${schema.name} must be an array` };
    }
    return { isValid: true };
  },

  validateForm(values: Record<string, unknown>, schemas: ParameterSchema[]): Record<string, string> {
    const errors: Record<string, string> = {};

    schemas.forEach(schema => {
      const result = this.validateParameter(values[schema.name], schema);
      if (!result.isValid && result.error) {
        errors[schema.name] = result.error;
      }
    });

    return errors;
  }
};