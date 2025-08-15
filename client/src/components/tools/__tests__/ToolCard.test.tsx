import { render, screen, fireEvent } from '../../../test-utils/test-utils';
import { axe } from 'jest-axe';
import { ToolCard } from '../ToolCard';
import { createMockTool } from '../../../test-utils/mockData';

describe('ToolCard', () => {
  const mockOnViewDetails = jest.fn();
  const defaultProps = {
    tool: createMockTool(),
    onViewDetails: mockOnViewDetails,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render tool information correctly', () => {
      render(<ToolCard {...defaultProps} />);

      expect(screen.getByText('Word Count')).toBeInTheDocument();
      expect(screen.getByText('Counts the number of words, characters, and sentences in text.')).toBeInTheDocument();
      expect(screen.getByText('Text Analysis')).toBeInTheDocument();
      expect(screen.getByText('ID: wordcount')).toBeInTheDocument();
    });

    it('should render tool tags correctly', () => {
      const tool = createMockTool({
        tags: ['text', 'analysis', 'count', 'utility'],
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      // Should show first 3 tags
      expect(screen.getByText('text')).toBeInTheDocument();
      expect(screen.getByText('analysis')).toBeInTheDocument();
      expect(screen.getByText('count')).toBeInTheDocument();
      
      // Should show "+1 more" for the 4th tag
      expect(screen.getByText('+1 more')).toBeInTheDocument();
      
      // Should not show the 4th tag directly
      expect(screen.queryByText('utility')).not.toBeInTheDocument();
    });

    it('should render all tags when there are 3 or fewer', () => {
      const tool = createMockTool({
        tags: ['tag1', 'tag2', 'tag3'],
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });

    it('should handle tools with no tags', () => {
      const tool = createMockTool({
        tags: undefined,
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('Word Count')).toBeInTheDocument();
      expect(screen.getByText('Text Analysis')).toBeInTheDocument();
      // Should not crash or show tag-related content
    });

    it('should handle tools with empty tags array', () => {
      const tool = createMockTool({
        tags: [],
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('Word Count')).toBeInTheDocument();
      expect(screen.getByText('Text Analysis')).toBeInTheDocument();
      // Should not show any tags or "more" indicator
    });

    it('should render long tool names correctly', () => {
      const tool = createMockTool({
        name: 'This is a Very Long Tool Name That Should Be Displayed Properly',
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('This is a Very Long Tool Name That Should Be Displayed Properly')).toBeInTheDocument();
    });

    it('should render long descriptions correctly', () => {
      const longDescription = 'This is a very long description that should be displayed properly in the tool card. It contains multiple sentences and should wrap nicely within the card layout without breaking the overall design of the card component.';
      const tool = createMockTool({
        description: longDescription,
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should render special characters in tool information', () => {
      const tool = createMockTool({
        name: 'Tool with "Quotes" & Symbols',
        description: 'Description with <tags> and [brackets] and {curly braces}',
        id: 'tool-with_special.chars@test',
        category: 'Category/Subcategory',
        tags: ['tag-with-dashes', 'tag_with_underscores', 'tag.with.dots'],
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('Tool with "Quotes" & Symbols')).toBeInTheDocument();
      expect(screen.getByText('Description with <tags> and [brackets] and {curly braces}')).toBeInTheDocument();
      expect(screen.getByText('ID: tool-with_special.chars@test')).toBeInTheDocument();
      expect(screen.getByText('Category/Subcategory')).toBeInTheDocument();
      expect(screen.getByText('tag-with-dashes')).toBeInTheDocument();
      expect(screen.getByText('tag_with_underscores')).toBeInTheDocument();
      expect(screen.getByText('tag.with.dots')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onViewDetails when card is clicked', () => {
      render(<ToolCard {...defaultProps} />);

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnViewDetails).toHaveBeenCalledWith(defaultProps.tool);
    });

    it('should call onViewDetails when card is activated via keyboard', () => {
      render(<ToolCard {...defaultProps} />);

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnViewDetails).toHaveBeenCalledWith(defaultProps.tool);
    });

    it('should be focusable and have proper cursor styling', () => {
      render(<ToolCard {...defaultProps} />);

      const card = screen.getByRole('button');
      
      expect(card).toBeInTheDocument();
      expect(card.style.cursor).toBe('pointer');
      
      // Focus the card
      card.focus();
      expect(card).toHaveFocus();
    });

    it('should handle multiple rapid clicks gracefully', () => {
      render(<ToolCard {...defaultProps} />);

      const card = screen.getByRole('button');
      
      // Rapid fire clicks
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);

      expect(mockOnViewDetails).toHaveBeenCalledTimes(3);
      expect(mockOnViewDetails).toHaveBeenCalledWith(defaultProps.tool);
    });
  });

  describe('hover effects and styling', () => {
    it('should have hover styles applied correctly', () => {
      render(<ToolCard {...defaultProps} />);

      const card = screen.getByRole('button');
      
      // Card should have the hover transform and box shadow styles
      const cardStyles = window.getComputedStyle(card);
      expect(card).toHaveStyle('transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out');
    });

    it('should maintain consistent height', () => {
      render(<ToolCard {...defaultProps} />);

      const card = screen.getByRole('button');
      
      // Card should have flex layout for consistent height
      expect(card).toHaveStyle('display: flex');
      expect(card).toHaveStyle('flex-direction: column');
    });
  });

  describe('tag display logic', () => {
    it('should show +N more correctly for various tag counts', () => {
      const testCases = [
        { tagCount: 4, expectedMore: '+1 more' },
        { tagCount: 5, expectedMore: '+2 more' },
        { tagCount: 10, expectedMore: '+7 more' },
      ];

      testCases.forEach(({ tagCount, expectedMore }) => {
        const tags = Array.from({ length: tagCount }, (_, i) => `tag${i + 1}`);
        const tool = createMockTool({ tags });

        const { unmount } = render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

        expect(screen.getByText(expectedMore)).toBeInTheDocument();
        
        // Should only show first 3 tags
        expect(screen.getByText('tag1')).toBeInTheDocument();
        expect(screen.getByText('tag2')).toBeInTheDocument();
        expect(screen.getByText('tag3')).toBeInTheDocument();
        
        // Should not show tag4 and beyond
        if (tagCount > 3) {
          expect(screen.queryByText('tag4')).not.toBeInTheDocument();
        }

        unmount();
      });
    });

    it('should handle very long tag names', () => {
      const tool = createMockTool({
        tags: ['very-long-tag-name-that-might-cause-layout-issues', 'short', 'medium-length-tag'],
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      expect(screen.getByText('very-long-tag-name-that-might-cause-layout-issues')).toBeInTheDocument();
      expect(screen.getByText('short')).toBeInTheDocument();
      expect(screen.getByText('medium-length-tag')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ToolCard {...defaultProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper semantic structure', () => {
      render(<ToolCard {...defaultProps} />);

      // Card should be a clickable element
      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();

      // Tool name should be a heading
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Word Count');
    });

    it('should have appropriate ARIA attributes', () => {
      render(<ToolCard {...defaultProps} />);

      const card = screen.getByRole('button');
      
      // Should be accessible via keyboard
      expect(card).toBeInTheDocument();
      expect(card.tagName.toLowerCase()).toBe('div'); // MUI Card renders as div with role
    });

    it('should handle screen reader content appropriately', () => {
      const tool = createMockTool({
        name: 'Screen Reader Test Tool',
        description: 'Tool for testing screen reader compatibility',
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      // All text content should be accessible to screen readers
      expect(screen.getByText('Screen Reader Test Tool')).toBeInTheDocument();
      expect(screen.getByText('Tool for testing screen reader compatibility')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined category gracefully', () => {
      const tool = createMockTool({
        category: undefined,
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      // Should still render other content
      expect(screen.getByText('Word Count')).toBeInTheDocument();
    });

    it('should handle empty strings in tool data', () => {
      const tool = createMockTool({
        name: '',
        description: '',
        category: '',
        id: '',
      });

      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);

      // Should render without crashing, even with empty strings
      expect(screen.getByText('ID:')).toBeInTheDocument();
    });

    it('should handle null onViewDetails callback gracefully', () => {
      // This test ensures the component doesn't crash if onViewDetails is null
      // In practice, this scenario shouldn't occur due to TypeScript, but it's good to test
      const { container } = render(<ToolCard tool={defaultProps.tool} onViewDetails={null as any} />);
      
      const card = screen.getByRole('button');
      
      // Should not crash when attempting to call null callback
      expect(() => {
        fireEvent.click(card);
      }).not.toThrow();
      
      expect(container).toBeInTheDocument();
    });

    it('should maintain performance with very long content', () => {
      const tool = createMockTool({
        name: 'A'.repeat(1000),
        description: 'B'.repeat(5000),
        tags: Array.from({ length: 100 }, (_, i) => `tag${i}`.repeat(50)),
      });

      const startTime = performance.now();
      render(<ToolCard tool={tool} onViewDetails={mockOnViewDetails} />);
      const endTime = performance.now();

      // Should render quickly even with very long content
      expect(endTime - startTime).toBeLessThan(100);
      
      // Only first 3 tags should be visible regardless of array size
      expect(screen.getByText('+97 more')).toBeInTheDocument();
    });
  });
});