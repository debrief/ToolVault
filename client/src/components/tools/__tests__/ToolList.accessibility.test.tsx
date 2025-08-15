import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToolList } from '../ToolList';
import { 
  testAccessibility, 
  testKeyboardNavigation, 
  testScreenReaderAnnouncements,
  MockScreenReader 
} from '../../../test-utils/accessibilityHelpers';
import * as toolVaultService from '../../../services/toolVaultService';
import type { Tool } from '../../../types';

// Mock the service
jest.mock('../../../services/toolVaultService');
const mockedService = toolVaultService as jest.Mocked<typeof toolVaultService>;

const mockTools: Tool[] = [
  {
    id: 'tool-1',
    name: 'Data Analyzer',
    description: 'Analyze data patterns and trends',
    category: 'Analysis',
    tags: ['data', 'analysis'],
    metadata: { version: '1.0.0', author: 'Test', license: 'MIT' },
    inputs: [],
    outputs: [],
    parameters: [],
  },
  {
    id: 'tool-2',
    name: 'Chart Generator',
    description: 'Generate various types of charts',
    category: 'Visualization',
    tags: ['charts', 'visualization'],
    metadata: { version: '1.0.0', author: 'Test', license: 'MIT' },
    inputs: [],
    outputs: [],
    parameters: [],
  },
  {
    id: 'tool-3',
    name: 'Report Builder',
    description: 'Build comprehensive reports',
    category: 'Reporting',
    tags: ['reports', 'documents'],
    metadata: { version: '1.0.0', author: 'Test', license: 'MIT' },
    inputs: [],
    outputs: [],
    parameters: [],
  },
];

const mockOnViewDetails = jest.fn();

function renderToolList() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToolList onViewDetails={mockOnViewDetails} />
    </QueryClientProvider>
  );
}

