import type { Tool } from '../types/index';

export interface SearchFilters {
  query: string;
  category?: string;
  tags?: string[];
}

export interface SortOption {
  field: 'name' | 'category';
  direction: 'asc' | 'desc';
}

/**
 * Filters tools based on search criteria
 */
export function filterTools(tools: Tool[], filters: SearchFilters): Tool[] {
  return tools.filter((tool) => {
    // Text search in name and description
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchableText = `${tool.name} ${tool.description}`.toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Category filter
    if (filters.category && tool.category !== filters.category) {
      return false;
    }

    // Tags filter (tool must have all specified tags)
    if (filters.tags && filters.tags.length > 0) {
      const toolTags = tool.tags || [];
      if (!filters.tags.every(tag => toolTags.includes(tag))) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts tools based on the specified criteria
 */
export function sortTools(tools: Tool[], sort: SortOption): Tool[] {
  return [...tools].sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '');
        break;
    }

    return sort.direction === 'desc' ? -comparison : comparison;
  });
}

/**
 * Gets unique categories from tools array
 */
export function getUniqueCategories(tools: Tool[]): string[] {
  const categories = new Set(
    tools
      .map(tool => tool.category)
      .filter((category): category is string => Boolean(category))
  );
  return Array.from(categories).sort();
}

/**
 * Gets unique tags from tools array
 */
export function getUniqueTags(tools: Tool[]): string[] {
  const tags = new Set<string>();
  tools.forEach(tool => {
    if (tool.tags) {
      tool.tags.forEach(tag => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
}