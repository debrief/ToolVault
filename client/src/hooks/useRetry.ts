import { useState, useCallback, useRef, useEffect } from 'react';

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential' | 'custom';
  maxDelay?: number;
  retryCondition?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
  onMaxAttemptsReached?: (error: Error) => void;
  customBackoff?: (attempt: number, baseDelay: number) => number;
}

export interface RetryState {
  attempts: number;
  isRetrying: boolean;
  lastError: Error | null;
  canRetry: boolean;
  nextRetryDelay: number | null;
}

export interface RetryResult<T> extends RetryState {
  execute: () => Promise<T>;
  reset: () => void;
  cancel: () => void;
}

export function useRetry<T>(
  asyncFn: () => Promise<T>,
  options: RetryOptions = {}
): RetryResult<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    maxDelay = 30000,
    retryCondition = (error) => isRetryableError(error),
    onRetry,
    onMaxAttemptsReached,
    customBackoff,
  } = options;

  const [state, setState] = useState<RetryState>({
    attempts: 0,
    isRetrying: false,
    lastError: null,
    canRetry: true,
    nextRetryDelay: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Calculate delay for next retry
  const calculateDelay = useCallback((attempt: number): number => {
    if (customBackoff) {
      return Math.min(customBackoff(attempt, delay), maxDelay);
    }

    switch (backoff) {
      case 'linear':
        return Math.min(delay * attempt, maxDelay);
      case 'exponential':
        return Math.min(delay * Math.pow(2, attempt - 1), maxDelay);
      default:
        return delay;
    }
  }, [delay, backoff, maxDelay, customBackoff]);

  // Check if error is retryable
  const isRetryableError = useCallback((error: Error): boolean => {
    // Network errors are generally retryable
    if (error.name === 'NetworkError' || error.name === 'TypeError') {
      return true;
    }

    // HTTP errors - retry on 5xx, some 4xx
    if ('status' in error) {
      const status = (error as any).status;
      if (typeof status === 'number') {
        // Retry on server errors (5xx)
        if (status >= 500) return true;
        // Retry on specific client errors
        if (status === 408 || status === 429) return true; // Timeout, Rate limit
        return false;
      }
    }

    // Custom retry condition
    return true; // Default to retryable
  }, []);

  // Reset retry state
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }

    setState({
      attempts: 0,
      isRetrying: false,
      lastError: null,
      canRetry: true,
      nextRetryDelay: null,
    });
  }, []);

  // Cancel ongoing retry attempts
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }

    setState(prev => ({
      ...prev,
      isRetrying: false,
      canRetry: false,
      nextRetryDelay: null,
    }));
  }, []);

  // Execute function with retry logic
  const execute = useCallback(async (): Promise<T> => {
    // If already retrying or can't retry, throw error
    if (state.isRetrying) {
      throw new Error('Retry already in progress');
    }

    if (!state.canRetry) {
      throw state.lastError || new Error('Max retry attempts reached');
    }

    const attemptExecution = async (currentAttempt: number): Promise<T> => {
      try {
        // Create new abort controller for this attempt
        abortControllerRef.current = new AbortController();
        
        setState(prev => ({
          ...prev,
          isRetrying: true,
          attempts: currentAttempt,
          nextRetryDelay: null,
        }));

        const result = await asyncFn();
        
        // Success - reset state
        setState({
          attempts: currentAttempt,
          isRetrying: false,
          lastError: null,
          canRetry: true,
          nextRetryDelay: null,
        });

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry
        const shouldRetry = currentAttempt < maxAttempts && 
                           retryCondition(err, currentAttempt);

        setState(prev => ({
          ...prev,
          attempts: currentAttempt,
          isRetrying: false,
          lastError: err,
          canRetry: shouldRetry,
          nextRetryDelay: shouldRetry ? calculateDelay(currentAttempt + 1) : null,
        }));

        if (!shouldRetry) {
          onMaxAttemptsReached?.(err);
          throw err;
        }

        // Calculate delay for next attempt
        const retryDelay = calculateDelay(currentAttempt + 1);
        
        setState(prev => ({
          ...prev,
          nextRetryDelay: retryDelay,
        }));

        onRetry?.(err, currentAttempt);

        // Wait before retrying
        return new Promise<T>((resolve, reject) => {
          timeoutRef.current = setTimeout(async () => {
            try {
              const result = await attemptExecution(currentAttempt + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, retryDelay);
        });
      }
    };

    return attemptExecution(state.attempts + 1);
  }, [
    state.isRetrying, 
    state.canRetry, 
    state.lastError, 
    state.attempts,
    asyncFn, 
    maxAttempts, 
    retryCondition, 
    calculateDelay, 
    onRetry, 
    onMaxAttemptsReached
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
  };
}

// Hook for retrying with exponential backoff and jitter
export function useRetryWithJitter<T>(
  asyncFn: () => Promise<T>,
  options: Omit<RetryOptions, 'backoff' | 'customBackoff'> & {
    jitterFactor?: number;
  } = {}
) {
  const { jitterFactor = 0.1, ...restOptions } = options;

  const customBackoff = useCallback((attempt: number, baseDelay: number): number => {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = exponentialDelay * jitterFactor * Math.random();
    return exponentialDelay + jitter;
  }, [jitterFactor]);

  return useRetry(asyncFn, {
    ...restOptions,
    backoff: 'custom',
    customBackoff,
  });
}

// Hook for retrying with circuit breaker pattern
export function useRetryWithCircuitBreaker<T>(
  asyncFn: () => Promise<T>,
  options: RetryOptions & {
    circuitBreakerThreshold?: number;
    circuitBreakerTimeout?: number;
  } = {}
) {
  const {
    circuitBreakerThreshold = 5,
    circuitBreakerTimeout = 60000,
    ...retryOptions
  } = options;

  const [circuitState, setCircuitState] = useState<'closed' | 'open' | 'half-open'>('closed');
  const [failureCount, setFailureCount] = useState(0);
  const circuitTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhanced retry condition with circuit breaker
  const retryCondition = useCallback((error: Error, attempt: number): boolean => {
    // If circuit is open, don't retry
    if (circuitState === 'open') {
      return false;
    }

    // Use original retry condition
    const shouldRetry = options.retryCondition?.(error, attempt) ?? true;
    
    if (!shouldRetry) {
      setFailureCount(prev => {
        const newCount = prev + 1;
        
        // Open circuit if threshold reached
        if (newCount >= circuitBreakerThreshold) {
          setCircuitState('open');
          
          // Set timeout to transition to half-open
          circuitTimeoutRef.current = setTimeout(() => {
            setCircuitState('half-open');
            setFailureCount(0);
          }, circuitBreakerTimeout);
        }
        
        return newCount;
      });
    }

    return shouldRetry;
  }, [circuitState, options.retryCondition, circuitBreakerThreshold, circuitBreakerTimeout]);

  // Enhanced onRetry callback
  const onRetry = useCallback((error: Error, attempt: number) => {
    // Reset failure count on successful retry
    if (circuitState === 'half-open') {
      setCircuitState('closed');
      setFailureCount(0);
    }
    
    options.onRetry?.(error, attempt);
  }, [circuitState, options.onRetry]);

  const retryHook = useRetry(asyncFn, {
    ...retryOptions,
    retryCondition,
    onRetry,
  });

  // Cleanup circuit breaker timeout
  useEffect(() => {
    return () => {
      if (circuitTimeoutRef.current) {
        clearTimeout(circuitTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...retryHook,
    circuitState,
    failureCount,
  };
}

// Utility function to create retryable version of any async function
export function makeRetryable<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  return (...args: T): Promise<R> => {
    const { execute } = useRetry(() => fn(...args), options);
    return execute();
  };
}