import type { ToolMetadata, ToolRegistryEntry, ToolBundle } from '../types/tools';
import { bundleLoader } from './bundleLoader';

export class ToolRegistry {
  private tools = new Map<string, ToolRegistryEntry>();
  private categories = new Set<string>();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const bundle = await bundleLoader.loadPhase0Bundle();
      this.loadToolsFromBundle(bundle);
      this.initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize tool registry: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private loadToolsFromBundle(bundle: ToolBundle): void {
    for (const toolMetadata of bundle.tools) {
      const entry: ToolRegistryEntry = {
        metadata: toolMetadata,
        loaded: false,
      };
      
      this.tools.set(toolMetadata.id, entry);
      
      // Extract categories from labels
      for (const label of toolMetadata.labels) {
        this.categories.add(label);
      }
    }
  }

  async getTools(): Promise<ToolMetadata[]> {
    await this.initialize();
    return Array.from(this.tools.values()).map(entry => entry.metadata);
  }

  async getToolById(id: string): Promise<ToolMetadata | undefined> {
    await this.initialize();
    const entry = this.tools.get(id);
    return entry?.metadata;
  }

  async getToolsByCategory(category: string): Promise<ToolMetadata[]> {
    await this.initialize();
    const tools = Array.from(this.tools.values());
    return tools
      .filter(entry => entry.metadata.labels.includes(category))
      .map(entry => entry.metadata);
  }

  async getCategories(): Promise<string[]> {
    await this.initialize();
    return Array.from(this.categories).sort();
  }

  async searchTools(searchTerm: string): Promise<ToolMetadata[]> {
    await this.initialize();
    const tools = Array.from(this.tools.values());
    const term = searchTerm.toLowerCase();
    
    return tools
      .filter(entry => {
        const metadata = entry.metadata;
        return (
          metadata.name.toLowerCase().includes(term) ||
          metadata.description.toLowerCase().includes(term) ||
          metadata.labels.some(label => label.toLowerCase().includes(term))
        );
      })
      .map(entry => entry.metadata);
  }

  async getToolStats(): Promise<{ total: number; categories: number; loaded: number }> {
    await this.initialize();
    const loaded = Array.from(this.tools.values()).filter(entry => entry.loaded).length;
    
    return {
      total: this.tools.size,
      categories: this.categories.size,
      loaded,
    };
  }

  markToolAsLoaded(toolId: string): void {
    const entry = this.tools.get(toolId);
    if (entry) {
      entry.loaded = true;
      entry.lastError = undefined;
    }
  }

  markToolAsErrored(toolId: string, error: Error): void {
    const entry = this.tools.get(toolId);
    if (entry) {
      entry.loaded = false;
      entry.lastError = error;
    }
  }

  reset(): void {
    this.tools.clear();
    this.categories.clear();
    this.initialized = false;
  }
}

export const toolRegistry = new ToolRegistry();