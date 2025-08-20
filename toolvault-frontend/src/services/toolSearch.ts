import type { ToolMetadata } from '../types/tools';
import { metadataParser } from './metadataParser';

export interface SearchResult {
  tool: ToolMetadata;
  score: number;
  matchedFields: string[];
}

export interface SearchOptions {
  categories?: string[];
  runtimeTypes?: string[];
  complexities?: ('simple' | 'medium' | 'complex')[];
  parameterCountRange?: { min: number; max: number };
  inputTypes?: string[];
  outputTypes?: string[];
}

export class ToolSearchService {
  private searchIndex = new Map<string, string>();
  private initialized = false;

  buildSearchIndex(tools: ToolMetadata[]): void {
    this.searchIndex.clear();
    
    for (const tool of tools) {
      const searchableText = metadataParser.extractSearchableText(tool);
      this.searchIndex.set(tool.id, searchableText);
    }
    
    this.initialized = true;
  }

  search(query: string, tools: ToolMetadata[], options: SearchOptions = {}): SearchResult[] {
    if (!this.initialized) {
      this.buildSearchIndex(tools);
    }

    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return this.filterTools(tools, options).map(tool => ({
        tool,
        score: 1,
        matchedFields: [],
      }));
    }

    const queryTerms = normalizedQuery.split(/\s+/);
    const results: SearchResult[] = [];

    for (const tool of tools) {
      const searchResult = this.scoreTool(tool, queryTerms);
      if (searchResult.score > 0 && this.matchesFilters(tool, options)) {
        results.push(searchResult);
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private scoreTool(tool: ToolMetadata, queryTerms: string[]): SearchResult {
    let totalScore = 0;
    const matchedFields: string[] = [];
    const searchableText = this.searchIndex.get(tool.id) || '';

    for (const term of queryTerms) {
      let termScore = 0;
      
      // Exact name match (highest priority)
      if (tool.name.toLowerCase().includes(term)) {
        termScore += 10;
        if (!matchedFields.includes('name')) matchedFields.push('name');
      }

      // Description match
      if (tool.description.toLowerCase().includes(term)) {
        termScore += 5;
        if (!matchedFields.includes('description')) matchedFields.push('description');
      }

      // Label/category match
      for (const label of tool.labels) {
        if (label.toLowerCase().includes(term)) {
          termScore += 3;
          if (!matchedFields.includes('labels')) matchedFields.push('labels');
        }
      }

      // Parameter name or description match
      for (const param of tool.parameters) {
        if (param.name.toLowerCase().includes(term) || 
            param.description.toLowerCase().includes(term)) {
          termScore += 2;
          if (!matchedFields.includes('parameters')) matchedFields.push('parameters');
        }
      }

      // Input/output type match
      const allTypes = [...tool.input_types, ...tool.output_types];
      for (const type of allTypes) {
        if (type.toLowerCase().includes(term)) {
          termScore += 1;
          if (!matchedFields.includes('types')) matchedFields.push('types');
        }
      }

      // General text match (lowest priority)
      if (termScore === 0 && searchableText.includes(term)) {
        termScore += 0.5;
      }

      totalScore += termScore;
    }

    return {
      tool,
      score: totalScore,
      matchedFields,
    };
  }

  filterTools(tools: ToolMetadata[], options: SearchOptions): ToolMetadata[] {
    return tools.filter(tool => this.matchesFilters(tool, options));
  }

  private matchesFilters(tool: ToolMetadata, options: SearchOptions): boolean {
    // Category filter
    if (options.categories && options.categories.length > 0) {
      const hasMatchingCategory = options.categories.some(cat => 
        tool.labels.includes(cat)
      );
      if (!hasMatchingCategory) return false;
    }

    // Runtime type filter
    if (options.runtimeTypes && options.runtimeTypes.length > 0) {
      // For Phase 0, all tools are JavaScript runtime
      // This filter is prepared for future bundle types
      if (!options.runtimeTypes.includes('javascript')) return false;
    }

    // Complexity filter
    if (options.complexities && options.complexities.length > 0) {
      const toolComplexity = metadataParser.getToolComplexity(tool);
      if (!options.complexities.includes(toolComplexity)) return false;
    }

    // Parameter count range filter
    if (options.parameterCountRange) {
      const paramCount = tool.parameters.length;
      const { min, max } = options.parameterCountRange;
      if (paramCount < min || paramCount > max) return false;
    }

    // Input type filter
    if (options.inputTypes && options.inputTypes.length > 0) {
      const hasMatchingInput = options.inputTypes.some(inputType =>
        tool.input_types.includes(inputType)
      );
      if (!hasMatchingInput) return false;
    }

    // Output type filter
    if (options.outputTypes && options.outputTypes.length > 0) {
      const hasMatchingOutput = options.outputTypes.some(outputType =>
        tool.output_types.includes(outputType)
      );
      if (!hasMatchingOutput) return false;
    }

    return true;
  }

  getSuggestions(partialQuery: string, tools: ToolMetadata[]): string[] {
    if (!partialQuery || partialQuery.length < 2) return [];

    const suggestions = new Set<string>();
    const query = partialQuery.toLowerCase();

    for (const tool of tools) {
      // Tool names
      if (tool.name.toLowerCase().includes(query)) {
        suggestions.add(tool.name);
      }

      // Labels/categories
      for (const label of tool.labels) {
        if (label.toLowerCase().includes(query)) {
          suggestions.add(label);
        }
      }

      // Parameter names
      for (const param of tool.parameters) {
        if (param.name.toLowerCase().includes(query)) {
          suggestions.add(param.name);
        }
      }
    }

    return Array.from(suggestions).slice(0, 10);
  }

  getPopularSearchTerms(tools: ToolMetadata[]): string[] {
    const termFrequency = new Map<string, number>();

    for (const tool of tools) {
      // Count label frequency
      for (const label of tool.labels) {
        termFrequency.set(label, (termFrequency.get(label) || 0) + 1);
      }

      // Count input/output type frequency
      for (const type of [...tool.input_types, ...tool.output_types]) {
        termFrequency.set(type, (termFrequency.get(type) || 0) + 1);
      }
    }

    return Array.from(termFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term]) => term);
  }
}

export const toolSearchService = new ToolSearchService();