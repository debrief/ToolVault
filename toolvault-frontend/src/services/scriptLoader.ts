import type { ToolMetadata } from '../types/tools';
import { toolRegistry } from './toolRegistry';

// Declare window.ToolVault for TypeScript
declare global {
  interface Window {
    ToolVault?: {
      tools?: Record<string, (input: unknown, params: Record<string, unknown>) => unknown>;
    };
  }
}

export class ScriptLoader {
  private loadedScripts = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  async loadTool(toolId: string): Promise<void> {
    // Check if already loaded
    if (this.loadedScripts.has(toolId)) {
      return;
    }

    // Check if currently loading
    const existingPromise = this.loadingPromises.get(toolId);
    if (existingPromise) {
      return existingPromise;
    }

    // Get tool metadata
    const toolMetadata = await toolRegistry.getToolById(toolId);
    if (!toolMetadata) {
      throw new Error(`Tool ${toolId} not found in registry`);
    }

    // Create loading promise
    const loadingPromise = this.loadToolScript(toolMetadata);
    this.loadingPromises.set(toolId, loadingPromise);

    try {
      await loadingPromise;
      this.loadedScripts.add(toolId);
      toolRegistry.markToolAsLoaded(toolId);
    } catch (error) {
      const loadError = error instanceof Error ? error : new Error('Unknown loading error');
      toolRegistry.markToolAsErrored(toolId, loadError);
      throw loadError;
    } finally {
      this.loadingPromises.delete(toolId);
    }
  }

  private async loadToolScript(toolMetadata: ToolMetadata): Promise<void> {
    return new Promise((resolve, reject) => {
      // Determine script path based on tool category
      const category = this.getToolCategory(toolMetadata);
      const scriptPath = import.meta.env.DEV
        ? `/../examples/javascript-bundle/tools/${category}/${toolMetadata.id}.js`
        : `/examples/javascript-bundle/tools/${category}/${toolMetadata.id}.js`; // In production, this will be bundled

      // Create script element
      const script = document.createElement('script');
      script.src = scriptPath;
      script.type = 'text/javascript';

      // Handle load success
      script.onload = () => {
        // Verify tool was registered in window.ToolVault.tools
        if (this.isToolAvailable(toolMetadata.id)) {
          document.head.removeChild(script);
          resolve();
        } else {
          document.head.removeChild(script);
          reject(new Error(`Tool ${toolMetadata.id} was not properly registered`));
        }
      };

      // Handle load error
      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error(`Failed to load script for tool ${toolMetadata.id}`));
      };

      // Add script to document
      document.head.appendChild(script);
    });
  }

  private getToolCategory(toolMetadata: ToolMetadata): string {
    // Map tool labels to directory structure
    const categoryMap: Record<string, string> = {
      'transform': 'transform',
      'analysis': 'analysis', 
      'statistics': 'statistics',
      'processing': 'processing',
      'io': 'io',
    };

    for (const label of toolMetadata.labels) {
      if (categoryMap[label]) {
        return categoryMap[label];
      }
    }

    // Default fallback
    return 'transform';
  }

  private isToolAvailable(toolId: string): boolean {
    return !!(window.ToolVault?.tools?.[toolId]);
  }

  async loadAllTools(): Promise<void> {
    const tools = await toolRegistry.getTools();
    const loadPromises = tools.map(tool => this.loadTool(tool.id));
    
    // Load tools in parallel but collect all errors
    const results = await Promise.allSettled(loadPromises);
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    if (errors.length > 0) {
      throw new Error(`Failed to load ${errors.length} tools: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  getLoadedTools(): string[] {
    return Array.from(this.loadedScripts);
  }

  isToolLoaded(toolId: string): boolean {
    return this.loadedScripts.has(toolId) && this.isToolAvailable(toolId);
  }

  reset(): void {
    this.loadedScripts.clear();
    this.loadingPromises.clear();
    
    // Clear window.ToolVault if it exists
    if (window.ToolVault?.tools) {
      window.ToolVault.tools = {};
    }
  }
}

export const scriptLoader = new ScriptLoader();