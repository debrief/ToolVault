import type { ToolExecutionService } from '../types/execution';
import { MockToolExecutionService, ProductionToolExecutionService } from './toolExecutionService';

/**
 * Service factory for environment-based service selection
 */

export interface ServiceConfig {
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  enableCaching?: boolean;
  enableMetrics?: boolean;
}

export interface EnvironmentConfig {
  development: ServiceConfig;
  production: ServiceConfig;
  test: ServiceConfig;
}

// Default configuration for each environment
const defaultEnvironmentConfig: EnvironmentConfig = {
  development: {
    baseUrl: '',
    timeout: 30000,
    retryAttempts: 3,
    enableCaching: true,
    enableMetrics: true
  },
  production: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 15000,
    retryAttempts: 2,
    enableCaching: true,
    enableMetrics: false
  },
  test: {
    baseUrl: '',
    timeout: 5000,
    retryAttempts: 1,
    enableCaching: false,
    enableMetrics: false
  }
};

/**
 * Get current environment
 */
export function getCurrentEnvironment(): keyof EnvironmentConfig {
  if (import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test') {
    return 'test';
  }
  
  if (import.meta.env.MODE === 'production' || process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  return 'development';
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(environment?: keyof EnvironmentConfig): ServiceConfig {
  const env = environment || getCurrentEnvironment();
  return defaultEnvironmentConfig[env];
}

/**
 * Determine whether to use mock service
 */
export function shouldUseMockService(): boolean {
  // Check environment variables
  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    return true;
  }
  
  if (import.meta.env.VITE_USE_MOCK_API === 'false') {
    return false;
  }
  
  // Check URL parameters (for runtime switching)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('mock')) {
      return urlParams.get('mock') === 'true';
    }
  }
  
  // Default based on environment
  const environment = getCurrentEnvironment();
  return environment === 'development' || environment === 'test';
}

/**
 * Create tool execution service based on environment and configuration
 */
export function createToolExecutionService(config?: Partial<ServiceConfig>): ToolExecutionService {
  const environment = getCurrentEnvironment();
  const environmentConfig = getEnvironmentConfig(environment);
  const finalConfig = { ...environmentConfig, ...config };
  
  if (shouldUseMockService()) {
    console.log(`🎭 Using Mock Tool Execution Service (${environment})`);
    return new MockToolExecutionService(finalConfig.baseUrl);
  } else {
    console.log(`🚀 Using Production Tool Execution Service (${environment})`);
    return new ProductionToolExecutionService(finalConfig.baseUrl);
  }
}

/**
 * Create service with explicit mock/production choice
 */
export function createMockToolExecutionService(config?: Partial<ServiceConfig>): MockToolExecutionService {
  const environmentConfig = getEnvironmentConfig();
  const finalConfig = { ...environmentConfig, ...config };
  return new MockToolExecutionService(finalConfig.baseUrl);
}

export function createProductionToolExecutionService(config?: Partial<ServiceConfig>): ProductionToolExecutionService {
  const environmentConfig = getEnvironmentConfig();
  const finalConfig = { ...environmentConfig, ...config };
  return new ProductionToolExecutionService(finalConfig.baseUrl);
}

/**
 * Service switching utilities for runtime environment changes
 */
export class ServiceManager {
  private static instance: ServiceManager;
  private currentService: ToolExecutionService;
  private config: ServiceConfig;
  private listeners: Array<(service: ToolExecutionService) => void> = [];

  private constructor() {
    this.config = getEnvironmentConfig();
    this.currentService = this.createService();
  }

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  private createService(): ToolExecutionService {
    return createToolExecutionService(this.config);
  }

  /**
   * Get current service instance
   */
  getCurrentService(): ToolExecutionService {
    return this.currentService;
  }

  /**
   * Switch to mock service
   */
  switchToMockService(config?: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.currentService = createMockToolExecutionService(this.config);
    this.notifyListeners();
    console.log('🎭 Switched to Mock Tool Execution Service');
  }

  /**
   * Switch to production service
   */
  switchToProductionService(config?: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.currentService = createProductionToolExecutionService(this.config);
    this.notifyListeners();
    console.log('🚀 Switched to Production Tool Execution Service');
  }

  /**
   * Update configuration and recreate service
   */
  updateConfiguration(config: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.currentService = this.createService();
    this.notifyListeners();
    console.log('⚙️ Updated service configuration');
  }

  /**
   * Add listener for service changes
   */
  addServiceChangeListener(listener: (service: ToolExecutionService) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove service change listener
   */
  removeServiceChangeListener(listener: (service: ToolExecutionService) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentService));
  }

  /**
   * Get service information
   */
  getServiceInfo() {
    return {
      type: this.currentService instanceof MockToolExecutionService ? 'mock' : 'production',
      environment: getCurrentEnvironment(),
      config: this.config,
      shouldUseMock: shouldUseMockService()
    };
  }
}

// Default service instance (singleton)
export const serviceManager = ServiceManager.getInstance();

/**
 * Get the current tool execution service instance
 */
export function getToolExecutionService(): ToolExecutionService {
  return serviceManager.getCurrentService();
}

/**
 * Development utilities for service switching
 */
export const devUtils = {
  // Switch service at runtime (development only)
  switchService: (type: 'mock' | 'production') => {
    if (getCurrentEnvironment() !== 'development') {
      console.warn('Service switching is only available in development mode');
      return;
    }
    
    if (type === 'mock') {
      serviceManager.switchToMockService();
    } else {
      serviceManager.switchToProductionService();
    }
  },

  // Get service information
  getServiceInfo: () => serviceManager.getServiceInfo(),

  // Update service configuration
  updateConfig: (config: Partial<ServiceConfig>) => {
    if (getCurrentEnvironment() !== 'development') {
      console.warn('Configuration updates are only available in development mode');
      return;
    }
    serviceManager.updateConfiguration(config);
  }
};

// Expose development utilities globally in development mode
if (getCurrentEnvironment() === 'development' && typeof window !== 'undefined') {
  (window as any).toolVaultDevUtils = devUtils;
  console.log('🛠️ ToolVault development utilities available at window.toolVaultDevUtils');
}

export default {
  createToolExecutionService,
  createMockToolExecutionService,
  createProductionToolExecutionService,
  getCurrentEnvironment,
  getEnvironmentConfig,
  shouldUseMockService,
  serviceManager,
  getToolExecutionService,
  devUtils
};