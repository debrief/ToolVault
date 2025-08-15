import { render, screen, waitFor } from '../../../test-utils/test-utils';
import { axe } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToolDetail } from '../ToolDetail';
import { useToolById } from '../../../hooks/useToolById';
import { mockTool, createMockTool } from '../../../test-utils/mockData';
import { NetworkError, NotFoundError } from '../../../services/errors';
import { createTestQueryClient } from '../../../test-utils/test-utils';

// Mock the hooks and components
jest.mock('../../../hooks/useToolById');
jest.mock('../ToolBreadcrumbs', () => ({
  ToolBreadcrumbs: ({ toolName }: { toolName: string }) => <div data-testid="tool-breadcrumbs">{toolName}</div>
}));
jest.mock('../ToolHeader', () => ({
  ToolHeader: ({ tool, onBackClick }: any) => (
    <div data-testid="tool-header">
      <h1>{tool.name}</h1>
      {onBackClick && <button onClick={onBackClick}>Back</button>}
    </div>
  )
}));
jest.mock('../InputsList', () => ({
  InputsList: ({ inputs, readOnly }: any) => (
    <div data-testid="inputs-list">
      Inputs: {inputs.length} (ReadOnly: {String(readOnly)})
    </div>
  )
}));
jest.mock('../OutputsList', () => ({
  OutputsList: ({ outputs, showPreview, previewData }: any) => (
    <div data-testid="outputs-list">
      Outputs: {outputs.length} 
      {showPreview && ` (Preview: ${Object.keys(previewData || {}).length} items)`}
    </div>
  )
}));
jest.mock('../ExecutionPanel', () => ({
  ExecutionPanel: ({ tool }: any) => (
    <div data-testid="execution-panel">
      Execution Panel for: {tool.name}
    </div>
  )
}));

const mockUseToolById = useToolById as jest.MockedFunction<typeof useToolById>;

