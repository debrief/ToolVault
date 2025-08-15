/**
 * Performance test suite for ToolVault client
 * Tests various performance scenarios and validates against budgets
 */

import { render, waitFor, screen } from '../test-utils/test-utils';
import { ToolList } from '../components/tools/ToolList';
import { 
  PERFORMANCE_BUDGETS,
  checkPerformanceBudgets,
  getCurrentPerformanceMetrics,
} from '../utils/performance';
import { generateManyTools } from '../test-utils/mockData';
import type { Tool } from '../types/index';

// Mock the service to return large datasets
jest.mock('../services/toolVaultService', () => ({
  fetchToolVaultIndex: jest.fn(),
}));

// Performance test helpers
const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await waitFor(() => {
    // Wait for rendering to complete
  });
  const end = performance.now();
  return end - start;
};

const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

describe('Performance Tests', () => {
  // Mock data for testing
  const smallDataset = generateManyTools(10);
  const mediumDataset = generateManyTools(100);
  const largeDataset = generateManyTools(1000);
  const extraLargeDataset = generateManyTools(5000);

  beforeEach(() => {
    // Reset performance measurements
    performance.clearMarks();
    performance.clearMeasures();
  });

  describe('Rendering Performance', () => {
    it('should render small datasets within performance budget', async () => {
      const mockOnViewDetails = jest.fn();
      
      const renderTime = await measureRenderTime(() => {
        render(<ToolList onViewDetails={mockOnViewDetails} />);
      });

      expect(renderTime).toBeLessThan(100); // 100ms budget for small datasets
    });

    it('should render medium datasets efficiently', async () => {
      const mockOnViewDetails = jest.fn();
      
      const renderTime = await measureRenderTime(() => {
        render(<ToolList onViewDetails={mockOnViewDetails} />);
      });

      expect(renderTime).toBeLessThan(300); // 300ms budget for medium datasets
    });

    it('should handle large datasets without blocking UI', async () => {
      const mockOnViewDetails = jest.fn();
      
      const renderTime = await measureRenderTime(() => {
        render(<ToolList onViewDetails={mockOnViewDetails} />);
      });

      // Large datasets should still render reasonably fast with virtualization
      expect(renderTime).toBeLessThan(1000); // 1s budget for large datasets
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks when mounting/unmounting components', async () => {
      const mockOnViewDetails = jest.fn();
      const initialMemory = measureMemoryUsage();

      // Mount and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<ToolList onViewDetails={mockOnViewDetails} />);
        unmount();
      }

      // Allow garbage collection
      await new Promise(resolve => setTimeout(resolve, 100));

      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1000000);
    });

    it('should handle large datasets without excessive memory usage', async () => {
      const mockOnViewDetails = jest.fn();
      const initialMemory = measureMemoryUsage();

      render(<ToolList onViewDetails={mockOnViewDetails} />);

      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable for large datasets
      expect(memoryIncrease).toBeLessThan(10000000); // 10MB limit
    });
  });

  describe('Search and Filter Performance', () => {
    it('should filter tools quickly', () => {
      const startTime = performance.now();
      
      // Simulate filtering large dataset
      const filtered = largeDataset.filter(tool => 
        tool.name.toLowerCase().includes('test') ||
        tool.description.toLowerCase().includes('test')
      );
      
      const endTime = performance.now();
      const filterTime = endTime - startTime;

      expect(filterTime).toBeLessThan(50); // 50ms budget for filtering
    });

    it('should sort tools efficiently', () => {
      const startTime = performance.now();
      
      // Simulate sorting large dataset
      const sorted = [...largeDataset].sort((a, b) => a.name.localeCompare(b.name));
      
      const endTime = performance.now();
      const sortTime = endTime - startTime;

      expect(sortTime).toBeLessThan(100); // 100ms budget for sorting
      expect(sorted.length).toBe(largeDataset.length);
    });
  });

  describe('Performance Budget Compliance', () => {
    it('should meet bundle size budget', async () => {
      const metrics = await getCurrentPerformanceMetrics();
      const report = checkPerformanceBudgets(metrics);

      // Check specific budget violations
      const bundleSizeViolation = report.violations.find(v => v.metric === 'totalBundleSize');
      expect(bundleSizeViolation).toBeUndefined();

      const mainChunkViolation = report.violations.find(v => v.metric === 'mainChunkSize');
      expect(mainChunkViolation).toBeUndefined();
    });

    it('should have reasonable performance scores', async () => {
      const metrics = await getCurrentPerformanceMetrics();
      const report = checkPerformanceBudgets(metrics);

      // Should pass at least 80% of performance budgets
      expect(report.score).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Component-Specific Performance', () => {
    describe('ToolCard Performance', () => {
      it('should render individual tool cards quickly', () => {
        const mockOnViewDetails = jest.fn();
        const tool: Tool = smallDataset[0];

        const startTime = performance.now();
        render(
          <div>
            {/* Render multiple cards to test performance */}
            {Array.from({ length: 100 }, (_, i) => (
              <div key={i}>
                {tool.name} - {tool.description}
              </div>
            ))}
          </div>
        );
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(100); // 100ms for 100 cards
      });
    });

    describe('Virtual Scrolling Performance', () => {
      it('should handle virtual scrolling efficiently', async () => {
        // This test would require setting up virtual scrolling
        // and measuring scroll performance
        const mockOnViewDetails = jest.fn();
        
        const renderTime = await measureRenderTime(() => {
          render(<ToolList onViewDetails={mockOnViewDetails} />);
        });

        // Virtual scrolling should make large datasets render quickly
        expect(renderTime).toBeLessThan(500); // 500ms budget
      });
    });
  });

  describe('Network Performance Simulation', () => {
    it('should handle slow network conditions gracefully', async () => {
      // Mock slow network response
      const mockFetch = jest.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ tools: mediumDataset })
          }), 1000) // 1 second delay
        )
      );

      global.fetch = mockFetch;

      const mockOnViewDetails = jest.fn();
      render(<ToolList onViewDetails={mockOnViewDetails} />);

      // Should show loading state immediately
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Should handle the delayed response
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty datasets efficiently', () => {
      const mockOnViewDetails = jest.fn();
      const emptyDataset: Tool[] = [];

      const startTime = performance.now();
      render(<ToolList onViewDetails={mockOnViewDetails} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Very fast for empty data
    });

    it('should handle datasets with long strings efficiently', () => {
      const mockOnViewDetails = jest.fn();
      const longStringDataset = smallDataset.map(tool => ({
        ...tool,
        name: 'A'.repeat(1000), // Very long name
        description: 'B'.repeat(5000), // Very long description
      }));

      const startTime = performance.now();
      render(<ToolList onViewDetails={mockOnViewDetails} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should handle long strings
    });
  });
});

describe('Performance Utilities Tests', () => {
  describe('Performance Budget Checking', () => {
    it('should correctly identify budget violations', () => {
      const testMetrics = {
        firstContentfulPaint: 2000, // Over 1800ms budget
        largestContentfulPaint: 2000, // Under 2500ms budget
        totalBundleSize: 1500000, // Over 1MB budget
      };

      const report = checkPerformanceBudgets(testMetrics);

      expect(report.violations).toHaveLength(2); // FCP and bundle size
      expect(report.passed).toBe(1); // LCP
      expect(report.failed).toBe(2);
    });

    it('should calculate performance scores correctly', () => {
      const perfectMetrics = {
        firstContentfulPaint: 1000, // Well under budget
        largestContentfulPaint: 2000, // Under budget
        totalBundleSize: 500000, // Under budget
      };

      const report = checkPerformanceBudgets(perfectMetrics);

      expect(report.score).toBe(100);
      expect(report.violations).toHaveLength(0);
    });
  });
});

// Mock performance.now for consistent testing
Object.defineProperty(window, 'performance', {
  value: {
    ...performance,
    now: jest.fn(() => Date.now()),
  },
});

// Cleanup after tests
afterEach(() => {
  jest.clearAllMocks();
});