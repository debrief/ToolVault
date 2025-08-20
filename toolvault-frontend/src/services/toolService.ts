// Integrated tool service that combines registry, bundle loading, and script loading
import type { ToolMetadata, ToolExecutionResult } from '../types/tools';
import { toolRegistry } from './toolRegistry';
import { scriptLoader } from './scriptLoader';

export class ToolService {
  async loadTools(): Promise<ToolMetadata[]> {
    await toolRegistry.initialize();
    return toolRegistry.getTools();
  }

  async getToolById(id: string): Promise<ToolMetadata | undefined> {
    return toolRegistry.getToolById(id);
  }

  async getToolsByCategory(category: string): Promise<ToolMetadata[]> {
    return toolRegistry.getToolsByCategory(category);
  }

  async getCategories(): Promise<string[]> {
    return toolRegistry.getCategories();
  }

  async searchTools(searchTerm: string): Promise<ToolMetadata[]> {
    return toolRegistry.searchTools(searchTerm);
  }

  async loadToolScript(toolId: string): Promise<void> {
    await scriptLoader.loadTool(toolId);
  }

  async loadAllToolScripts(): Promise<void> {
    await scriptLoader.loadAllTools();
  }

  isToolLoaded(toolId: string): boolean {
    return scriptLoader.isToolLoaded(toolId);
  }

  async executeTools(
    toolId: string,
    input: unknown,
    parameters: Record<string, unknown>
  ): Promise<ToolExecutionResult> {
    const startTime = performance.now();

    try {
      // Ensure tool is loaded
      if (!this.isToolLoaded(toolId)) {
        await this.loadToolScript(toolId);
      }

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

      // Execute tool via window.ToolVault.tools using the correct function name
      const functionName = functionNameMap[toolId] || toolId;
      const toolFunction = window.ToolVault?.tools?.[functionName];
      if (!toolFunction) {
        throw new Error(`Tool ${toolId} is not available (function: ${functionName})`);
      }

      const output = toolFunction(input, parameters);
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        output,
        executionTime,
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  }

  async getToolStats(): Promise<{ total: number; categories: number; loaded: number }> {
    return toolRegistry.getToolStats();
  }
}

export const toolService = new ToolService();