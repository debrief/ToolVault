import { render, screen, fireEvent, waitFor } from '../../../test-utils/test-utils';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToolList } from '../ToolList';
import { createMockTool, mockToolVaultIndex, createMockTools } from '../../../test-utils/mockData';
import { fetchToolVaultIndex } from '../../../services/toolVaultService';
import { NetworkError } from '../../../services/errors';
import { createTestQueryClient } from '../../../test-utils/test-utils';

// Mock the service
jest.mock('../../../services/toolVaultService');
const mockFetchToolVaultIndex = fetchToolVaultIndex as jest.MockedFunction<typeof fetchToolVaultIndex>;

// Mock debounce hook to avoid timing issues in tests
jest.mock('../../../hooks/useDebouncedValue', () => ({
  useDebouncedValue: jest.fn((value) => value), // Return value immediately
}));

describe('ToolList', () => {
  let queryClient: QueryClient;
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('loading and error states', () => {
    it('should show loading state initially', () => {
      mockFetchToolVaultIndex.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('Loading tools...')).toBeInTheDocument();
    });

    it('should show error state when fetch fails', async () => {
      mockFetchToolVaultIndex.mockRejectedValue(new NetworkError('Failed to fetch'));
      
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText(/Error loading tools/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
      });
    });

    it('should show specific error message from NetworkError', async () => {
      mockFetchToolVaultIndex.mockRejectedValue(new NetworkError('Network timeout'));
      
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText(/Network timeout/)).toBeInTheDocument();
      });
    });
  });

  describe('successful data loading', () => {
    beforeEach(() => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
    });

    it('should display tools after successful fetch', async () => {
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
        expect(screen.getByText('Text Processor')).toBeInTheDocument();
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
        expect(screen.getByText('Utility Helper')).toBeInTheDocument();
      });
    });

    it('should show tools count', async () => {
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText(`${mockToolVaultIndex.tools.length} of ${mockToolVaultIndex.tools.length} tools`)).toBeInTheDocument();
      });
    });

    it('should display filter controls', async () => {
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Search tools')).toBeInTheDocument();
        expect(screen.getByLabelText('Category')).toBeInTheDocument();
        expect(screen.getByLabelText('Tags')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      });
    });
  });

  describe('search functionality', () => {
    beforeEach(() => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
    });

    it('should filter tools by search query', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search tools');
      await user.type(searchInput, 'Word Count');

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
        expect(screen.queryByText('Text Processor')).not.toBeInTheDocument();
        expect(screen.queryByText('Data Analyzer')).not.toBeInTheDocument();
      });

      expect(screen.getByText('1 of 4 tools')).toBeInTheDocument();
    });

    it('should show no results message when search yields no matches', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search tools');
      await user.type(searchInput, 'NonexistentTool');

      await waitFor(() => {
        expect(screen.getByText('No tools match your search criteria')).toBeInTheDocument();
        expect(screen.getByText('0 of 4 tools')).toBeInTheDocument();
      });
    });

    it('should clear search results when query is cleared', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search tools');
      
      // Search for something specific
      await user.type(searchInput, 'Word Count');
      
      await waitFor(() => {
        expect(screen.getByText('1 of 4 tools')).toBeInTheDocument();
      });

      // Clear the search
      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('4 of 4 tools')).toBeInTheDocument();
        expect(screen.getByText('Text Processor')).toBeInTheDocument();
      });
    });
  });

  describe('category filtering', () => {
    beforeEach(() => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
    });

    it('should filter tools by category', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      // Open category dropdown
      const categorySelect = screen.getByLabelText('Category');
      await user.click(categorySelect);

      // Select a specific category
      const textAnalysisOption = screen.getByRole('option', { name: 'Text Analysis' });
      await user.click(textAnalysisOption);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
        expect(screen.queryByText('Text Processor')).not.toBeInTheDocument();
        expect(screen.getByText('1 of 4 tools')).toBeInTheDocument();
      });
    });

    it('should show all categories in dropdown', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const categorySelect = screen.getByLabelText('Category');
      await user.click(categorySelect);

      // Should show "All Categories" plus each unique category
      expect(screen.getByRole('option', { name: 'All Categories' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Text Analysis' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Text Processing' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Data Analysis' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Utilities' })).toBeInTheDocument();
    });
  });

  describe('tag filtering', () => {
    beforeEach(() => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
    });

    it('should filter tools by tags', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      // Click on the tags autocomplete
      const tagsInput = screen.getByLabelText('Tags');
      await user.click(tagsInput);

      // Type to search for a tag
      await user.type(tagsInput, 'text');

      // Select the tag from dropdown
      const textTag = await screen.findByText('text');
      await user.click(textTag);

      await waitFor(() => {
        // Should show tools that have the 'text' tag
        expect(screen.getByText('Word Count')).toBeInTheDocument();
        expect(screen.getByText('Text Processor')).toBeInTheDocument();
        expect(screen.queryByText('Utility Helper')).not.toBeInTheDocument();
      });
    });

    it('should support multiple tag selection', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const tagsInput = screen.getByLabelText('Tags');
      
      // Add first tag
      await user.click(tagsInput);
      await user.type(tagsInput, 'text');
      const textTag = await screen.findByText('text');
      await user.click(textTag);

      // Add second tag
      await user.type(tagsInput, 'analysis');
      const analysisTag = await screen.findByText('analysis');
      await user.click(analysisTag);

      await waitFor(() => {
        // Should show only tools that have BOTH tags
        expect(screen.getByText('Word Count')).toBeInTheDocument();
        expect(screen.queryByText('Text Processor')).not.toBeInTheDocument();
      });
    });

    it('should remove tags when tag chips are deleted', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const tagsInput = screen.getByLabelText('Tags');
      await user.click(tagsInput);
      await user.type(tagsInput, 'text');
      const textTag = await screen.findByText('text');
      await user.click(textTag);

      // Find and click the delete button on the tag chip
      const tagChip = screen.getByRole('button', { name: /text/i });
      const deleteButton = tagChip.querySelector('svg[data-testid="CancelIcon"]') as Element;
      if (deleteButton) {
        await user.click(deleteButton);
      }

      await waitFor(() => {
        // Should show all tools again
        expect(screen.getByText('4 of 4 tools')).toBeInTheDocument();
      });
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      mockFetchToolVaultIndex.mockResolvedValue({
        ...mockToolVaultIndex,
        tools: [
          createMockTool({ id: 'z-tool', name: 'Z Tool', category: 'Z Category' }),
          createMockTool({ id: 'a-tool', name: 'A Tool', category: 'A Category' }),
          createMockTool({ id: 'm-tool', name: 'M Tool', category: 'M Category' }),
        ],
      });
    });

    it('should sort tools by name ascending by default', async () => {
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        const toolCards = screen.getAllByRole('button');
        expect(toolCards[0]).toHaveTextContent('A Tool');
        expect(toolCards[1]).toHaveTextContent('M Tool');
        expect(toolCards[2]).toHaveTextContent('Z Tool');
      });
    });

    it('should toggle sort direction when sort button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('A Tool')).toBeInTheDocument();
      });

      // Click the sort direction toggle button
      const sortButton = screen.getByRole('button', { name: /Sort ascending/i });
      await user.click(sortButton);

      await waitFor(() => {
        const toolCards = screen.getAllByRole('button');
        expect(toolCards[0]).toHaveTextContent('Z Tool');
        expect(toolCards[1]).toHaveTextContent('M Tool');
        expect(toolCards[2]).toHaveTextContent('A Tool');
      });
    });

    it('should sort by category when category sort is selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('A Tool')).toBeInTheDocument();
      });

      // Change sort field to category
      const sortSelect = screen.getByLabelText('Sort by');
      await user.click(sortSelect);
      const categoryOption = screen.getByRole('option', { name: 'Category' });
      await user.click(categoryOption);

      await waitFor(() => {
        const toolCards = screen.getAllByRole('button');
        // Should be sorted by category alphabetically
        expect(toolCards[0]).toHaveTextContent('A Category');
        expect(toolCards[1]).toHaveTextContent('M Category');
        expect(toolCards[2]).toHaveTextContent('Z Category');
      });
    });
  });

  describe('view mode toggle', () => {
    beforeEach(() => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
    });

    it('should default to grid view', async () => {
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const gridButton = screen.getByRole('button', { name: 'Grid view' });
      const listButton = screen.getByRole('button', { name: 'List view' });
      
      // Grid button should be selected (primary color)
      expect(gridButton).toHaveClass('MuiIconButton-colorPrimary');
      expect(listButton).not.toHaveClass('MuiIconButton-colorPrimary');
    });

    it('should toggle to list view when list button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const listButton = screen.getByRole('button', { name: 'List view' });
      await user.click(listButton);

      // List button should now be selected
      expect(listButton).toHaveClass('MuiIconButton-colorPrimary');
      
      const gridButton = screen.getByRole('button', { name: 'Grid view' });
      expect(gridButton).not.toHaveClass('MuiIconButton-colorPrimary');
    });

    it('should toggle back to grid view', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const listButton = screen.getByRole('button', { name: 'List view' });
      const gridButton = screen.getByRole('button', { name: 'Grid view' });

      // Switch to list view
      await user.click(listButton);
      expect(listButton).toHaveClass('MuiIconButton-colorPrimary');

      // Switch back to grid view
      await user.click(gridButton);
      expect(gridButton).toHaveClass('MuiIconButton-colorPrimary');
      expect(listButton).not.toHaveClass('MuiIconButton-colorPrimary');
    });
  });

  describe('tool interaction', () => {
    beforeEach(() => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
    });

    it('should call onViewDetails when tool card is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const toolCard = screen.getByText('Word Count').closest('div[role="button"]');
      if (toolCard) {
        await user.click(toolCard);
      }

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockToolVaultIndex.tools[0]);
    });

    it('should handle multiple tool clicks', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const wordCountCard = screen.getByText('Word Count').closest('div[role="button"]');
      const textProcessorCard = screen.getByText('Text Processor').closest('div[role="button"]');

      if (wordCountCard) {
        await user.click(wordCountCard);
      }
      
      if (textProcessorCard) {
        await user.click(textProcessorCard);
      }

      expect(mockOnViewDetails).toHaveBeenCalledTimes(2);
      expect(mockOnViewDetails).toHaveBeenNthCalledWith(1, expect.objectContaining({ name: 'Word Count' }));
      expect(mockOnViewDetails).toHaveBeenNthCalledWith(2, expect.objectContaining({ name: 'Text Processor' }));
    });
  });

  describe('combined filtering', () => {
    beforeEach(() => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
    });

    it('should apply multiple filters simultaneously', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      // Apply text search
      const searchInput = screen.getByLabelText('Search tools');
      await user.type(searchInput, 'text');

      // Apply category filter
      const categorySelect = screen.getByLabelText('Category');
      await user.click(categorySelect);
      const textAnalysisOption = screen.getByRole('option', { name: 'Text Analysis' });
      await user.click(textAnalysisOption);

      await waitFor(() => {
        // Should show only tools matching both criteria
        expect(screen.getByText('Word Count')).toBeInTheDocument();
        expect(screen.queryByText('Text Processor')).not.toBeInTheDocument();
        expect(screen.getByText('1 of 4 tools')).toBeInTheDocument();
      });
    });

    it('should clear filters independently', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      // Apply search filter
      const searchInput = screen.getByLabelText('Search tools');
      await user.type(searchInput, 'processor');

      await waitFor(() => {
        expect(screen.getByText('1 of 4 tools')).toBeInTheDocument();
        expect(screen.getByText('Text Processor')).toBeInTheDocument();
      });

      // Clear search but keep other filters
      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('4 of 4 tools')).toBeInTheDocument();
      });
    });
  });

  describe('performance with large datasets', () => {
    it('should handle large tool lists efficiently', async () => {
      const largeMockData = {
        ...mockToolVaultIndex,
        tools: createMockTools(1000),
      };
      
      mockFetchToolVaultIndex.mockResolvedValue(largeMockData);

      const startTime = performance.now();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('1000 of 1000 tools')).toBeInTheDocument();
      });
      
      const endTime = performance.now();

      // Should render large datasets reasonably quickly
      expect(endTime - startTime).toBeLessThan(2000);
      
      // Should still show all tools
      expect(screen.getByText('Mock Tool 0')).toBeInTheDocument();
      expect(screen.getByText('Mock Tool 1')).toBeInTheDocument();
    });

    it('should handle search on large datasets efficiently', async () => {
      const largeMockData = {
        ...mockToolVaultIndex,
        tools: createMockTools(500),
      };
      
      mockFetchToolVaultIndex.mockResolvedValue(largeMockData);

      const user = userEvent.setup();
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('500 of 500 tools')).toBeInTheDocument();
      });

      const startTime = performance.now();
      
      // Search for specific tool
      const searchInput = screen.getByLabelText('Search tools');
      await user.type(searchInput, 'Mock Tool 100');

      await waitFor(() => {
        expect(screen.getByText('1 of 500 tools')).toBeInTheDocument();
      });
      
      const endTime = performance.now();

      // Search should be fast even with large datasets
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockFetchToolVaultIndex.mockResolvedValue(mockToolVaultIndex);
    });

    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);
      
      await waitFor(() => {
        expect(screen.getByText('Word Count')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', async () => {
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Search tools')).toBeInTheDocument();
        expect(screen.getByLabelText('Category')).toBeInTheDocument();
        expect(screen.getByLabelText('Tags')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      });
    });

    it('should have descriptive button labels', async () => {
      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Grid view' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'List view' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sort/i })).toBeInTheDocument();
      });
    });
  });

  describe('empty states', () => {
    it('should handle empty tools array', async () => {
      mockFetchToolVaultIndex.mockResolvedValue({
        ...mockToolVaultIndex,
        tools: [],
      });

      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('0 of 0 tools')).toBeInTheDocument();
        expect(screen.getByText('No tools match your search criteria')).toBeInTheDocument();
      });
    });

    it('should handle undefined tools array', async () => {
      mockFetchToolVaultIndex.mockResolvedValue({
        ...mockToolVaultIndex,
        tools: undefined as any,
      });

      renderWithProviders(<ToolList onViewDetails={mockOnViewDetails} />);

      await waitFor(() => {
        expect(screen.getByText('0 of 0 tools')).toBeInTheDocument();
      });
    });
  });
});