import {
  filterTools,
  sortTools,
  getUniqueCategories,
  getUniqueTags,
  type SearchFilters,
  type SortOption,
} from '../searchUtils';
import {
  createMockTool,
  mockTool,
  mockComplexTool,
  mockDataTool,
  mockUtilityTool,
} from '../../test-utils/mockData';
import type { Tool } from '../../types/index';

describe('searchUtils', () => {
  const testTools: Tool[] = [
    mockTool,
    mockComplexTool,
    mockDataTool,
    mockUtilityTool,
    createMockTool({
      id: 'case-test',
      name: 'Case Sensitive Tool',
      description: 'Testing case sensitivity in search',
      category: 'Testing',
      tags: ['case', 'test', 'UPPERCASE'],
    }),
  ];

  describe('filterTools', () => {
    it('should return all tools when no filters are applied', () => {
      const filters: SearchFilters = { query: '' };
      const result = filterTools(testTools, filters);
      
      expect(result).toEqual(testTools);
    });

    it('should filter tools by query in name', () => {
      const filters: SearchFilters = { query: 'Word Count' };
      const result = filterTools(testTools, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('wordcount');
    });

    it('should filter tools by query in description', () => {
      const filters: SearchFilters = { query: 'analysis tools' };
      const result = filterTools(testTools, filters);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(tool => tool.description.toLowerCase().includes('analysis'))).toBe(true);
    });

    it('should perform case-insensitive search', () => {
      const filters: SearchFilters = { query: 'WORD count' };
      const result = filterTools(testTools, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('wordcount');
    });

    it('should filter by category', () => {
      const filters: SearchFilters = { query: '', category: 'Text Analysis' };
      const result = filterTools(testTools, filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Text Analysis');
    });

    it('should filter by single tag', () => {
      const filters: SearchFilters = { query: '', tags: ['text'] };
      const result = filterTools(testTools, filters);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(tool => {
        expect(tool.tags).toContain('text');
      });
    });

    it('should filter by multiple tags (AND operation)', () => {
      const filters: SearchFilters = { query: '', tags: ['text', 'analysis'] };
      const result = filterTools(testTools, filters);
      
      result.forEach(tool => {
        expect(tool.tags).toContain('text');
        expect(tool.tags).toContain('analysis');
      });
    });

    it('should return empty array when tag does not exist', () => {
      const filters: SearchFilters = { query: '', tags: ['nonexistent'] };
      const result = filterTools(testTools, filters);
      
      expect(result).toHaveLength(0);
    });

    it('should combine multiple filters (query + category + tags)', () => {
      const filters: SearchFilters = {
        query: 'text',
        category: 'Text Processing',
        tags: ['text'],
      };
      const result = filterTools(testTools, filters);
      
      result.forEach(tool => {
        expect(tool.description.toLowerCase().includes('text') || tool.name.toLowerCase().includes('text')).toBe(true);
        expect(tool.category).toBe('Text Processing');
        expect(tool.tags).toContain('text');
      });
    });

    it('should handle tools with undefined tags', () => {
      const toolWithoutTags = createMockTool({ tags: undefined });
      const toolsWithMixed = [...testTools, toolWithoutTags];
      
      const filters: SearchFilters = { query: '', tags: ['text'] };
      const result = filterTools(toolsWithMixed, filters);
      
      // Should only return tools that have the specified tags
      result.forEach(tool => {
        expect(tool.tags).toBeDefined();
        expect(tool.tags).toContain('text');
      });
    });

    it('should handle empty query strings', () => {
      const filters: SearchFilters = { query: '   ' };
      const result = filterTools(testTools, filters);
      
      // Whitespace-only query should be treated as no query
      expect(result).toEqual(testTools);
    });
  });

  describe('sortTools', () => {
    it('should sort tools by name in ascending order', () => {
      const sort: SortOption = { field: 'name', direction: 'asc' };
      const result = sortTools(testTools, sort);
      
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].name.localeCompare(result[i].name)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort tools by name in descending order', () => {
      const sort: SortOption = { field: 'name', direction: 'desc' };
      const result = sortTools(testTools, sort);
      
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].name.localeCompare(result[i].name)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort tools by category in ascending order', () => {
      const sort: SortOption = { field: 'category', direction: 'asc' };
      const result = sortTools(testTools, sort);
      
      for (let i = 1; i < result.length; i++) {
        const prevCategory = result[i - 1].category || '';
        const currentCategory = result[i].category || '';
        expect(prevCategory.localeCompare(currentCategory)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort tools by category in descending order', () => {
      const sort: SortOption = { field: 'category', direction: 'desc' };
      const result = sortTools(testTools, sort);
      
      for (let i = 1; i < result.length; i++) {
        const prevCategory = result[i - 1].category || '';
        const currentCategory = result[i].category || '';
        expect(prevCategory.localeCompare(currentCategory)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should not mutate the original array', () => {
      const originalTools = [...testTools];
      const sort: SortOption = { field: 'name', direction: 'desc' };
      
      sortTools(testTools, sort);
      
      expect(testTools).toEqual(originalTools);
    });

    it('should handle tools with undefined categories', () => {
      const toolsWithUndefinedCategory = [
        ...testTools,
        createMockTool({ id: 'no-category', category: undefined }),
      ];
      
      const sort: SortOption = { field: 'category', direction: 'asc' };
      const result = sortTools(toolsWithUndefinedCategory, sort);
      
      // Should not throw an error
      expect(result).toHaveLength(toolsWithUndefinedCategory.length);
    });
  });

  describe('getUniqueCategories', () => {
    it('should return unique categories in alphabetical order', () => {
      const result = getUniqueCategories(testTools);
      
      const expected = [...new Set(testTools.map(t => t.category))].sort();
      expect(result).toEqual(expected);
    });

    it('should filter out undefined categories', () => {
      const toolsWithUndefined = [
        ...testTools,
        createMockTool({ id: 'undefined-cat', category: undefined }),
      ];
      
      const result = getUniqueCategories(toolsWithUndefined);
      
      expect(result.every(category => category !== undefined)).toBe(true);
    });

    it('should handle empty array', () => {
      const result = getUniqueCategories([]);
      
      expect(result).toEqual([]);
    });

    it('should handle duplicate categories', () => {
      const toolsWithDuplicates = [
        createMockTool({ id: '1', category: 'Test' }),
        createMockTool({ id: '2', category: 'Test' }),
        createMockTool({ id: '3', category: 'Other' }),
      ];
      
      const result = getUniqueCategories(toolsWithDuplicates);
      
      expect(result).toEqual(['Other', 'Test']);
    });
  });

  describe('getUniqueTags', () => {
    it('should return unique tags in alphabetical order', () => {
      const result = getUniqueTags(testTools);
      
      const allTags = testTools.flatMap(t => t.tags || []);
      const expected = [...new Set(allTags)].sort();
      
      expect(result).toEqual(expected);
    });

    it('should handle tools with undefined tags', () => {
      const toolsWithUndefinedTags = [
        ...testTools,
        createMockTool({ id: 'no-tags', tags: undefined }),
      ];
      
      const result = getUniqueTags(toolsWithUndefinedTags);
      
      // Should not throw an error and should return tags from other tools
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty array', () => {
      const result = getUniqueTags([]);
      
      expect(result).toEqual([]);
    });

    it('should handle duplicate tags across tools', () => {
      const toolsWithDuplicateTags = [
        createMockTool({ id: '1', tags: ['common', 'unique1'] }),
        createMockTool({ id: '2', tags: ['common', 'unique2'] }),
        createMockTool({ id: '3', tags: ['common'] }),
      ];
      
      const result = getUniqueTags(toolsWithDuplicateTags);
      
      expect(result).toEqual(['common', 'unique1', 'unique2']);
    });

    it('should handle empty tag arrays', () => {
      const toolsWithEmptyTags = [
        createMockTool({ id: '1', tags: [] }),
        createMockTool({ id: '2', tags: ['tag1'] }),
      ];
      
      const result = getUniqueTags(toolsWithEmptyTags);
      
      expect(result).toEqual(['tag1']);
    });
  });

  describe('edge cases and performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        createMockTool({
          id: `tool-${i}`,
          name: `Tool ${i}`,
          category: `Category ${i % 10}`,
          tags: [`tag-${i % 5}`, `tag-${i % 3}`],
        })
      );

      const startTime = performance.now();
      
      // Test filtering
      const filtered = filterTools(largeDataset, { 
        query: 'Tool 1', 
        category: 'Category 1',
        tags: ['tag-1']
      });
      
      // Test sorting
      const sorted = sortTools(filtered, { field: 'name', direction: 'asc' });
      
      // Test unique extraction
      const categories = getUniqueCategories(largeDataset);
      const tags = getUniqueTags(largeDataset);
      
      const endTime = performance.now();
      
      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Verify results are correct
      expect(filtered.length).toBeGreaterThan(0);
      expect(sorted.length).toBe(filtered.length);
      expect(categories.length).toBe(10);
      expect(tags.length).toBe(5);
    });

    it('should handle special characters in search query', () => {
      const toolWithSpecialChars = createMockTool({
        id: 'special',
        name: 'Tool with "quotes" & symbols',
        description: 'Description with [brackets] and {braces}',
      });
      
      const tools = [toolWithSpecialChars];
      
      const result1 = filterTools(tools, { query: '"quotes"' });
      expect(result1).toHaveLength(1);
      
      const result2 = filterTools(tools, { query: '[brackets]' });
      expect(result2).toHaveLength(1);
      
      const result3 = filterTools(tools, { query: '{braces}' });
      expect(result3).toHaveLength(1);
    });
  });
});