describe('ToolDetail', () => {
  let queryClient: QueryClient;
  const mockOnBack = jest.fn();

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

  const defaultProps = {
    toolId: 'wordcount',
    onBack: mockOnBack,
  };

  describe('loading state', () => {
    it('should show loading skeleton when data is loading', () => {
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByText('Loading tools...')).toBeInTheDocument();
      
      // Should show skeleton elements
      expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0);
    });

    it('should show proper loading structure', () => {
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      const { container } = renderWithProviders(<ToolDetail {...defaultProps} />);

      // Should be in a container with proper layout
      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toBeInTheDocument();
    });
  });

  describe('error states', () => {
    it('should show error message when there is an error', () => {
      const error = new NetworkError('Failed to load tool');
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: false,
        isError: true,
        error,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByText('Error Loading Tool')).toBeInTheDocument();
      expect(screen.getByText('Failed to load tool')).toBeInTheDocument();
    });

    it('should show generic error message when error has no message', () => {
      const error = new Error('');
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: false,
        isError: true,
        error,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByText('Error Loading Tool')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred while loading the tool.')).toBeInTheDocument();
    });

    it('should handle NotFoundError specifically', () => {
      const error = new NotFoundError('Tool not found');
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: false,
        isError: true,
        error,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByText('Error Loading Tool')).toBeInTheDocument();
      expect(screen.getByText('Tool not found')).toBeInTheDocument();
    });
  });

  describe('not found state', () => {
    it('should show not found message when tool is not found', () => {
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: true,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByText('Tool Not Found')).toBeInTheDocument();
      expect(screen.getByText('The requested tool could not be found. It may have been removed or the ID is incorrect.')).toBeInTheDocument();
    });

    it('should show not found when tool is undefined but not loading', () => {
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByText('Tool Not Found')).toBeInTheDocument();
    });
  });

  describe('successful tool loading', () => {
    beforeEach(() => {
      mockUseToolById.mockReturnValue({
        tool: mockTool,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });
    });

    it('should render all main components when tool is loaded', () => {
      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByTestId('tool-breadcrumbs')).toBeInTheDocument();
      expect(screen.getByTestId('tool-header')).toBeInTheDocument();
      expect(screen.getByTestId('inputs-list')).toBeInTheDocument();
      expect(screen.getByTestId('outputs-list')).toBeInTheDocument();
      expect(screen.getByTestId('execution-panel')).toBeInTheDocument();
    });

    it('should pass correct props to ToolBreadcrumbs', () => {
      renderWithProviders(<ToolDetail {...defaultProps} />);

      const breadcrumbs = screen.getByTestId('tool-breadcrumbs');
      expect(breadcrumbs).toHaveTextContent(mockTool.name);
    });

    it('should pass correct props to ToolHeader', () => {
      renderWithProviders(<ToolDetail {...defaultProps} />);

      const header = screen.getByTestId('tool-header');
      expect(header).toHaveTextContent(mockTool.name);
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('should pass correct props to InputsList', () => {
      renderWithProviders(<ToolDetail {...defaultProps} />);

      const inputsList = screen.getByTestId('inputs-list');
      expect(inputsList).toHaveTextContent(`Inputs: ${mockTool.inputs.length} (ReadOnly: true)`);
    });

    it('should pass correct props to OutputsList', () => {
      renderWithProviders(<ToolDetail {...defaultProps} />);

      const outputsList = screen.getByTestId('outputs-list');
      expect(outputsList).toHaveTextContent(`Outputs: ${mockTool.outputs.length}`);
    });

    it('should pass correct props to ExecutionPanel', () => {
      renderWithProviders(<ToolDetail {...defaultProps} />);

      const executionPanel = screen.getByTestId('execution-panel');
      expect(executionPanel).toHaveTextContent(`Execution Panel for: ${mockTool.name}`);
    });

    it('should handle onBack callback', () => {
      renderWithProviders(<ToolDetail {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: 'Back' });
      backButton.click();

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should work without onBack callback', () => {
      renderWithProviders(<ToolDetail toolId="wordcount" />);

      // Should render without the back button when no onBack is provided
      expect(screen.getByTestId('tool-header')).toBeInTheDocument();
    });

    it('should have proper layout structure', () => {
      const { container } = renderWithProviders(<ToolDetail {...defaultProps} />);

      // Should have main container
      const mainContainer = container.querySelector('.MuiContainer-root');
      expect(mainContainer).toBeInTheDocument();

      // Should have grid layout for inputs/outputs
      const gridElements = container.querySelectorAll('[style*="grid"]');
      expect(gridElements.length).toBeGreaterThan(0);

      // Should have execution panel with proper ID
      const executionPanel = container.querySelector('#execution-panel');
      expect(executionPanel).toBeInTheDocument();
    });
  });

  describe('different tool configurations', () => {
    it('should handle tools with no inputs', () => {
      const toolWithoutInputs = createMockTool({
        inputs: [],
      });

      mockUseToolById.mockReturnValue({
        tool: toolWithoutInputs,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      const inputsList = screen.getByTestId('inputs-list');
      expect(inputsList).toHaveTextContent('Inputs: 0 (ReadOnly: true)');
    });

    it('should handle tools with no outputs', () => {
      const toolWithoutOutputs = createMockTool({
        outputs: [],
      });

      mockUseToolById.mockReturnValue({
        tool: toolWithoutOutputs,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      const outputsList = screen.getByTestId('outputs-list');
      expect(outputsList).toHaveTextContent('Outputs: 0');
    });

    it('should handle tools with many inputs and outputs', () => {
      const complexTool = createMockTool({
        inputs: [
          { name: 'input1', label: 'Input 1', type: 'string', required: true },
          { name: 'input2', label: 'Input 2', type: 'number', required: false },
          { name: 'input3', label: 'Input 3', type: 'boolean', required: true },
        ],
        outputs: [
          { name: 'output1', label: 'Output 1', type: 'string' },
          { name: 'output2', label: 'Output 2', type: 'number' },
        ],
      });

      mockUseToolById.mockReturnValue({
        tool: complexTool,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByText('Inputs: 3 (ReadOnly: true)')).toBeInTheDocument();
      expect(screen.getByText('Outputs: 2')).toBeInTheDocument();
    });

    it('should handle tools with special characters in names', () => {
      const toolWithSpecialChars = createMockTool({
        name: 'Tool with "quotes" & <symbols>',
      });

      mockUseToolById.mockReturnValue({
        tool: toolWithSpecialChars,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByText('Tool with "quotes" & <symbols>')).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should have responsive layout classes', () => {
      mockUseToolById.mockReturnValue({
        tool: mockTool,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const { container } = renderWithProviders(<ToolDetail {...defaultProps} />);

      // Check for responsive container
      const container_element = container.querySelector('.MuiContainer-maxWidthLg');
      expect(container_element).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseToolById.mockReturnValue({
        tool: mockTool,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });
    });

    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<ToolDetail {...defaultProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure in error states', () => {
      const error = new NetworkError('Test error');
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: false,
        isError: true,
        error,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('Error Loading Tool');
    });

    it('should have proper heading structure in not found state', () => {
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: true,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('Tool Not Found');
    });
  });

  describe('edge cases', () => {
    it('should handle empty toolId', () => {
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: true,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail toolId="" onBack={mockOnBack} />);

      expect(screen.getByText('Tool Not Found')).toBeInTheDocument();
    });

    it('should handle null tool gracefully', () => {
      mockUseToolById.mockReturnValue({
        tool: null as any,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      renderWithProviders(<ToolDetail {...defaultProps} />);

      expect(screen.getByText('Tool Not Found')).toBeInTheDocument();
    });

    it('should handle hook state changes correctly', async () => {
      const { rerender } = renderWithProviders(<ToolDetail {...defaultProps} />);

      // Start with loading
      mockUseToolById.mockReturnValue({
        tool: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: 0,
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <ToolDetail {...defaultProps} />
        </QueryClientProvider>
      );

      expect(screen.getByText('Loading tools...')).toBeInTheDocument();

      // Then load successfully
      mockUseToolById.mockReturnValue({
        tool: mockTool,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <ToolDetail {...defaultProps} />
        </QueryClientProvider>
      );

      expect(screen.getByTestId('tool-header')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should render large tool configurations efficiently', () => {
      const largeTool = createMockTool({
        inputs: Array.from({ length: 50 }, (_, i) => ({
          name: `input${i}`,
          label: `Input ${i}`,
          type: 'string',
          required: i % 2 === 0,
        })),
        outputs: Array.from({ length: 30 }, (_, i) => ({
          name: `output${i}`,
          label: `Output ${i}`,
          type: 'string',
        })),
      });

      mockUseToolById.mockReturnValue({
        tool: largeTool,
        isLoading: false,
        isError: false,
        error: null,
        isNotFound: false,
        refetch: jest.fn(),
        refresh: jest.fn(),
        invalidate: jest.fn(),
        isStale: false,
        dataUpdatedAt: Date.now(),
      });

      const startTime = performance.now();
      renderWithProviders(<ToolDetail {...defaultProps} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByText('Inputs: 50 (ReadOnly: true)')).toBeInTheDocument();
      expect(screen.getByText('Outputs: 30')).toBeInTheDocument();
    });
  });
});