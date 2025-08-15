import React, { useEffect, useRef, useCallback } from 'react';

// Memory leak prevention utilities
export interface MemoryTracker {
  track: (key: string, cleanup: () => void) => void;
  untrack: (key: string) => void;
  cleanup: () => void;
  getTrackedCount: () => number;
}

// Create a memory tracker for managing cleanup functions
export function createMemoryTracker(): MemoryTracker {
  const cleanupMap = new Map<string, () => void>();

  return {
    track: (key: string, cleanup: () => void) => {
      // Clean up existing if key already exists
      if (cleanupMap.has(key)) {
        try {
          cleanupMap.get(key)?.();
        } catch (error) {
          console.warn(`Cleanup error for key "${key}":`, error);
        }
      }
      cleanupMap.set(key, cleanup);
    },

    untrack: (key: string) => {
      if (cleanupMap.has(key)) {
        try {
          cleanupMap.get(key)?.();
        } catch (error) {
          console.warn(`Cleanup error for key "${key}":`, error);
        }
        cleanupMap.delete(key);
      }
    },

    cleanup: () => {
      for (const [key, cleanup] of cleanupMap.entries()) {
        try {
          cleanup();
        } catch (error) {
          console.warn(`Cleanup error for key "${key}":`, error);
        }
      }
      cleanupMap.clear();
    },

    getTrackedCount: () => cleanupMap.size,
  };
}

// Global memory tracker instance
const globalMemoryTracker = createMemoryTracker();

// Hook for automatic cleanup on unmount
export function useCleanup(cleanup?: () => void) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current = cleanup || null;

    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
        } catch (error) {
          console.warn('Cleanup error:', error);
        }
      }
    };
  }, [cleanup]);

  const updateCleanup = useCallback((newCleanup: () => void) => {
    cleanupRef.current = newCleanup;
  }, []);

  return { updateCleanup };
}

// Hook for managing multiple cleanup functions
export function useCleanupManager() {
  const tracker = useRef<MemoryTracker>(createMemoryTracker());

  useEffect(() => {
    return () => {
      tracker.current.cleanup();
    };
  }, []);

  return tracker.current;
}

// AbortController manager for request cancellation
export class AbortControllerManager {
  private controllers = new Map<string, AbortController>();

  create(key: string): AbortController {
    // Abort existing controller if it exists
    this.abort(key);
    
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  abort(key: string): boolean {
    const controller = this.controllers.get(key);
    if (controller && !controller.signal.aborted) {
      controller.abort();
      this.controllers.delete(key);
      return true;
    }
    return false;
  }

  abortAll(): void {
    for (const [key, controller] of this.controllers.entries()) {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    }
    this.controllers.clear();
  }

  cleanup(): void {
    this.abortAll();
  }

  getActiveCount(): number {
    return Array.from(this.controllers.values())
      .filter(controller => !controller.signal.aborted).length;
  }
}

// Hook for AbortController management
export function useAbortController() {
  const managerRef = useRef<AbortControllerManager>(new AbortControllerManager());

  useEffect(() => {
    return () => {
      managerRef.current.cleanup();
    };
  }, []);

  return managerRef.current;
}

// Timer management utilities
export class TimerManager {
  private timers = new Map<string, NodeJS.Timeout>();
  private intervals = new Map<string, NodeJS.Timeout>();

  setTimeout(key: string, callback: () => void, delay: number): void {
    this.clearTimeout(key);
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(key);
    }, delay);
    this.timers.set(key, timer);
  }

  setInterval(key: string, callback: () => void, interval: number): void {
    this.clearInterval(key);
    const timer = setInterval(callback, interval);
    this.intervals.set(key, timer);
  }

  clearTimeout(key: string): boolean {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
      return true;
    }
    return false;
  }

  clearInterval(key: string): boolean {
    const timer = this.intervals.get(key);
    if (timer) {
      clearInterval(timer);
      this.intervals.delete(key);
      return true;
    }
    return false;
  }

  clearAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.intervals.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
    this.intervals.clear();
  }

  cleanup(): void {
    this.clearAll();
  }

  getActiveTimerCount(): number {
    return this.timers.size + this.intervals.size;
  }
}

// Hook for timer management
export function useTimerManager() {
  const managerRef = useRef<TimerManager>(new TimerManager());

  useEffect(() => {
    return () => {
      managerRef.current.cleanup();
    };
  }, []);

  return managerRef.current;
}

// Event listener manager
export class EventListenerManager {
  private listeners = new Map<string, { element: EventTarget; event: string; listener: EventListener; options?: AddEventListenerOptions }>();

  add(
    key: string,
    element: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    this.remove(key);
    element.addEventListener(event, listener, options);
    this.listeners.set(key, { element, event, listener, options });
  }

