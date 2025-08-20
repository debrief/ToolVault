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

      // Execute tool via window.ToolVault.tools
      const toolFunction = window.ToolVault?.tools?.[toolId];
      if (!toolFunction) {
        throw new Error(`Tool ${toolId} is not available`);
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