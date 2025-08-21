import type { ToolBundle, ToolMetadata, ToolHistory, ToolHistoryCommit } from '../types/tools';

export class BundleLoader {
  private cache = new Map<string, ToolBundle>();
  private historyCache: ToolHistory | null = null;

  async loadBundle(bundlePath: string): Promise<ToolBundle> {
    // Check cache first
    if (this.cache.has(bundlePath)) {
      const cached = this.cache.get(bundlePath);
      if (cached) return cached;
    }

    try {
      // In development, load from examples directory
      // In production, this would be bundled with the app
      const response = await fetch(bundlePath);
      if (!response.ok) {
        throw new Error(`Failed to load bundle: ${response.statusText}`);
      }

      const bundle: ToolBundle = await response.json();
      
      // Validate bundle structure
      this.validateBundle(bundle);
      
      // Cache the bundle
      this.cache.set(bundlePath, bundle);
      
      return bundle;
    } catch (error) {
      throw new Error(
        `Bundle loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async loadPhase0Bundle(): Promise<ToolBundle> {
    // Load the Phase 0 JavaScript bundle from the correct location
    const basePath = import.meta.env.BASE_URL || '/';
    const isPreviewMode = import.meta.env.VITE_PREVIEW_MODE === 'true';
    
    const bundlePath = import.meta.env.DEV 
      ? '/examples/javascript-bundle/index.json'  // Vite dev server can serve parent directories with fs.allow
      : isPreviewMode 
        ? '/examples/javascript-bundle/index.json'  // Preview mode serves from root
        : `${basePath}examples/javascript-bundle/index.json`; // GitHub Pages production
    
    return this.loadBundle(bundlePath);
  }

  private validateBundle(bundle: ToolBundle): void {
    if (!bundle.name || !bundle.tools || !Array.isArray(bundle.tools)) {
      throw new Error('Invalid bundle format: missing name or tools array');
    }

    for (const tool of bundle.tools) {
      this.validateTool(tool);
    }
  }

  private validateTool(tool: ToolMetadata): void {
    const requiredFields = ['id', 'name', 'description', 'parameters'];
    for (const field of requiredFields) {
      if (!tool[field as keyof ToolMetadata]) {
        throw new Error(`Invalid tool: missing ${field}`);
      }
    }

    if (!Array.isArray(tool.parameters)) {
      throw new Error(`Invalid tool ${tool.id}: parameters must be an array`);
    }
  }

  async loadHistory(): Promise<ToolHistory> {
    // Check cache first
    if (this.historyCache) {
      return this.historyCache;
    }

    try {
      const basePath = import.meta.env.BASE_URL || '/';
      const isPreviewMode = import.meta.env.VITE_PREVIEW_MODE === 'true';
      
      const historyPath = import.meta.env.DEV 
        ? '/examples/javascript-bundle/history.json'
        : isPreviewMode 
          ? '/examples/javascript-bundle/history.json'  // Preview mode serves from root
          : `${basePath}examples/javascript-bundle/history.json`; // GitHub Pages production
      
      const response = await fetch(historyPath);
      if (!response.ok) {
        throw new Error(`Failed to load history: ${response.statusText}`);
      }

      const history: ToolHistory = await response.json();
      
      // Cache the history
      this.historyCache = history;
      
      return history;
    } catch (error) {
      throw new Error(
        `History loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getToolHistory(toolId: string): Promise<ToolHistoryCommit[]> {
    const history = await this.loadHistory();
    return history[toolId] || [];
  }

  clearCache(): void {
    this.cache.clear();
    this.historyCache = null;
  }
}

export const bundleLoader = new BundleLoader();