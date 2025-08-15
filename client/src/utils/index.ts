// Validation utilities
export { 
  validateInputs, 
  validateField,
  getInputType, 
  getInputPlaceholder,
  type ValidationError,
  type ValidationResult,
  type ValidationOptions
} from './inputValidation';

// Search utilities
export * from './searchUtils';

// Validation utilities
export * from './validators';

// Performance utilities
export * from './performance';

// Memory management utilities
export { 
  createMemoryTracker,
  useCleanup,
  useCleanupManager,
  useAbortController,
  useTimerManager,
  useEventListenerManager,
  useObserverManager,
  useResourceManager,
  useMemoryMonitor,
  getMemoryUsage,
  WeakMapCache,
  TTLCache,
  globalMemoryTracker,
  AbortControllerManager,
  TimerManager,
  EventListenerManager,
  ObserverManager,
  ResourceManager,
  type MemoryTracker,
  type MemoryUsage
} from './memoryManagement';