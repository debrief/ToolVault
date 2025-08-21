import Fuse from 'fuse.js';
import type { ToolMetadata } from '../types/tools';
import { metadataParser } from './metadataParser';

interface FuseResultMatch {
  indices: readonly [number, number][];
  key?: string;
  refIndex?: number;
  value?: string;
}

export interface FuzzySearchResult {
  tool: ToolMetadata;
  score: number;
  matchedFields: string[];
  matches: readonly FuseResultMatch[];
  searchTerm: string;
}

export interface AdvancedSearchOptions {
  categories?: string[];
  runtimeTypes?: string[];
  complexities?: ('simple' | 'medium' | 'complex')[];
  parameterCountRange?: { min: number; max: number };
  inputTypes?: string[];
  outputTypes?: string[];
  fuzzyThreshold?: number; // 0.0 = exact match, 1.0 = match anything
}

export interface SearchAnalytics {
  totalSearches: number;
  recentSearches: string[];
  popularSearches: Map<string, number>;
  averageResultCount: number;
}

// Searchable tool data structure for Fuse.js
interface SearchableTool {
  id: string;
  name: string;
  description: string;
  labels: string;
  parameters: string;
  inputTypes: string;
  outputTypes: string;
  category: string;
  complexity: string;
  searchableText: string;
  tool: ToolMetadata;
}

export class FuzzyToolSearchService {
  private fuseInstance: Fuse<SearchableTool> | null = null;
  private searchableTools: SearchableTool[] = [];
  private analytics: SearchAnalytics = {
    totalSearches: 0,
    recentSearches: [],
    popularSearches: new Map(),
    averageResultCount: 0,
  };
  private searchHistory: number[] = []; // For calculating average result count