  remove(key: string): boolean {
    const entry = this.listeners.get(key);
    if (entry) {
      entry.element.removeEventListener(entry.event, entry.listener, entry.options);
      this.listeners.delete(key);
      return true;
    }
    return false;
  }

  removeAll(): void {
    for (const [key, entry] of this.listeners.entries()) {
      entry.element.removeEventListener(entry.event, entry.listener, entry.options);
    }
    this.listeners.clear();
  }

  cleanup(): void {
    this.removeAll();
  }

  getActiveCount(): number {
    return this.listeners.size;
  }
}

// Hook for event listener management
export function useEventListenerManager() {
  const managerRef = useRef<EventListenerManager>(new EventListenerManager());

  useEffect(() => {
    return () => {
      managerRef.current.cleanup();
    };
  }, []);

  return managerRef.current;
}

// Observer manager for MutationObserver, IntersectionObserver, etc.
export class ObserverManager {
  private observers = new Map<string, { observer: any; disconnect: () => void }>();

  add(key: string, observer: { disconnect(): void }): void {
    this.remove(key);
    this.observers.set(key, {
      observer,
      disconnect: () => observer.disconnect(),
    });
  }

  remove(key: string): boolean {
    const entry = this.observers.get(key);
    if (entry) {
      try {
        entry.disconnect();
      } catch (error) {
        console.warn(`Error disconnecting observer "${key}":`, error);
      }
      this.observers.delete(key);
      return true;
    }
    return false;
  }

  removeAll(): void {
    for (const [key, entry] of this.observers.entries()) {
      try {
        entry.disconnect();
      } catch (error) {
        console.warn(`Error disconnecting observer "${key}":`, error);
      }
    }
    this.observers.clear();
  }

  cleanup(): void {
    this.removeAll();
  }

  getActiveCount(): number {
    return this.observers.size;
  }
}

// Hook for observer management
export function useObserverManager() {
  const managerRef = useRef<ObserverManager>(new ObserverManager());

  useEffect(() => {
    return () => {
      managerRef.current.cleanup();
    };
  }, []);

  return managerRef.current;
}

// All-in-one resource manager
export class ResourceManager {
  public readonly timers = new TimerManager();
  public readonly events = new EventListenerManager();
  public readonly observers = new ObserverManager();
  public readonly abortControllers = new AbortControllerManager();
  public readonly memory = createMemoryTracker();

  cleanup(): void {
    this.timers.cleanup();
    this.events.cleanup();
    this.observers.cleanup();
    this.abortControllers.cleanup();
    this.memory.cleanup();
  }

  getResourceCounts() {
    return {
      timers: this.timers.getActiveTimerCount(),
      events: this.events.getActiveCount(),
      observers: this.observers.getActiveCount(),
      abortControllers: this.abortControllers.getActiveCount(),
      memoryTracked: this.memory.getTrackedCount(),
    };
  }
}

// Hook for complete resource management
export function useResourceManager() {
  const managerRef = useRef<ResourceManager>(new ResourceManager());

  useEffect(() => {
    return () => {
      managerRef.current.cleanup();
    };
  }, []);

  return managerRef.current;
}

// Memory usage monitoring
export interface MemoryUsage {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

export function getMemoryUsage(): MemoryUsage | null {
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
}

// Memory monitoring hook
export function useMemoryMonitor(threshold: number = 50 * 1024 * 1024) { // 50MB default
  const [memoryUsage, setMemoryUsage] = React.useState<MemoryUsage | null>(null);
  const [isHighUsage, setIsHighUsage] = React.useState(false);

  useEffect(() => {
    const checkMemory = () => {
      const usage = getMemoryUsage();
      if (usage) {
        setMemoryUsage(usage);
        setIsHighUsage((usage.usedJSHeapSize || 0) > threshold);
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [threshold]);

  return { memoryUsage, isHighUsage };
}

// WeakMap cache for preventing memory leaks with cached data
export class WeakMapCache<K extends object, V> {
  private cache = new WeakMap<K, V>();

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

// Cache with automatic cleanup
export class TTLCache<K, V> {
  private cache = new Map<K, { value: V; expires: number }>();
  private cleanupTimer?: NodeJS.Timeout;

  constructor(private defaultTTL: number = 300000) { // 5 minutes default
    this.scheduleCleanup();
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      if (Date.now() > entry.expires) {
        this.cache.delete(key);
        return undefined;
      }
      return entry.value;
    }
    return undefined;
  }

  set(key: K, value: V, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expires });
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  private scheduleCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cleanupTimer = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Export global instances for convenience
export { globalMemoryTracker };