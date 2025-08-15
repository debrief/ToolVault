import React from 'react';
import { Index as FlexSearchIndex } from 'flexsearch';
import type { Tool, ToolInput, ToolOutput } from '../types/index';

// Enhanced search interfaces
export interface SearchOptions {
  query: string;
  fields: SearchField[];
  fuzzy: boolean;
  highlightMatches: boolean;
  maxResults: number;
}

export interface SearchField {
  name: string;
  weight: number;
}

export interface SearchMatch {
  field: string;
  value: string;
  indices: [number, number][];
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: SearchMatch[];
}

export interface FilterOptions {
  categories: string[];
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced' | null;
  lastUpdated: 'week' | 'month' | 'year' | null;
  inputTypes: string[];
  outputTypes: string[];
  status: 'new' | 'updated' | 'stable' | 'deprecated' | null;
}

export interface SortOption {
  field: 'name' | 'category' | 'updated' | 'popularity' | 'relevance';
  direction: 'asc' | 'desc';
}

export interface ToolMetadata {
  created?: string;
  updated?: string;
  status?: 'new' | 'beta' | 'stable' | 'deprecated';
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  usage?: {
    executions: number;
    lastUsed?: string;
  };
}

// Legacy search filters for backward compatibility
export interface SearchFilters {
  query: string;
  category?: string;
  tags?: string[];
}

/**
 * Advanced search engine powered by FlexSearch
 */
export class AdvancedSearchEngine {
  private index: FlexSearchIndex;
  private documents: Map<string, Tool> = new Map();
  private metadata: Map<string, ToolMetadata> = new Map();

  constructor() {
    this.index = new FlexSearchIndex({
      preset: 'performance',
      tokenize: 'full',
      resolution: 3,
      minlength: 2,
      // Configure stemming and phonetic matching for fuzzy search
      stemmer: 'en',
      filter: ['the', 'a', 'an', 'and', 'or', 'but'],
    });
  }

  /**
   * Index a tool for searching
   */
  indexTool(tool: Tool, metadata?: ToolMetadata): void {
    const searchableContent = this.createSearchableContent(tool);
    this.index.add(tool.id, searchableContent);
    this.documents.set(tool.id, tool);
    if (metadata) {
      this.metadata.set(tool.id, metadata);
    }
  }

  /**
   * Remove a tool from the index
   */
  removeTool(toolId: string): void {
    this.index.remove(toolId);
    this.documents.delete(toolId);
    this.metadata.delete(toolId);
  }

  /**
   * Update tool metadata
   */
  updateMetadata(toolId: string, metadata: ToolMetadata): void {
    this.metadata.set(toolId, metadata);
  }