  private readonly fuseOptions = {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'labels', weight: 0.2 },
      { name: 'category', weight: 0.2 },
      { name: 'parameters', weight: 0.15 },
      { name: 'inputTypes', weight: 0.1 },
      { name: 'outputTypes', weight: 0.1 },
      { name: 'searchableText', weight: 0.05 },
    ],
    threshold: 0.3, // Default fuzzy threshold
    includeMatches: true,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    ignoreLocation: true,
    findAllMatches: true,
  };

  initializeSearch(tools: ToolMetadata[]): void {
    // Create searchable data structure
    this.searchableTools = tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      labels: tool.labels.join(' '),
      parameters: tool.parameters.map(p => `${p.name} ${p.description}`).join(' '),
      inputTypes: tool.input_types.join(' '),
      outputTypes: tool.output_types.join(' '),
      category: this.extractMainCategory(tool),
      complexity: metadataParser.getToolComplexity(tool),
      searchableText: metadataParser.extractSearchableText(tool),
      tool,
    }));

    // Initialize Fuse.js
    this.fuseInstance = new Fuse(this.searchableTools, this.fuseOptions);
  }

  search(
    query: string, 
    tools: ToolMetadata[], 
    options: AdvancedSearchOptions = {}
  ): FuzzySearchResult[] {
    if (!this.fuseInstance || this.searchableTools.length !== tools.length) {
      this.initializeSearch(tools);
    }

    this.trackSearch(query);

    // Handle empty query
    if (!query.trim()) {
      const filteredTools = this.filterTools(tools, options);
      return filteredTools.map(tool => ({
        tool,
        score: 1,
        matchedFields: [],
        matches: [],
        searchTerm: query,
      }));
    }

    // Update fuzzy threshold if provided
    if (options.fuzzyThreshold !== undefined) {
      // Create new Fuse instance with updated threshold
      const newOptions = { ...this.fuseOptions, threshold: options.fuzzyThreshold };
      this.fuseInstance = new Fuse(this.searchableTools, newOptions);
    }

    // Perform fuzzy search
    const fuseResults = this.fuseInstance?.search(query) || [];
    
    // Convert to our result format and apply filters
    const results: FuzzySearchResult[] = [];
    
    for (const fuseResult of fuseResults) {
      const tool = fuseResult.item.tool;
      
      if (!this.matchesFilters(tool, options)) {
        continue;
      }

      const matches = fuseResult.matches || [];
      const matchedFields = this.extractMatchedFields(matches);
      
      results.push({
        tool,
        score: this.calculateScore(fuseResult.score || 0, matchedFields),
        matchedFields,
        matches,
        searchTerm: query,
      });
    }

    this.trackSearchResults(results.length);
    return results;
  }

  getSuggestions(partialQuery: string, tools: ToolMetadata[]): string[] {
    if (!partialQuery || partialQuery.length < 2) {
      // Return popular search terms
      return Array.from(this.analytics.popularSearches.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([term]) => term);
    }

    if (!this.fuseInstance) {
      this.initializeSearch(tools);
    }

    // Use Fuse.js for fuzzy matching suggestions
    const fuseOptions = {
      ...this.fuseOptions,
      threshold: 0.4, // More lenient for suggestions
      keys: ['name', 'labels', 'category'],
    };

    const tempFuse = new Fuse(this.searchableTools, fuseOptions);
    const results = tempFuse.search(partialQuery);
    
    const suggestions = new Set<string>();
    
    // Extract suggestions from matches
    for (const result of results.slice(0, 10)) {
      const { tool } = result.item;
      
      // Add tool name if it partially matches
      if (tool.name.toLowerCase().includes(partialQuery.toLowerCase())) {
        suggestions.add(tool.name);
      }
      
      // Add matching labels
      for (const label of tool.labels) {
        if (label.toLowerCase().includes(partialQuery.toLowerCase())) {
          suggestions.add(label);
        }
      }
      
      // Add category suggestions
      const category = this.extractMainCategory(tool);
      if (category.toLowerCase().includes(partialQuery.toLowerCase())) {
        suggestions.add(category);
      }
    }

    return Array.from(suggestions).slice(0, 8);
  }

  getSearchHistory(): string[] {
    return [...this.analytics.recentSearches].reverse();
  }

  getPopularSearches(): { term: string; count: number }[] {
    return Array.from(this.analytics.popularSearches.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  getAnalytics(): SearchAnalytics {
    return { ...this.analytics };
  }

  clearSearchHistory(): void {
    this.analytics.recentSearches = [];
    this.analytics.popularSearches.clear();
    this.analytics.totalSearches = 0;
    this.searchHistory = [];
    this.analytics.averageResultCount = 0;
  }

  private extractMainCategory(tool: ToolMetadata): string {
    // Extract the main category from the tool's labels
    // Phase 0 tools have categories like Transform, Analysis, Statistics, etc.
    const commonCategories = ['Transform', 'Analysis', 'Statistics', 'Processing', 'I/O', 'Import', 'Export'];
    
    for (const label of tool.labels) {
      for (const category of commonCategories) {
        if (label.toLowerCase().includes(category.toLowerCase())) {
          return category;
        }
      }
    }
    
    return tool.labels[0] || 'Other';
  }

  private extractMatchedFields(matches: readonly FuseResultMatch[]): string[] {
    const fields = new Set<string>();
    
    for (const match of matches) {
      if (typeof match.key === 'string') {
        fields.add(match.key);
      }
    }
    
    return Array.from(fields);
  }

  private calculateScore(fuseScore: number, matchedFields: string[]): number {
    // Convert Fuse.js score (lower is better) to our score (higher is better)
    const baseScore = 1 - fuseScore;
    
    // Bonus points for matching important fields
    let fieldBonus = 0;
    if (matchedFields.includes('name')) fieldBonus += 0.3;
    if (matchedFields.includes('description')) fieldBonus += 0.2;
    if (matchedFields.includes('category')) fieldBonus += 0.15;
    if (matchedFields.includes('labels')) fieldBonus += 0.1;
    
    return Math.min(1, baseScore + fieldBonus);
  }

  private filterTools(tools: ToolMetadata[], options: AdvancedSearchOptions): ToolMetadata[] {
    return tools.filter(tool => this.matchesFilters(tool, options));
  }

  private matchesFilters(tool: ToolMetadata, options: AdvancedSearchOptions): boolean {
    // Category filter
    if (options.categories && options.categories.length > 0) {
      const hasMatchingCategory = options.categories.some(cat => 
        tool.labels.some(label => label.toLowerCase().includes(cat.toLowerCase()))
      );
      if (!hasMatchingCategory) return false;
    }

    // Runtime type filter
    if (options.runtimeTypes && options.runtimeTypes.length > 0) {
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

  private trackSearch(query: string): void {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return;

    this.analytics.totalSearches++;
    
    // Add to recent searches (max 20)
    if (!this.analytics.recentSearches.includes(normalizedQuery)) {
      this.analytics.recentSearches.push(normalizedQuery);
      if (this.analytics.recentSearches.length > 20) {
        this.analytics.recentSearches.shift();
      }
    }
    
    // Track popular searches
    const currentCount = this.analytics.popularSearches.get(normalizedQuery) || 0;
    this.analytics.popularSearches.set(normalizedQuery, currentCount + 1);
  }

  private trackSearchResults(resultCount: number): void {
    this.searchHistory.push(resultCount);
    if (this.searchHistory.length > 100) {
      this.searchHistory.shift();
    }
    
    // Calculate average
    this.analytics.averageResultCount = this.searchHistory.reduce((sum, count) => sum + count, 0) / this.searchHistory.length;
  }
}

export const fuzzyToolSearchService = new FuzzyToolSearchService();