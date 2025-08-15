import { getCLS, getFID, getFCP, getLCP, getTTFB, type Metric } from 'web-vitals';

// Types for performance metrics
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  id: string;
}

export interface PerformanceAnalytics {
  sendMetric: (metric: PerformanceMetric) => void;
  sendEvent: (event: string, data?: Record<string, any>) => void;
}

// Default analytics implementation (can be replaced with real service)
const defaultAnalytics: PerformanceAnalytics = {
  sendMetric: (metric: PerformanceMetric) => {
    console.log('[Performance Metric]', metric);
    
    // In development, also show a visual indicator for poor metrics
    if (process.env.NODE_ENV === 'development' && metric.rating === 'poor') {
      console.warn(`🚨 Poor ${metric.name}: ${metric.value}`, metric);
    }
  },
  sendEvent: (event: string, data?: Record<string, any>) => {
    console.log('[Performance Event]', event, data);
  },
};

// Performance thresholds based on Web Vitals recommendations
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  
  // Other important metrics
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

function getMetricRating(name: keyof typeof PERFORMANCE_THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

function transformMetric(metric: Metric): PerformanceMetric {
  const name = metric.name as keyof typeof PERFORMANCE_THRESHOLDS;
  return {
    name: metric.name,
    value: metric.value,
    rating: getMetricRating(name, metric.value),
    timestamp: Date.now(),
    id: metric.id,
  };
}

// Initialize Web Vitals tracking
export function initWebVitals(analytics: PerformanceAnalytics = defaultAnalytics) {
  const sendToAnalytics = (metric: Metric) => {
    const transformedMetric = transformMetric(metric);
    analytics.sendMetric(transformedMetric);
  };

  // Track Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  
  // Track additional metrics
  getFCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  
  analytics.sendEvent('webVitalsInitialized');
}

// Custom performance marks for measuring specific operations
export class PerformanceMarker {
  private analytics: PerformanceAnalytics;
  private marks = new Map<string, number>();

  constructor(analytics: PerformanceAnalytics = defaultAnalytics) {
    this.analytics = analytics;
  }

  /**
   * Mark the start of a performance measurement
   */
  mark(name: string): () => void {
    const startTime = performance.now();
    const markName = `${name}-start`;
    
    performance.mark(markName);
    this.marks.set(name, startTime);

    // Return a function to end the measurement
    return () => this.measure(name);
  }

  /**
   * Measure the time between start and end marks
   */
  measure(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for "${name}"`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const startMarkName = `${name}-start`;
    const endMarkName = `${name}-end`;
    const measureName = name;

    performance.mark(endMarkName);
    performance.measure(measureName, startMarkName, endMarkName);
    
    this.marks.delete(name);
    
    // Send to analytics
    this.analytics.sendEvent('customPerformanceMark', {
      name,
      duration,
      timestamp: endTime,
    });

    return duration;
  }

  /**
   * Measure a function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const end = this.mark(name);
    try {
      const result = fn();
      end();
      return result;
    } catch (error) {
      end();
      throw error;
    }
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const end = this.mark(name);
    try {
      const result = await fn();
      end();
      return result;
    } catch (error) {
      end();
      throw error;
    }
  }
}

// Global performance marker instance
export const performanceMarker = new PerformanceMarker();

// Utility functions for common performance measurements
export const performanceUtils = {
  /**
   * Measure time to interactive
   */
  measureTTI(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve());
      }
    });
  },

  /**
   * Measure resource loading times
   */
  getResourceTimings(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  },

  /**
   * Get navigation timing information
   */
  getNavigationTiming(): PerformanceNavigationTiming | null {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return entries[0] || null;
  },

  /**
   * Calculate total bundle size from network requests
   */
  calculateBundleSize(): number {
    const resources = this.getResourceTimings();
    return resources
      .filter(resource => 
        resource.name.includes('.js') || 
        resource.name.includes('.css')
      )
      .reduce((total, resource) => total + (resource.transferSize || 0), 0);
  },

  /**
   * Monitor memory usage (Chrome only)
   */
  getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  },

  /**
   * Calculate Cumulative Layout Shift for a specific element
   */
  observeLayoutShift(callback: (entries: LayoutShiftEntry[]) => void): PerformanceObserver | null {
    if ('PerformanceObserver' in window && 'LayoutShiftEntry' in window) {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries() as LayoutShiftEntry[]);
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
      return observer;
    }
    return null;
  },
};

// React hook for performance monitoring
export function usePerformanceMonitoring(analytics?: PerformanceAnalytics) {
  const marker = new PerformanceMarker(analytics);
  
  return {
    mark: marker.mark.bind(marker),
    measure: marker.measure.bind(marker),
    measureFunction: marker.measureFunction.bind(marker),
    measureAsync: marker.measureAsync.bind(marker),
    ...performanceUtils,
  };
}