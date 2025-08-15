import { useEffect, useCallback, useRef, DependencyList } from 'react';

// Memory usage information interface
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercentage: number;
}

// Memory leak detector interface
export interface MemoryLeakDetector {
  start(): void;
  stop(): void;
  getReport(): MemoryLeakReport;
}

export interface MemoryLeakReport {
  suspiciousGrowth: boolean;
  memoryGrowthRate: number;
  samplesCount: number;
  averageMemoryUsage: number;
  peakMemoryUsage: number;
  recommendations: string[];
}

/**
 * Get current memory usage information (Chrome only)
 */
export function getMemoryInfo(): MemoryInfo | null {
  if (!('memory' in performance)) {
    return null;
  }

  const memory = (performance as any).memory;
  
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

/**
 * Format memory size in human-readable format
 */
export function formatMemorySize(bytes: number): string {
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Memory leak detector class
 */
export class SimpleMemoryLeakDetector implements MemoryLeakDetector {
  private samples: number[] = [];
  private interval: number | null = null;
  private isRunning = false;
  private sampleInterval: number;

  constructor(sampleIntervalMs: number = 10000) {
    this.sampleInterval = sampleIntervalMs;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.samples = [];
    
    this.interval = window.setInterval(() => {
      const memInfo = getMemoryInfo();
      if (memInfo) {
        this.samples.push(memInfo.usedJSHeapSize);
        
        // Keep only recent samples to avoid memory leak in the detector itself
        if (this.samples.length > 100) {
          this.samples.shift();
        }
      }
    }, this.sampleInterval);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
  }

  getReport(): MemoryLeakReport {
    if (this.samples.length < 2) {
      return {
        suspiciousGrowth: false,
        memoryGrowthRate: 0,
        samplesCount: this.samples.length,
        averageMemoryUsage: 0,
        peakMemoryUsage: 0,
        recommendations: ['Not enough samples to determine memory growth patterns.'],
      };
    }

    const firstSample = this.samples[0];
    const lastSample = this.samples[this.samples.length - 1];
    const averageMemoryUsage = this.samples.reduce((sum, sample) => sum + sample, 0) / this.samples.length;
    const peakMemoryUsage = Math.max(...this.samples);
    
    // Calculate growth rate (bytes per sample)
    const memoryGrowthRate = (lastSample - firstSample) / this.samples.length;
    
    // Determine if there's suspicious growth
    const suspiciousGrowth = memoryGrowthRate > 100000; // 100KB per sample is suspicious
    
    const recommendations: string[] = [];
    
    if (suspiciousGrowth) {
      recommendations.push('Memory usage is growing consistently. Check for memory leaks.');
      recommendations.push('Review event listeners, timers, and closures that may not be properly cleaned up.');
      recommendations.push('Use React DevTools Profiler to identify components causing memory leaks.');
    }
    
    if (peakMemoryUsage > 50000000) { // 50MB
      recommendations.push('Peak memory usage is high. Consider optimizing large objects and data structures.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Memory usage appears normal.');
    }

    return {
      suspiciousGrowth,
      memoryGrowthRate,
      samplesCount: this.samples.length,
      averageMemoryUsage,
      peakMemoryUsage,
      recommendations,
    };
  }
}

/**
 * Global memory leak detector instance
 */
export const memoryLeakDetector = new SimpleMemoryLeakDetector();

/**
 * React hook for cleanup effects that ensures proper cleanup
 */
export function useCleanupEffect(
  effect: () => (() => void) | void, 
  deps: DependencyList
): void {
  useEffect(() => {
    const cleanup = effect();
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps);
}

/**
 * React hook for monitoring memory usage
 */
export function useMemoryMonitoring(intervalMs: number = 30000) {
  const memoryInfo = useRef<MemoryInfo | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      memoryInfo.current = getMemoryInfo();
      
      if (memoryInfo.current && memoryInfo.current.usedPercentage > 80) {
        console.warn('⚠️ High memory usage detected:', formatMemorySize(memoryInfo.current.usedJSHeapSize));
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    getMemoryInfo: () => memoryInfo.current,
    formatMemorySize,
  };
}

/**
 * Higher-order component for memory profiling
 */
export function withMemoryProfiler<T extends object>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  const WrappedComponent = (props: T) => {
    const componentName = Component.displayName || Component.name || 'Unknown';
    
    useEffect(() => {
      const initialMemory = getMemoryInfo();
      console.log(`📊 ${componentName} mounted. Memory:`, 
        initialMemory ? formatMemorySize(initialMemory.usedJSHeapSize) : 'N/A');
      
      return () => {
        const finalMemory = getMemoryInfo();
        console.log(`📊 ${componentName} unmounted. Memory:`, 
          finalMemory ? formatMemorySize(finalMemory.usedJSHeapSize) : 'N/A');
        
        if (initialMemory && finalMemory) {
          const memoryDiff = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
          if (memoryDiff > 1000000) { // 1MB increase
            console.warn(`🚨 ${componentName} may have caused a memory leak. ` +
              `Memory increased by ${formatMemorySize(memoryDiff)}`);
          }
        }
      };
    }, []);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withMemoryProfiler(${componentName})`;
  return WrappedComponent;
}

/**
 * Hook for managing intervals with automatic cleanup
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const interval = setInterval(() => {
      savedCallback.current?.();
    }, delay);

    return () => clearInterval(interval);
  }, [delay]);
}

/**
 * Hook for managing timeouts with automatic cleanup
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const timeout = setTimeout(() => {
      savedCallback.current?.();
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);
}

/**
 * Hook for managing event listeners with automatic cleanup
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | Element | null = window
) {
  const savedHandler = useRef<(event: WindowEventMap[K]) => void>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element || !element.addEventListener) return;

    const eventListener = (event: Event) => {
      savedHandler.current?.(event as WindowEventMap[K]);
    };

    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

/**
 * Hook for managing ResizeObserver with automatic cleanup
 */
export function useResizeObserver(
  callback: ResizeObserverCallback,
  element: Element | null
) {
  const savedCallback = useRef<ResizeObserverCallback>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!element || !window.ResizeObserver) return;

    const observer = new ResizeObserver((entries, observer) => {
      savedCallback.current?.(entries, observer);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);
}

/**
 * Memory management utilities
 */
export const memoryUtils = {
  /**
   * Force garbage collection (development only, Chrome only)
   */
  forceGC(): void {
    if (process.env.NODE_ENV === 'development' && window.gc) {
      console.log('🗑️ Forcing garbage collection...');
      window.gc();
    }
  },

  /**
   * Get a detailed memory report
   */
  getMemoryReport(): object {
    const memInfo = getMemoryInfo();
    const report: any = {
      timestamp: new Date().toISOString(),
      memoryInfo: memInfo,
    };

    // Add leak detector report if available
    if (memoryLeakDetector) {
      report.leakDetection = memoryLeakDetector.getReport();
    }

    return report;
  },

  /**
   * Start comprehensive memory monitoring
   */
  startMemoryMonitoring(): void {
    console.log('🔍 Starting memory monitoring...');
    memoryLeakDetector.start();

    // Log memory usage every minute in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const memInfo = getMemoryInfo();
        if (memInfo) {
          console.log('💾 Memory usage:', formatMemorySize(memInfo.usedJSHeapSize));
        }
      }, 60000);
    }
  },

  /**
   * Stop memory monitoring
   */
  stopMemoryMonitoring(): void {
    console.log('⏹️ Stopping memory monitoring...');
    memoryLeakDetector.stop();
  },
};

// Type augmentation for global gc function
declare global {
  interface Window {
    gc?: () => void;
  }
}

// Auto-start memory monitoring in development
if (process.env.NODE_ENV === 'development') {
  memoryUtils.startMemoryMonitoring();
}