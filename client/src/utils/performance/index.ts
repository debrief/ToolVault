// Performance monitoring exports
export {
  initWebVitals,
  PerformanceMarker,
  performanceMarker,
  performanceUtils,
  usePerformanceMonitoring,
  type PerformanceMetric,
  type PerformanceAnalytics,
} from './webVitals';

// Performance budget exports
export {
  PERFORMANCE_BUDGETS,
  checkBudget,
  checkPerformanceBudgets,
  getCurrentPerformanceMetrics,
  runPerformanceBudgetCheck,
  formatBudgetViolation,
  PerformanceBudgetMonitor,
  performanceBudgetMonitor,
  type PerformanceBudgetKey,
  type BudgetViolation,
  type PerformanceBudgetReport,
} from './performanceBudget';

// Memory management exports
export {
  getMemoryInfo,
  formatMemorySize,
  SimpleMemoryLeakDetector,
  memoryLeakDetector,
  useCleanupEffect,
  useMemoryMonitoring,
  withMemoryProfiler,
  useInterval,
  useTimeout,
  useEventListener,
  useResizeObserver,
  memoryUtils,
  type MemoryInfo,
  type MemoryLeakDetector,
  type MemoryLeakReport,
} from './memoryManagement';