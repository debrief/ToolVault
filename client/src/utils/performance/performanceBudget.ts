// Performance budget configuration based on the task requirements
export const PERFORMANCE_BUDGETS = {
  // Time budgets (milliseconds)
  firstContentfulPaint: 1800,     // < 1.8s
  largestContentfulPaint: 2500,   // < 2.5s  
  timeToInteractive: 3000,        // < 3.0s
  firstInputDelay: 100,           // < 100ms
  cumulativeLayoutShift: 0.1,     // < 0.1
  timeToFirstByte: 800,           // < 800ms
  
  // Size budgets (bytes)
  totalBundleSize: 1000000,       // 1MB total
  mainChunkSize: 500000,          // 500KB main chunk
  cssSize: 100000,                // 100KB CSS
  imageSize: 200000,              // 200KB per image
  fontSize: 100000,               // 100KB fonts
  
  // Resource budgets
  maxRequests: 50,                // Maximum HTTP requests
  maxResourceSize: 1000000,       // 1MB per resource
  
  // Runtime budgets
  maxRenderTime: 16,              // 16ms per frame (60fps)
  maxTaskTime: 50,                // 50ms long tasks threshold
  maxMemoryUsage: 50000000,       // 50MB memory usage
} as const;

export type PerformanceBudgetKey = keyof typeof PERFORMANCE_BUDGETS;

export interface BudgetViolation {
  metric: PerformanceBudgetKey;
  actual: number;
  budget: number;
  severity: 'warning' | 'error';
  timestamp: number;
}

export interface PerformanceBudgetReport {
  passed: number;
  failed: number;
  violations: BudgetViolation[];
  totalMetrics: number;
  score: number; // 0-100
}

/**
 * Check if a metric passes the performance budget
 */
export function checkBudget(
  metric: PerformanceBudgetKey, 
  value: number
): BudgetViolation | null {
  const budget = PERFORMANCE_BUDGETS[metric];
  
  if (value <= budget) {
    return null; // Budget passed
  }
  
  // Determine severity based on how much the budget is exceeded
  const exceedPercentage = (value - budget) / budget;
  const severity: 'warning' | 'error' = exceedPercentage > 0.5 ? 'error' : 'warning';
  
  return {
    metric,
    actual: value,
    budget,
    severity,
    timestamp: Date.now(),
  };
}

/**
 * Check multiple metrics against their budgets
 */
export function checkPerformanceBudgets(
  metrics: Partial<Record<PerformanceBudgetKey, number>>
): PerformanceBudgetReport {
  const violations: BudgetViolation[] = [];
  let passed = 0;
  let failed = 0;
  
  Object.entries(metrics).forEach(([key, value]) => {
    if (value !== undefined) {
      const violation = checkBudget(key as PerformanceBudgetKey, value);
      if (violation) {
        violations.push(violation);
        failed++;
      } else {
        passed++;
      }
    }
  });
  
  const totalMetrics = passed + failed;
  const score = totalMetrics > 0 ? Math.round((passed / totalMetrics) * 100) : 0;
  
  return {
    passed,
    failed,
    violations,
    totalMetrics,
    score,
  };
}

/**
 * Get current performance metrics for budget checking
 */
