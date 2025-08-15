/**
 * Response helpers for optimized mock responses and caching
 */

export class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached response if valid
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached response with optional TTL
   */
  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(), 
      ttl: ttl || this.defaultTTL 
    });
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    const expired = entries.filter(e => now - e.timestamp > e.ttl).length;
    
    return {
      totalEntries: this.cache.size,
      expiredEntries: expired,
      activeEntries: this.cache.size - expired,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

/**
 * Create streaming response for large datasets
 */
export function createStreamingResponse(data: any[], chunkSize: number = 100): Response {
  const encoder = new TextEncoder();
  let index = 0;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('['));
    },
    
    pull(controller) {
      if (index >= data.length) {
        controller.enqueue(encoder.encode(']'));
        controller.close();
        return;
      }

      const chunk = data.slice(index, index + chunkSize);
      const isLastChunk = index + chunkSize >= data.length;
      
      const json = chunk.map((item, i) => {
        const jsonItem = JSON.stringify(item);
        const needsComma = index > 0 || i > 0;
        const hasTrailingComma = !isLastChunk || i < chunk.length - 1;
        
        return (needsComma ? ',' : '') + jsonItem + (hasTrailingComma && i === chunk.length - 1 ? '' : '');
      }).join(',');

      controller.enqueue(encoder.encode(json));
      index += chunkSize;
    }
  });

  return new Response(stream, {
    headers: { 
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked'
    }
  });
}

/**
 * Create paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function createPaginatedResponse<T>(
  allData: T[],
  page: number = 1,
  pageSize: number = 20
): PaginatedResponse<T> {
  const totalItems = allData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const data = allData.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
}

/**
 * Simulate network delay for realistic responses
 */
export async function simulateNetworkDelay(ms: number = 100): Promise<void> {
  if (ms <= 0) return;
  
  // Add some randomness to delay to make it more realistic
  const actualDelay = ms + (Math.random() - 0.5) * ms * 0.3;
  return new Promise(resolve => setTimeout(resolve, Math.max(0, actualDelay)));
}

/**
 * Compress response data (mock compression)
 */
export function compressResponse(data: any): { data: string; compressed: boolean; originalSize: number; compressedSize: number } {
  const originalJson = JSON.stringify(data);
  const originalSize = originalJson.length;
  
  // Mock compression - in reality this would use actual compression
  const shouldCompress = originalSize > 1000; // Compress if larger than 1KB
  
  if (shouldCompress) {
    // Simulate compression by removing unnecessary whitespace and shortening keys
    const compressedJson = originalJson.replace(/\s+/g, ' ').trim();
    return {
      data: compressedJson,
      compressed: true,
      originalSize,
      compressedSize: compressedJson.length
    };
  }

  return {
    data: originalJson,
    compressed: false,
    originalSize,
    compressedSize: originalSize
  };
}

/**
 * Create error response with consistent format
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 500
): { response: ErrorResponse; status: number } {
  return {
    response: {
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    },
    status
  };
}

/**
 * Create success response with metadata
 */
export interface SuccessResponse<T> {
  data: T;
  metadata: {
    timestamp: string;
    requestId: string;
    executionTime?: number;
    cached?: boolean;
  };
}

export function createSuccessResponse<T>(
  data: T,
  executionTime?: number,
  cached: boolean = false
): SuccessResponse<T> {
  return {
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      executionTime,
      cached
    }
  };
}

/**
 * Mock response performance metrics
 */
export class ResponseMetrics {
  private metrics: Array<{
    endpoint: string;
    method: string;
    responseTime: number;
    timestamp: number;
    cached: boolean;
    size: number;
  }> = [];

  record(
    endpoint: string,
    method: string,
    responseTime: number,
    cached: boolean,
    size: number
  ): void {
    this.metrics.push({
      endpoint,
      method,
      responseTime,
      timestamp: Date.now(),
      cached,
      size
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.responseTime, 0);
    return sum / relevantMetrics.length;
  }

  getCacheHitRate(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const cacheHits = relevantMetrics.filter(m => m.cached).length;
    return cacheHits / relevantMetrics.length;
  }

  getStats() {
    const now = Date.now();
    const last5Minutes = this.metrics.filter(m => now - m.timestamp < 5 * 60 * 1000);
    
    return {
      totalRequests: this.metrics.length,
      last5MinuteRequests: last5Minutes.length,
      averageResponseTime: this.getAverageResponseTime(),
      cacheHitRate: this.getCacheHitRate(),
      averageResponseSize: this.metrics.length > 0 
        ? this.metrics.reduce((acc, m) => acc + m.size, 0) / this.metrics.length 
        : 0
    };
  }
}

// Global instances
export const responseCache = new ResponseCache();
export const responseMetrics = new ResponseMetrics();

// Enhanced response creation with performance optimization
export function createOptimizedSuccessResponse<T>(
  data: T,
  requestKey: string,
  executionTime?: number,
  cached: boolean = false
): SuccessResponse<T> {
  // Apply performance optimization if available
  let optimizedData = data;
  try {
    const { performanceUtils } = require('./performanceOptimization');
    optimizedData = performanceUtils.optimizeResponse(data, requestKey);
    
    // Record performance metrics
    performanceUtils.recordMetrics({
      responseTime: executionTime || 0,
      memoryUsage: JSON.stringify(optimizedData).length,
      cacheHitRate: cached ? 1 : 0,
      throughput: 1, // Single request
      errorRate: 0
    });
  } catch (error) {
    // Fallback to original data if optimization fails
    console.debug('Performance optimization not available, using original data');
  }

  return createSuccessResponse(optimizedData, executionTime, cached);
}

// Enhanced error response with performance tracking
export function createOptimizedErrorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 500
): { response: ErrorResponse; status: number } {
  try {
    const { performanceUtils } = require('./performanceOptimization');
    performanceUtils.recordMetrics({
      responseTime: 0,
      memoryUsage: JSON.stringify({ code, message, details }).length,
      cacheHitRate: 0,
      throughput: 1,
      errorRate: 1
    });
  } catch (error) {
    // Continue without performance tracking
  }

  return createErrorResponse(code, message, details, status);
}

// Cleanup interval to prevent memory leaks
if (typeof window !== 'undefined') {
  setInterval(() => {
    responseCache.cleanup();
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
  
  // Memory pressure cleanup
  setInterval(() => {
    const memoryInfo = (performance as any).memory;
    if (memoryInfo && memoryInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
      console.log('🧹 High memory usage detected, clearing cache');
      responseCache.clear();
    }
  }, 10 * 60 * 1000); // Check every 10 minutes
}