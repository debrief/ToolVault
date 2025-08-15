export class ToolVaultError extends Error {
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  constructor(message: string, code: string, details?: any, retryable: boolean = false) {
    super(message);
    this.name = 'ToolVaultError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.retryable = retryable;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}

export class NetworkError extends ToolVaultError {
  public readonly status?: number;
  public readonly url?: string;

  constructor(message: string, status?: number, url?: string) {
    const retryable = !status || status >= 500 || status === 408 || status === 429;
    super(message, 'NETWORK_ERROR', { status, url }, retryable);
    this.name = 'NetworkError';
    this.status = status;
    this.url = url;
  }

  static fromResponse(response: Response, url?: string): NetworkError {
    const message = `HTTP ${response.status}: ${response.statusText}`;
    return new NetworkError(message, response.status, url || response.url);
  }

  static fromFetchError(error: Error, url?: string): NetworkError {
    if (error.name === 'AbortError') {
      return new NetworkError('Request was cancelled', undefined, url);
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new NetworkError('Network connection failed', undefined, url);
    }
    return new NetworkError(error.message, undefined, url);
  }
}

export class ValidationError extends ToolVaultError {
  public readonly validationErrors?: any;
  public readonly field?: string;

  constructor(message: string, validationErrors?: any, field?: string) {
    super(message, 'VALIDATION_ERROR', validationErrors, false);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
    this.field = field;
  }

  static fromField(field: string, message: string, value?: any): ValidationError {
    return new ValidationError(`${field}: ${message}`, { [field]: message, value }, field);
  }
}

export class NotFoundError extends ToolVaultError {
  public readonly resource?: string;

  constructor(message: string = 'Resource not found', resource?: string) {
    super(message, 'NOT_FOUND_ERROR', { resource }, false);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

export class TimeoutError extends ToolVaultError {
  public readonly timeoutMs: number;

  constructor(message: string = 'Request timeout', timeoutMs: number = 0) {
    super(message, 'TIMEOUT_ERROR', { timeoutMs }, true);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class ServiceError extends ToolVaultError {
  public readonly service: string;
  public readonly operation: string;

  constructor(message: string, service: string, operation: string, retryable: boolean = false) {
    super(message, 'SERVICE_ERROR', { service, operation }, retryable);
    this.name = 'ServiceError';
    this.service = service;
    this.operation = operation;
  }
}

// Service-specific error classes
export class ToolVaultServiceError extends ServiceError {
  public readonly type: 'network' | 'validation' | 'not_found' | 'server' | 'unknown';

  constructor(
    message: string,
    type: 'network' | 'validation' | 'not_found' | 'server' | 'unknown',
    operation: string,
    details?: any
  ) {
    const retryable = type === 'network' || type === 'server';
    super(message, 'ToolVault', operation, retryable);
    this.name = 'ToolVaultServiceError';
    this.type = type;
    this.details = { ...this.details, type, ...details };
  }

  static fromError(error: Error, operation: string): ToolVaultServiceError {
    if (error instanceof NetworkError) {
      return new ToolVaultServiceError(
        error.message,
        'network',
        operation,
        { status: error.status, url: error.url }
      );
    }
    
    if (error instanceof ValidationError) {
      return new ToolVaultServiceError(
        error.message,
        'validation',
        operation,
        { validationErrors: error.validationErrors }
      );
    }
    
    if (error instanceof NotFoundError) {
      return new ToolVaultServiceError(
        error.message,
        'not_found',
        operation,
        { resource: error.resource }
      );
    }
    
    return new ToolVaultServiceError(
      error.message,
      'unknown',
      operation,
      { originalError: error.name }
    );
  }
}

// Error type guards
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ToolVaultError) {
    return error.retryable;
  }
  
  // Consider network-related errors as retryable by default
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('fetch') ||
           message.includes('connection');
  }
  
  return false;
}

// Error reporting utilities
export interface ErrorReport {
  error: ToolVaultError;
  context: {
    url: string;
    userAgent: string;
    timestamp: string;
    sessionId?: string;
    userId?: string;
  };
}

export function createErrorReport(error: ToolVaultError, context?: Partial<ErrorReport['context']>): ErrorReport {
  return {
    error,
    context: {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...context,
    },
  };
}