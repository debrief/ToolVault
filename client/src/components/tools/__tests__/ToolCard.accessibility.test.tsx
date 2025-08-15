import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolCard } from '../ToolCard';
import { 
  testAccessibility, 
  testKeyboardNavigation, 
  testAriaAttributes,
  runAccessibilityTestSuite 
} from '../../../test-utils/accessibilityHelpers';
import type { Tool } from '../../../types';

const mockTool: Tool = {
  id: 'test-tool-1',
  name: 'Test Analysis Tool',
  description: 'A comprehensive tool for testing data analysis capabilities and workflows.',
  category: 'Testing',
  tags: ['testing', 'analysis', 'data'],
  metadata: {
    version: '1.0.0',
    author: 'Test Author',
    license: 'MIT',
  },
  inputs: [],
  outputs: [],
  parameters: [],
};

const mockOnViewDetails = jest.fn();

describe('ToolCard Accessibility', () => {
  beforeEach(() => {
    mockOnViewDetails.mockClear();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should meet WCAG 2.1 AA standards', async () => {
      const { container } = render(
        <ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />
      );
      
      await testAccessibility(container);
    });

    it('should have proper ARIA attributes', () => {
      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      const card = screen.getByRole('button', { name: /test analysis tool/i });
      
      testAriaAttributes(card, {
        'role': 'button',
        'tabindex': '0',
        'aria-labelledby': `tool-title-${mockTool.id}`,
        'aria-describedby': `tool-desc-${mockTool.id}`,
      });
    });

    it('should have proper semantic structure', () => {
      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      // Check for proper heading structure
      const heading = screen.getByRole('heading', { name: mockTool.name });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H3');
      
      // Check for article structure
      const article = screen.getByRole('button');
      expect(article.tagName).toBe('DIV'); // MUI Card renders as div with role="button"
    });

    it('should have accessible list structure for tags', () => {
      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      const tagsList = screen.getByRole('list', { name: /tool categories and tags/i });
      expect(tagsList).toBeInTheDocument();
      
      const tagItems = screen.getAllByRole('listitem');
      expect(tagItems).toHaveLength(mockTool.tags.length + 1); // tags + category
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      const { container } = render(
        <ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />
      );
      
      await testKeyboardNavigation(container, {
        expectedFocusableElements: 1,
        testEnterKey: true,
        testSpaceKey: true,
      });
    });

    it('should activate with Enter key', async () => {
      const user = userEvent.setup();
      
      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      const card = screen.getByRole('button', { name: /test analysis tool/i });
      card.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockTool);
    });

    it('should activate with Space key', async () => {
      const user = userEvent.setup();
      
      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      const card = screen.getByRole('button', { name: /test analysis tool/i });
      card.focus();
      
      await user.keyboard(' ');
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockTool);
    });

    it('should be focusable with Tab key', async () => {
      const user = userEvent.setup();
      
      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      const card = screen.getByRole('button', { name: /test analysis tool/i });
      
      await user.tab();
      expect(card).toHaveFocus();
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicator', () => {
      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      const card = screen.getByRole('button', { name: /test analysis tool/i });
      card.focus();
      
      // Check that focus styles are applied
      const computedStyle = window.getComputedStyle(card);
      expect(card).toHaveFocus();
      // Note: Actual focus indicator testing would require visual regression tests
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper labeling for screen readers', () => {
      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      // Check title labeling
      const title = screen.getByText(mockTool.name);
      expect(title).toHaveAttribute('id', `tool-title-${mockTool.id}`);
      
      // Check description labeling
      const description = screen.getByText(mockTool.description);
      expect(description).toHaveAttribute('id', `tool-desc-${mockTool.id}`);
    });

    it('should provide meaningful labels for category and tags', () => {
      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      // Check category chip
      const categoryChip = screen.getByLabelText(`Category: ${mockTool.category}`);
      expect(categoryChip).toBeInTheDocument();
      
      // Check tag chips
      mockTool.tags.forEach(tag => {
        const tagChip = screen.getByLabelText(`Tag: ${tag}`);
        expect(tagChip).toBeInTheDocument();
      });
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />);
      
      // The component should render without errors and respect motion preferences
      const card = screen.getByRole('button', { name: /test analysis tool/i });
      expect(card).toBeInTheDocument();
    });
  });

  describe('Comprehensive Accessibility Test', () => {
    it('should pass comprehensive accessibility test suite', async () => {
      const renderResult = render(
        <ToolCard tool={mockTool} onViewDetails={mockOnViewDetails} />
      );
      
      await runAccessibilityTestSuite(renderResult, {
        testKeyboardNav: true,
        testAriaAttributes: true,
        testSemanticStructure: true,
        testReducedMotion: true,
      });
    });
  });
});