  /**
   * Perform advanced search with highlighting and scoring
   */
  search(options: SearchOptions): SearchResult<Tool>[] {
    if (!options.query.trim()) {
      return [];
    }

    const searchResults = this.index.search(options.query, {
      limit: options.maxResults,
      suggest: options.fuzzy,
    });

    const results: SearchResult<Tool>[] = [];

    for (const id of searchResults) {
      const tool = this.documents.get(id as string);
      if (!tool) continue;

      const score = this.calculateRelevanceScore(tool, options.query);
      const matches = options.highlightMatches 
        ? this.findMatches(tool, options.query)
        : [];

      results.push({
        item: tool,
        score,
        matches,
      });
    }

    // Sort by relevance score
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(query: string, maxSuggestions = 5): string[] {
    if (query.length < 2) return [];

    const suggestions = new Set<string>();
    const tools = Array.from(this.documents.values());

    // Add tool name suggestions
    tools.forEach(tool => {
      if (tool.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(tool.name);
      }
    });

    // Add category suggestions
    tools.forEach(tool => {
      if (tool.category?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(tool.category);
      }
    });

    // Add tag suggestions
    tools.forEach(tool => {
      tool.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  /**
   * Export index for web worker
   */
  exportIndex(): any {
    return {
      index: this.index.export(),
      documents: Array.from(this.documents.entries()),
      metadata: Array.from(this.metadata.entries()),
    };
  }

  /**
   * Load index from exported data
   */
  loadIndex(data: any): void {
    this.index.import(data.index);
    this.documents = new Map(data.documents);
    this.metadata = new Map(data.metadata);
  }

  /**
   * Create searchable content from tool
   */
  private createSearchableContent(tool: Tool): string {
    const content = [
      tool.name,
      tool.description,
      tool.category || '',
      ...(tool.tags || []),
      ...tool.inputs.map(input => `${input.label || input.name} ${input.type}`),
      ...tool.outputs.map(output => `${output.label || output.name} ${output.type}`),
    ];

    return content.join(' ').toLowerCase();
  }

  /**
   * Calculate relevance score for search result
   */
  private calculateRelevanceScore(tool: Tool, query: string): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Exact name match gets highest score
    if (tool.name.toLowerCase() === queryLower) {
      score += 100;
    } else if (tool.name.toLowerCase().includes(queryLower)) {
      score += 80;
    }

    // Description match
    if (tool.description.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    // Category match
    if (tool.category?.toLowerCase().includes(queryLower)) {
      score += 60;
    }

    // Tag matches
    tool.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        score += 40;
      }
    });

    // Input/output type matches
    tool.inputs.forEach(input => {
      if (input.label?.toLowerCase().includes(queryLower) || 
          input.type.toLowerCase().includes(queryLower)) {
        score += 20;
      }
    });

    tool.outputs.forEach(output => {
      if (output.label?.toLowerCase().includes(queryLower) || 
          output.type.toLowerCase().includes(queryLower)) {
        score += 20;
      }
    });

    return score;
  }

  /**
   * Find matches in tool content for highlighting
   */
  private findMatches(tool: Tool, query: string): SearchMatch[] {
    const matches: SearchMatch[] = [];
    const queryLower = query.toLowerCase();

    // Helper function to find indices of matches
    const findIndices = (text: string, searchTerm: string): [number, number][] => {
      const indices: [number, number][] = [];
      const textLower = text.toLowerCase();
      let index = 0;
      
      while ((index = textLower.indexOf(searchTerm, index)) !== -1) {
        indices.push([index, index + searchTerm.length]);
        index += searchTerm.length;
      }
      
      return indices;
    };

    // Check name
    const nameIndices = findIndices(tool.name, queryLower);
    if (nameIndices.length > 0) {
      matches.push({
        field: 'name',
        value: tool.name,
        indices: nameIndices,
      });
    }

    // Check description
    const descIndices = findIndices(tool.description, queryLower);
    if (descIndices.length > 0) {
      matches.push({
        field: 'description',
        value: tool.description,
        indices: descIndices,
      });
    }

    return matches;
  }
}

/**
 * Apply comprehensive filters to tools
 */
export function applyAdvancedFilters(
  tools: Tool[], 
  filters: FilterOptions,
  metadata: Map<string, ToolMetadata> = new Map()
): Tool[] {
  return tools.filter(tool => {
    const toolMetadata = metadata.get(tool.id);

    // Category filter
    if (filters.categories.length > 0 && tool.category) {
      if (!filters.categories.includes(tool.category)) {
        return false;
      }
    }

    // Tags filter (tool must have at least one of the selected tags)
    if (filters.tags.length > 0 && tool.tags) {
      if (!filters.tags.some(tag => tool.tags?.includes(tag))) {
        return false;
      }
    }

    // Complexity filter
    if (filters.complexity && toolMetadata?.complexity) {
      if (toolMetadata.complexity !== filters.complexity) {
        return false;
      }
    }

    // Last updated filter
    if (filters.lastUpdated && toolMetadata?.updated) {
      const updatedDate = new Date(toolMetadata.updated);
      const now = new Date();
      const diffInDays = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);

      switch (filters.lastUpdated) {
        case 'week':
          if (diffInDays > 7) return false;
          break;
        case 'month':
          if (diffInDays > 30) return false;
          break;
        case 'year':
          if (diffInDays > 365) return false;
          break;
      }
    }

    // Input types filter
    if (filters.inputTypes.length > 0) {
      const toolInputTypes = tool.inputs.map(input => input.type);
      if (!filters.inputTypes.some(type => toolInputTypes.includes(type))) {
        return false;
      }
    }

    // Output types filter
    if (filters.outputTypes.length > 0) {
      const toolOutputTypes = tool.outputs.map(output => output.type);
      if (!filters.outputTypes.some(type => toolOutputTypes.includes(type))) {
        return false;
      }
    }

    // Status filter
    if (filters.status && toolMetadata?.status) {
      if (toolMetadata.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Enhanced sorting with multiple criteria
 */
export function sortToolsAdvanced(
  tools: Tool[], 
  sort: SortOption,
  metadata: Map<string, ToolMetadata> = new Map()
): Tool[] {
  return [...tools].sort((a, b) => {
    let comparison = 0;
    const aMetadata = metadata.get(a.id);
    const bMetadata = metadata.get(b.id);

    switch (sort.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '');
        break;
      case 'updated':
        const aUpdated = aMetadata?.updated ? new Date(aMetadata.updated).getTime() : 0;
        const bUpdated = bMetadata?.updated ? new Date(bMetadata.updated).getTime() : 0;
        comparison = aUpdated - bUpdated;
        break;
      case 'popularity':
        const aPopularity = aMetadata?.usage?.executions || 0;
        const bPopularity = bMetadata?.usage?.executions || 0;
        comparison = aPopularity - bPopularity;
        break;
      case 'relevance':
        // Relevance sorting is handled in search results
        comparison = 0;
        break;
    }

    return sort.direction === 'desc' ? -comparison : comparison;
  });
}

// Legacy functions for backward compatibility
export function filterTools(tools: Tool[], filters: SearchFilters): Tool[] {
  const advancedFilters: FilterOptions = {
    categories: filters.category ? [filters.category] : [],
    tags: filters.tags || [],
    complexity: null,
    lastUpdated: null,
    inputTypes: [],
    outputTypes: [],
    status: null,
  };

  let filtered = applyAdvancedFilters(tools, advancedFilters);

  // Apply simple text search if no advanced search is available
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(tool => {
      const searchableText = `${tool.name} ${tool.description}`.toLowerCase();
      return searchableText.includes(query);
    });
  }

  return filtered;
}

export function sortTools(tools: Tool[], sort: SortOption): Tool[] {
  return sortToolsAdvanced(tools, sort);
}

/**
 * Gets unique categories from tools array with counts
 */
export function getUniqueCategories(tools: Tool[]): Array<{id: string, name: string, count: number}> {
  const categoryMap = new Map<string, number>();
  
  tools.forEach(tool => {
    if (tool.category) {
      categoryMap.set(tool.category, (categoryMap.get(tool.category) || 0) + 1);
    }
  });

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ id: name, name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Gets unique tags from tools array with counts
 */
export function getUniqueTags(tools: Tool[]): Array<{id: string, name: string, count: number}> {
  const tagMap = new Map<string, number>();
  
  tools.forEach(tool => {
    tool.tags?.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ id: name, name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get unique input types from tools
 */
export function getUniqueInputTypes(tools: Tool[]): string[] {
  const types = new Set<string>();
  tools.forEach(tool => {
    tool.inputs.forEach(input => types.add(input.type));
  });
  return Array.from(types).sort();
}

/**
 * Get unique output types from tools
 */
export function getUniqueOutputTypes(tools: Tool[]): string[] {
  const types = new Set<string>();
  tools.forEach(tool => {
    tool.outputs.forEach(output => types.add(output.type));
  });
  return Array.from(types).sort();
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(text: string, matches: [number, number][]): React.ReactNode {
  if (matches.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach(([start, end], index) => {
    // Add text before match
    if (start > lastIndex) {
      parts.push(text.substring(lastIndex, start));
    }

    // Add highlighted match
    parts.push(
      React.createElement('mark', {
        key: index,
        style: { backgroundColor: '#ffeb3b', fontWeight: 'bold' }
      }, text.substring(start, end))
    );

    lastIndex = end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

/**
 * Create mock metadata for development/testing
 */
export function createMockMetadata(tools: Tool[]): Map<string, ToolMetadata> {
  const metadata = new Map<string, ToolMetadata>();
  const now = new Date();
  
  tools.forEach((tool, index) => {
    const daysAgo = Math.floor(Math.random() * 365);
    const createdDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    const updatedDate = new Date(createdDate.getTime() + (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
    
    metadata.set(tool.id, {
      created: createdDate.toISOString(),
      updated: updatedDate.toISOString(),
      status: ['new', 'beta', 'stable', 'deprecated'][Math.floor(Math.random() * 4)] as any,
      complexity: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
      usage: {
        executions: Math.floor(Math.random() * 10000),
        lastUsed: updatedDate.toISOString(),
      },
    });
  });
  
  return metadata;
}