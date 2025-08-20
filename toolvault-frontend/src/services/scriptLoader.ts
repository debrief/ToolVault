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

    // Handle tool dependencies
    await this.loadDependencies(toolId);

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

  private async loadDependencies(toolId: string): Promise<void> {
    // Define tool dependencies
    const dependencies: Record<string, string[]> = {
      'flip-vertical': ['flip-horizontal'],
    };

    const deps = dependencies[toolId];
    if (deps) {
      // Load dependencies recursively
      for (const dep of deps) {
        await this.loadTool(dep);
      }
    }
  }

  private async loadToolScript(toolMetadata: ToolMetadata): Promise<void> {
    return new Promise((resolve, reject) => {
      // Determine script path based on tool category
      const category = this.getToolCategory(toolMetadata);
      const basePath = import.meta.env.BASE_URL || '/';
      const scriptPath = import.meta.env.DEV
        ? `/examples/javascript-bundle/tools/${category}/${toolMetadata.id}.js`  // Vite dev server can serve parent directories with fs.allow
        : `${basePath}examples/javascript-bundle/tools/${category}/${toolMetadata.id}.js`; // In production, use the base path

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
    // Map tool IDs to their actual function names in the JavaScript files
    const functionNameMap: Record<string, string> = {
      // Transform tools
      'translate': 'translate',
      'flip-horizontal': 'flipHorizontal', 
      'flip-vertical': 'flipVertical',
      
      // Analysis tools
      'speed-series': 'calculateSpeedSeries',
      'direction-series': 'calculateDirectionSeries',
      
      // Statistics tools
      'average-speed': 'calculateAverageSpeed',
      'speed-histogram': 'createSpeedHistogram',
      
      // Processing tools
      'smooth-polyline': 'smoothPolyline',
      
      // I/O tools
      'export-csv': 'exportCSV',
      'export-rep': 'exportREP',
      'import-rep': 'importREP',
    };

    const functionName = functionNameMap[toolId] || toolId;
    return !!(window.ToolVault?.tools?.[functionName]);
  }

  async loadAllTools(): Promise<void> {
    const tools = await toolRegistry.getTools();
    
    // Load tools with dependencies first - sort by dependency order
    const sortedTools = this.sortToolsByDependencies(tools.map(t => t.id));
    
    for (const toolId of sortedTools) {
      try {
        await this.loadTool(toolId);
      } catch (error) {
        console.warn(`Failed to load tool ${toolId}:`, error);
        // Continue loading other tools even if one fails
      }
    }
  }

  private sortToolsByDependencies(toolIds: string[]): string[] {
    const dependencies: Record<string, string[]> = {
      'flip-vertical': ['flip-horizontal'],
    };

    const sorted: string[] = [];
    const visited = new Set<string>();
    
    const visit = (toolId: string) => {
      if (visited.has(toolId) || !toolIds.includes(toolId)) {
        return;
      }
      
      visited.add(toolId);
      
      // Visit dependencies first
      const deps = dependencies[toolId] || [];
      for (const dep of deps) {
        visit(dep);
      }
      
      sorted.push(toolId);
    };
    
    for (const toolId of toolIds) {
      visit(toolId);
    }
    
    return sorted;
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