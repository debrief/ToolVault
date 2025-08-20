import type { ToolBundle, ToolMetadata } from '../types/tools';

export class BundleLoader {
  private cache = new Map<string, ToolBundle>();

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
    // Load the Phase 0 JavaScript bundle from the original location
    const bundlePath = import.meta.env.DEV 
      ? '/../examples/javascript-bundle/index.json'
      : '/examples/javascript-bundle/index.json'; // In production, this will be bundled
    
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

  clearCache(): void {
    this.cache.clear();
  }
}

export const bundleLoader = new BundleLoader();