export async function getCurrentPerformanceMetrics(): Promise<Partial<Record<PerformanceBudgetKey, number>>> {
  const metrics: Partial<Record<PerformanceBudgetKey, number>> = {};
  
  // Navigation timing metrics
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    metrics.timeToFirstByte = navigation.responseStart - navigation.requestStart;
    metrics.timeToInteractive = navigation.loadEventEnd - navigation.navigationStart;
  }
  
  // Resource timing metrics
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  // Calculate bundle sizes
  const jsResources = resources.filter(r => r.name.includes('.js'));
  const cssResources = resources.filter(r => r.name.includes('.css'));
  const imageResources = resources.filter(r => 
    r.name.includes('.jpg') || r.name.includes('.png') || 
    r.name.includes('.webp') || r.name.includes('.svg')
  );
  const fontResources = resources.filter(r => 
    r.name.includes('.woff') || r.name.includes('.woff2') || 
    r.name.includes('.ttf') || r.name.includes('.otf')
  );
  
  metrics.totalBundleSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  metrics.cssSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  metrics.fontSize = fontResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  
  // Find main chunk (usually the largest JS resource)
  const mainChunk = jsResources.reduce((largest, current) => 
    (current.transferSize || 0) > (largest?.transferSize || 0) ? current : largest
  , jsResources[0]);
  
  if (mainChunk) {
    metrics.mainChunkSize = mainChunk.transferSize || 0;
  }
  
  // Check image sizes
  const largestImage = imageResources.reduce((largest, current) => 
    (current.transferSize || 0) > (largest?.transferSize || 0) ? current : largest
  , imageResources[0]);
  
  if (largestImage) {
    metrics.imageSize = largestImage.transferSize || 0;
  }
  
  // Request count
  metrics.maxRequests = resources.length;
  
  // Memory usage (Chrome only)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    metrics.maxMemoryUsage = memory.usedJSHeapSize;
  }
  
  return metrics;
}

/**
 * Run a complete performance budget check
 */
export async function runPerformanceBudgetCheck(): Promise<PerformanceBudgetReport> {
  const metrics = await getCurrentPerformanceMetrics();
  return checkPerformanceBudgets(metrics);
}

/**
 * Format budget violation for display
 */
export function formatBudgetViolation(violation: BudgetViolation): string {
  const { metric, actual, budget, severity } = violation;
  const unit = getMetricUnit(metric);
  const exceedBy = actual - budget;
  const percentage = Math.round((exceedBy / budget) * 100);
  
  return `${severity.toUpperCase()}: ${metric} exceeded budget by ${formatValue(exceedBy, unit)} (${percentage}%). ` +
         `Actual: ${formatValue(actual, unit)}, Budget: ${formatValue(budget, unit)}`;
}

/**
 * Get the appropriate unit for a metric
 */
function getMetricUnit(metric: PerformanceBudgetKey): string {
  if (metric.includes('Size') || metric === 'maxResourceSize' || metric === 'maxMemoryUsage') {
    return 'bytes';
  }
  if (metric === 'cumulativeLayoutShift') {
    return '';
  }
  if (metric === 'maxRequests') {
    return 'requests';
  }
  return 'ms';
}

/**
 * Format a value with appropriate units
 */
function formatValue(value: number, unit: string): string {
  switch (unit) {
    case 'bytes':
      return formatBytes(value);
    case 'ms':
      return `${value.toFixed(1)}ms`;
    case 'requests':
      return `${value} requests`;
    default:
      return value.toFixed(2);
  }
}

/**
 * Format bytes in human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Performance budget monitoring class
 */
export class PerformanceBudgetMonitor {
  private violations: BudgetViolation[] = [];
  private checkInterval: number | null = null;
  
  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    this.stopMonitoring();
    
    this.checkInterval = window.setInterval(async () => {
      const report = await runPerformanceBudgetCheck();
      
      // Store new violations
      const newViolations = report.violations.filter(v => 
        !this.violations.some(existing => 
          existing.metric === v.metric && 
          Math.abs(existing.timestamp - v.timestamp) < 5000
        )
      );
      
      this.violations.push(...newViolations);
      
      // Log violations
      if (newViolations.length > 0) {
        console.group('🚨 Performance Budget Violations');
        newViolations.forEach(violation => {
          console.warn(formatBudgetViolation(violation));
        });
        console.groupEnd();
      }
    }, intervalMs);
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  
  /**
   * Get all violations
   */
  getViolations(): BudgetViolation[] {
    return [...this.violations];
  }
  
  /**
   * Clear violation history
   */
  clearViolations(): void {
    this.violations = [];
  }
  
  /**
   * Get current performance score
   */
  async getPerformanceScore(): Promise<number> {
    const report = await runPerformanceBudgetCheck();
    return report.score;
  }
}

// Global monitor instance
export const performanceBudgetMonitor = new PerformanceBudgetMonitor();