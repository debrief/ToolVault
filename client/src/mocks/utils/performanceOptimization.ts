/**
 * Performance optimization utilities for mock responses
 */

import { responseCache } from './responseHelpers';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  throughput: number;
  errorRate: number;
}

export interface PerformanceBudget {
  maxResponseTime: number;
  maxMemoryUsage: number;
  minCacheHitRate: number;
  minThroughput: number;
  maxErrorRate: number;
}

/**
 * Performance optimizer for mock responses
 */
export class MockPerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private budget: PerformanceBudget;
  private compressionEnabled: boolean = true;
  private chunkedResponsesEnabled: boolean = true;
  private precomputedResponses: Map<string, any> = new Map();

  constructor(budget?: Partial<PerformanceBudget>) {
    this.budget = {
      maxResponseTime: 200, // 200ms
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      minCacheHitRate: 0.8, // 80%
      minThroughput: 100, // 100 requests/minute
      maxErrorRate: 0.05, // 5%
      ...budget
    };
  }

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push({
      ...metrics,
      timestamp: Date.now()
    } as any);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    this.checkPerformanceBudget(metrics);
  }

  /**
   * Check if metrics meet performance budget
   */
  private checkPerformanceBudget(metrics: PerformanceMetrics): void {
    const violations: string[] = [];

    if (metrics.responseTime > this.budget.maxResponseTime) {
      violations.push(`Response time ${metrics.responseTime}ms exceeds budget ${this.budget.maxResponseTime}ms`);
    }

    if (metrics.memoryUsage > this.budget.maxMemoryUsage) {
      violations.push(`Memory usage ${metrics.memoryUsage} exceeds budget ${this.budget.maxMemoryUsage}`);
    }

    if (metrics.cacheHitRate < this.budget.minCacheHitRate) {
      violations.push(`Cache hit rate ${metrics.cacheHitRate} below budget ${this.budget.minCacheHitRate}`);
    }

    if (metrics.throughput < this.budget.minThroughput) {
      violations.push(`Throughput ${metrics.throughput} below budget ${this.budget.minThroughput}`);
    }

    if (metrics.errorRate > this.budget.maxErrorRate) {
      violations.push(`Error rate ${metrics.errorRate} exceeds budget ${this.budget.maxErrorRate}`);
    }

    if (violations.length > 0) {
      console.warn('🚨 Performance budget violations:', violations);
    }
  }

  /**
   * Get current performance statistics
   */
  getPerformanceStats(): {
    current: PerformanceMetrics;
    average: PerformanceMetrics;
    budget: PerformanceBudget;
    violations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        current: { responseTime: 0, memoryUsage: 0, cacheHitRate: 0, throughput: 0, errorRate: 0 },
        average: { responseTime: 0, memoryUsage: 0, cacheHitRate: 0, throughput: 0, errorRate: 0 },
        budget: this.budget,
        violations: []
      };
    }

    const current = this.metrics[this.metrics.length - 1];
    const average = this.calculateAverageMetrics();
    
    const violations: string[] = [];
    if (average.responseTime > this.budget.maxResponseTime) violations.push('Response time');
    if (average.memoryUsage > this.budget.maxMemoryUsage) violations.push('Memory usage');
    if (average.cacheHitRate < this.budget.minCacheHitRate) violations.push('Cache hit rate');
    if (average.throughput < this.budget.minThroughput) violations.push('Throughput');
    if (average.errorRate > this.budget.maxErrorRate) violations.push('Error rate');

    return { current, average, budget: this.budget, violations };
  }

  /**
   * Calculate average metrics
   */
  private calculateAverageMetrics(): PerformanceMetrics {
    const count = this.metrics.length;
    const totals = this.metrics.reduce(
      (acc, metric) => ({
        responseTime: acc.responseTime + metric.responseTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
        throughput: acc.throughput + metric.throughput,
        errorRate: acc.errorRate + metric.errorRate
      }),
      { responseTime: 0, memoryUsage: 0, cacheHitRate: 0, throughput: 0, errorRate: 0 }
    );

    return {
      responseTime: totals.responseTime / count,
      memoryUsage: totals.memoryUsage / count,
      cacheHitRate: totals.cacheHitRate / count,
      throughput: totals.throughput / count,
      errorRate: totals.errorRate / count
    };
  }

  /**
   * Optimize response data
   */
  optimizeResponse(data: any, requestKey: string): any {
    const startTime = performance.now();

    // Check for precomputed response
    if (this.precomputedResponses.has(requestKey)) {
      return this.precomputedResponses.get(requestKey);
    }

    let optimizedData = data;

    // Apply compression if enabled
    if (this.compressionEnabled) {
      optimizedData = this.compressResponse(optimizedData);
    }

    // Cache optimized response
    this.precomputedResponses.set(requestKey, optimizedData);

    const optimizationTime = performance.now() - startTime;
    console.debug(`Response optimization took ${optimizationTime.toFixed(2)}ms`);

    return optimizedData;
  }

  /**
   * Compress response data
   */
  private compressResponse(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    // Remove unnecessary fields
    const compressed = { ...data };

    // Remove debugging information in production
    if (process.env.NODE_ENV === 'production') {
      delete compressed.debug;
      delete compressed._internal;
      delete compressed.developmentInfo;
    }

    // Compress arrays with repetitive data
    if (Array.isArray(compressed.results)) {
      compressed.results = this.compressArray(compressed.results);
    }

    // Round floating point numbers to reduce precision
    if (compressed.metadata) {
      compressed.metadata = this.roundFloatingPoints(compressed.metadata);
    }

    return compressed;
  }

  /**
   * Compress array data
   */
  private compressArray(array: any[]): any[] {
    if (array.length === 0) return array;

    // For large arrays, implement pagination
    if (array.length > 1000) {
      return array.slice(0, 100).concat([
        {
          _compressed: true,
          totalItems: array.length,
          displayedItems: 100,
          message: 'Results truncated for performance. Use pagination for full results.'
        }
      ]);
    }

    return array;
  }

  /**
   * Round floating point numbers to reduce precision
   */
  private roundFloatingPoints(obj: any, precision: number = 4): any {
    if (typeof obj === 'number') {
      return Number(obj.toFixed(precision));
    }

    if (typeof obj === 'object' && obj !== null) {
      const rounded: any = {};
      for (const [key, value] of Object.entries(obj)) {
        rounded[key] = this.roundFloatingPoints(value, precision);
      }
      return rounded;
    }

    return obj;
  }

  /**
   * Create chunked response for large data
   */
  createChunkedResponse(data: any[], chunkSize: number = 100): {
    chunk: any[];
    hasMore: boolean;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  } {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / chunkSize);
    const currentPage = 1; // For mock purposes, always return first page
    const startIndex = (currentPage - 1) * chunkSize;
    const endIndex = Math.min(startIndex + chunkSize, totalItems);
    const chunk = data.slice(startIndex, endIndex);

    return {
      chunk,
      hasMore: endIndex < totalItems,
      totalItems,
      currentPage,
      totalPages
    };
  }

  /**
   * Precompute common responses for better performance
   */
  precomputeResponses(responseMap: Map<string, () => any>): void {
    console.log('🚀 Precomputing mock responses for performance...');
    const startTime = performance.now();

    for (const [key, generator] of responseMap.entries()) {
      try {
        const response = generator();
        this.precomputedResponses.set(key, response);
      } catch (error) {
        console.warn(`Failed to precompute response for ${key}:`, error);
      }
    }

    const duration = performance.now() - startTime;
    console.log(`✅ Precomputed ${this.precomputedResponses.size} responses in ${duration.toFixed(2)}ms`);
  }

  /**
   * Clear precomputed responses to free memory
   */
  clearPrecomputedResponses(): void {
    this.precomputedResponses.clear();
    console.log('🧹 Cleared precomputed responses');
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): {
    precomputedResponsesSize: number;
    cacheSize: number;
    totalMemoryUsage: number;
  } {
    const precomputedSize = JSON.stringify(Array.from(this.precomputedResponses.entries())).length;
    const cacheStats = responseCache.getStats();
    
    return {
      precomputedResponsesSize: precomputedSize,
      cacheSize: cacheStats.memoryUsage,
      totalMemoryUsage: precomputedSize + cacheStats.memoryUsage
    };
  }

  /**
   * Configure optimization settings
   */
  configure(options: {
    compressionEnabled?: boolean;
    chunkedResponsesEnabled?: boolean;
    budget?: Partial<PerformanceBudget>;
  }): void {
    if (options.compressionEnabled !== undefined) {
      this.compressionEnabled = options.compressionEnabled;
    }
    
    if (options.chunkedResponsesEnabled !== undefined) {
      this.chunkedResponsesEnabled = options.chunkedResponsesEnabled;
    }
    
    if (options.budget) {
      this.budget = { ...this.budget, ...options.budget };
    }

    console.log('⚙️ Mock performance optimizer configured:', {
      compression: this.compressionEnabled,
      chunkedResponses: this.chunkedResponsesEnabled,
      budget: this.budget
    });
  }

  /**
   * Run performance analysis
   */
  analyzePerformance(): {
    recommendations: string[];
    optimizationPotential: number; // 0-100 percentage
    criticalIssues: string[];
  } {
    const stats = this.getPerformanceStats();
    const memoryUsage = this.getMemoryUsage();
    
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];
    let optimizationPotential = 0;

    // Analyze response times
    if (stats.average.responseTime > this.budget.maxResponseTime * 0.8) {
      recommendations.push('Consider enabling response compression');
      recommendations.push('Implement response precomputation for common queries');
      optimizationPotential += 20;
    }

    if (stats.average.responseTime > this.budget.maxResponseTime) {
      criticalIssues.push('Response time exceeds budget');
    }

    // Analyze memory usage
    if (memoryUsage.totalMemoryUsage > this.budget.maxMemoryUsage * 0.8) {
      recommendations.push('Clear precomputed responses periodically');
      recommendations.push('Implement more aggressive cache eviction');
      optimizationPotential += 15;
    }

    if (memoryUsage.totalMemoryUsage > this.budget.maxMemoryUsage) {
      criticalIssues.push('Memory usage exceeds budget');
    }

    // Analyze cache performance
    if (stats.average.cacheHitRate < this.budget.minCacheHitRate) {
      recommendations.push('Increase cache TTL for stable data');
      recommendations.push('Implement smarter cache keys');
      optimizationPotential += 25;
      
      if (stats.average.cacheHitRate < 0.5) {
        criticalIssues.push('Cache hit rate is critically low');
      }
    }

    return {
      recommendations,
      optimizationPotential: Math.min(100, optimizationPotential),
      criticalIssues
    };
  }
}