describe('ToolList Accessibility', () => {
  let mockScreenReader: MockScreenReader;

  beforeEach(() => {
    mockOnViewDetails.mockClear();
    mockScreenReader = new MockScreenReader();
    
    mockedService.fetchToolVaultIndex.mockResolvedValue({
      tools: mockTools,
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalTools: mockTools.length,
      },
    });
  });

  afterEach(() => {
    mockScreenReader.destroy();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should meet WCAG 2.1 AA standards', async () => {
      const { container } = renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });
      
      await testAccessibility(container);
    });

    it('should have proper form labels and descriptions', async () => {
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      // Check search field
      const searchField = screen.getByLabelText('Search analysis tools');
      expect(searchField).toBeInTheDocument();
      expect(searchField).toHaveAttribute('aria-describedby', 'search-help');
      
      // Check category filter
      const categoryFilter = screen.getByLabelText('Filter tools by category');
      expect(categoryFilter).toBeInTheDocument();
      
      // Check tags filter
      const tagsFilter = screen.getByLabelText('Filter tools by tags');
      expect(tagsFilter).toBeInTheDocument();
      
      // Check sort controls
      const sortBy = screen.getByLabelText('Sort tools by field');
      expect(sortBy).toBeInTheDocument();
    });

    it('should have proper grid structure', async () => {
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const grid = screen.getByRole('grid', { name: /tools in grid view/i });
      expect(grid).toBeInTheDocument();
    });

    it('should have live region for results summary', async () => {
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const resultsStatus = screen.getByRole('status', { name: 'Search results count' });
      expect(resultsStatus).toBeInTheDocument();
      expect(resultsStatus).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation through filters', async () => {
      const { container } = renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });
      
      await testKeyboardNavigation(container, {
        testArrowKeys: false, // Grid navigation uses different patterns
        testEnterKey: true,
        testEscapeKey: true,
      });
    });

    it('should support search shortcuts', async () => {
      const user = userEvent.setup();
      
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      // Test Ctrl+K shortcut to focus search
      await user.keyboard('{Control>}k{/Control}');
      
      const searchField = screen.getByLabelText('Search analysis tools');
      expect(searchField).toHaveFocus();
    });

    it('should clear search with Escape key', async () => {
      const user = userEvent.setup();
      
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const searchField = screen.getByLabelText('Search analysis tools');
      
      // Type in search field
      searchField.focus();
      await user.type(searchField, 'test search');
      expect(searchField).toHaveValue('test search');
      
      // Press Escape to clear
      await user.keyboard('{Escape}');
      expect(searchField).toHaveValue('');
      expect(searchField).not.toHaveFocus();
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should announce search results', async () => {
      const user = userEvent.setup();
      
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const searchField = screen.getByLabelText('Search analysis tools');
      
      // Perform search
      await user.type(searchField, 'analyzer');
      
      // Wait for debounced search and announcement
      await waitFor(() => {
        const announcements = mockScreenReader.getAnnouncements();
        const searchAnnouncement = announcements.find(a => 
          a.message.includes('analyzer') && a.message.includes('result')
        );
        expect(searchAnnouncement).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should announce filter changes', async () => {
      const user = userEvent.setup();
      
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const categoryFilter = screen.getByLabelText('Filter tools by category');
      
      // Change category filter
      await user.click(categoryFilter);
      const analysisOption = screen.getByText('Analysis');
      await user.click(analysisOption);
      
      // Wait for announcement
      await waitFor(() => {
        const announcements = mockScreenReader.getAnnouncements();
        const filterAnnouncement = announcements.find(a => 
          a.message.includes('category') && a.message.includes('Analysis')
        );
        expect(filterAnnouncement).toBeTruthy();
      });
    });

    it('should announce sort changes', async () => {
      const user = userEvent.setup();
      
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const sortButton = screen.getByLabelText(/sort ascending/i);
      await user.click(sortButton);
      
      // Wait for announcement
      await waitFor(() => {
        const announcements = mockScreenReader.getAnnouncements();
        const sortAnnouncement = announcements.find(a => 
          a.message.includes('sorted') || a.message.includes('descending')
        );
        expect(sortAnnouncement).toBeTruthy();
      });
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus within search autocomplete', async () => {
      const user = userEvent.setup();
      
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const searchField = screen.getByLabelText('Search analysis tools');
      searchField.focus();
      
      // Type to trigger suggestions (if implemented)
      await user.type(searchField, 'data');
      
      // Test that focus remains manageable
      expect(document.activeElement).toBe(searchField);
    });
  });

  describe('Error States', () => {
    it('should handle loading state accessibly', () => {
      mockedService.fetchToolVaultIndex.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      renderToolList();
      
      const loadingMessage = screen.getByText('Loading tools...');
      expect(loadingMessage).toBeInTheDocument();
    });

    it('should handle error state accessibly', async () => {
      const error = new Error('Failed to load tools');
      mockedService.fetchToolVaultIndex.mockRejectedValue(error);
      
      renderToolList();
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/error loading tools/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute('color', 'error');
      });
    });

    it('should handle no results state accessibly', async () => {
      const user = userEvent.setup();
      
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const searchField = screen.getByLabelText('Search analysis tools');
      
      // Search for something that won't match
      await user.type(searchField, 'nonexistent tool');
      
      await waitFor(() => {
        const noResults = screen.getByTestId('no-results');
        expect(noResults).toBeInTheDocument();
        expect(noResults).toHaveTextContent('No tools match your search criteria');
      });
    });
  });

  describe('Interactive Elements', () => {
    it('should have accessible view mode toggles', async () => {
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const gridViewButton = screen.getByLabelText('Grid view');
      const listViewButton = screen.getByLabelText('List view');
      
      expect(gridViewButton).toBeInTheDocument();
      expect(listViewButton).toBeInTheDocument();
    });

    it('should have accessible virtualization toggle', async () => {
      renderToolList();
      
      await waitFor(() => {
        expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
      });

      const virtualizationToggle = screen.getByRole('checkbox', { name: /virtualization/i });
      expect(virtualizationToggle).toBeInTheDocument();
    });
  });
});