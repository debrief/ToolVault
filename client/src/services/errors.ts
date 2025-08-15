export class ToolVaultError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ToolVaultError';
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends ToolVaultError {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message, 'NETWORK_ERROR', { status });
    this.name = 'NetworkError';
    this.status = status;
  }
}

export class ValidationError extends ToolVaultError {
  public readonly validationErrors?: any;

  constructor(message: string, validationErrors?: any) {
    super(message, 'VALIDATION_ERROR', validationErrors);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

export class NotFoundError extends ToolVaultError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}