// Global performance optimizer instance
export const mockPerformanceOptimizer = new MockPerformanceOptimizer();

// Helper functions for easy usage
export const performanceUtils = {
  /**
   * Optimize a response before sending
   */
  optimizeResponse: (data: any, requestKey: string) => 
    mockPerformanceOptimizer.optimizeResponse(data, requestKey),

  /**
   * Record performance metrics
   */
  recordMetrics: (metrics: PerformanceMetrics) => 
    mockPerformanceOptimizer.recordMetrics(metrics),

  /**
   * Get performance statistics
   */
  getStats: () => mockPerformanceOptimizer.getPerformanceStats(),

  /**
   * Run performance analysis
   */
  analyze: () => mockPerformanceOptimizer.analyzePerformance(),

  /**
   * Configure optimizer
   */
  configure: (options: Parameters<typeof mockPerformanceOptimizer.configure>[0]) =>
    mockPerformanceOptimizer.configure(options)
};

// Auto-configure based on environment
if (typeof window !== 'undefined') {
  const environment = process.env.NODE_ENV || 'development';
  
  if (environment === 'development') {
    mockPerformanceOptimizer.configure({
      compressionEnabled: false, // Disable for easier debugging
      chunkedResponsesEnabled: true,
      budget: {
        maxResponseTime: 500, // More lenient in development
        maxMemoryUsage: 100 * 1024 * 1024 // 100MB
      }
    });
  } else {
    mockPerformanceOptimizer.configure({
      compressionEnabled: true,
      chunkedResponsesEnabled: true,
      budget: {
        maxResponseTime: 200,
        maxMemoryUsage: 50 * 1024 * 1024 // 50MB
      }
    });
  }
}

export default {
  MockPerformanceOptimizer,
  mockPerformanceOptimizer,
  performanceUtils
};