# APM Task Assignment: Write Comprehensive Unit Tests

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 3, Task 3.1** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Achieve comprehensive unit test coverage for all React components and core functionality.

**Prerequisites:** Phase 2 completed - All core UI components should be implemented and functional.

## 2. Detailed Action Steps

1. **Test Data Service Layer:**
   - Create comprehensive tests for `src/services/toolVaultService.ts`:
     ```typescript
     describe('toolVaultService', () => {
       it('should fetch index.json successfully');
       it('should handle network errors gracefully');
       it('should validate data against schema');
       it('should implement retry logic for failed requests');
     });
     ```
   - Test error handling scenarios and edge cases
   - Verify caching behavior and data transformation logic
   - Mock fetch requests using MSW or Jest mocks

2. **Test React Hooks:**
   - Write tests for `src/hooks/useToolVaultData.ts`:
     ```typescript
     describe('useToolVaultData', () => {
       it('should return loading state initially');
       it('should return data after successful fetch');
       it('should handle error states');
       it('should refetch data when invalidated');
     });
     ```
   - Test `useToolById` hook with valid/invalid IDs
   - Test `useDebouncedValue` with various delay values
   - Verify hook cleanup and memory leak prevention

3. **Test Core UI Components:**
   - **ToolList Component Tests:**
     ```typescript
     describe('ToolList', () => {
       it('should render tool cards correctly');
       it('should handle search functionality');
       it('should filter tools by category');
       it('should sort tools by different criteria');
       it('should handle empty search results');
       it('should call onViewDetails when card is clicked');
     });
     ```
   - **ToolDetail Component Tests:**
     ```typescript
     describe('ToolDetail', () => {
       it('should display tool information correctly');
       it('should render input parameters');
       it('should render output specifications');
       it('should handle loading states');
       it('should handle tool not found scenarios');
       it('should navigate back correctly');
     });
     ```
   - **ExecutionPanel Component Tests:**
     ```typescript
     describe('ExecutionPanel', () => {
       it('should validate input parameters');
       it('should display execution progress');
       it('should handle execution errors');
       it('should show output results');
       it('should allow execution reset');
     });
     ```

4. **Test Utility Functions:**
   - Test search and filter algorithms in `src/utils/searchUtils.ts`
   - Test input validation functions in `src/utils/inputValidation.ts`
   - Test type guards and validators
   - Verify data formatting and transformation utilities

## 3. Testing Configuration and Setup

**Test Environment Setup:**
```typescript
// src/test-utils/setup.ts
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '../theme/theme';

const AllProviders: FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export const renderWithProviders = (ui: ReactElement, options?: RenderOptions) => {
  return render(ui, { wrapper: AllProviders, ...options });
};
```

**Mock Data Factories:**
```typescript
// src/test-utils/mockData.ts
export const createMockTool = (overrides?: Partial<Tool>): Tool => ({
  id: 'test-tool',
  name: 'Test Tool',
  description: 'A test tool for unit testing',
  category: 'Testing',
  tags: ['test', 'mock'],
  inputs: [
    {
      name: 'input1',
      label: 'Test Input',
      type: 'string',
      required: true,
    },
  ],
  outputs: [
    {
      name: 'output1',
      label: 'Test Output',
      type: 'string',
    },
  ],
  ...overrides,
});
```

## 4. Coverage Requirements and Quality Gates

**Coverage Targets:**
- **Statements**: 90% minimum
- **Branches**: 85% minimum  
- **Functions**: 95% minimum
- **Lines**: 90% minimum

**Quality Gates:**
```typescript
// jest.config.cjs
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**/*',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
  },
};
```

## 5. Testing Patterns and Best Practices

**Component Testing Pattern:**
```typescript
describe('ComponentName', () => {
  const defaultProps = {
    // minimal required props
  };

  const renderComponent = (props = {}) => {
    return renderWithProviders(
      <ComponentName {...defaultProps} {...props} />
    );
  };

  beforeEach(() => {
    // Reset mocks and state
  });

  describe('rendering', () => {
    it('should render without crashing');
    it('should display required content');
  });

  describe('user interactions', () => {
    it('should handle click events');
    it('should update state correctly');
  });

  describe('error handling', () => {
    it('should handle error props gracefully');
    it('should display error messages');
  });
});
```

**Async Testing Pattern:**
```typescript
it('should handle async operations', async () => {
  const { getByText, findByText } = renderComponent();
  
  fireEvent.click(getByText('Load Data'));
  
  expect(getByText('Loading...')).toBeInTheDocument();
  
  await findByText('Data loaded successfully');
  
  expect(queryByText('Loading...')).not.toBeInTheDocument();
});
```

## 6. Integration with CI/CD

**GitHub Actions Integration:**
```yaml
# .github/workflows/test.yml
- name: Run unit tests with coverage
  run: pnpm test:coverage

- name: Upload coverage reports
  uses: codecov/codecov-action@v4
  with:
    file: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: true
```

## 7. Expected Output & Deliverables

**Success Criteria:**
- All components have comprehensive test coverage
- Test suite runs in under 30 seconds
- 100% test pass rate in CI/CD pipeline
- Coverage thresholds met across all metrics
- No flaky or inconsistent tests

**Deliverables:**
1. **Component Tests:**
   - `src/components/tools/__tests__/ToolList.test.tsx`
   - `src/components/tools/__tests__/ToolDetail.test.tsx`
   - `src/components/tools/__tests__/ToolCard.test.tsx`
   - `src/components/tools/__tests__/ExecutionPanel.test.tsx`
   - `src/components/layout/__tests__/NavigationDrawer.test.tsx`

2. **Hook Tests:**
   - `src/hooks/__tests__/useToolVaultData.test.ts`
   - `src/hooks/__tests__/useToolById.test.ts`
   - `src/hooks/__tests__/useDebouncedValue.test.ts`

3. **Service Tests:**
   - `src/services/__tests__/toolVaultService.test.ts`

4. **Utility Tests:**
   - `src/utils/__tests__/searchUtils.test.ts`
   - `src/utils/__tests__/inputValidation.test.ts`
   - `src/utils/__tests__/validators.test.ts`

5. **Test Infrastructure:**
   - Enhanced test utilities and setup
   - Mock data factories and generators
   - Coverage reporting configuration

## 8. Performance and Accessibility Testing

**Performance Testing:**
```typescript
describe('Performance', () => {
  it('should render large tool lists efficiently', () => {
    const manyTools = Array.from({ length: 1000 }, (_, i) => 
      createMockTool({ id: `tool-${i}` })
    );
    
    const startTime = performance.now();
    renderWithProviders(<ToolList tools={manyTools} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
  });
});
```

**Accessibility Testing:**
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = renderComponent();
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 9. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_3_Testing_Polish/Task_3.1_Unit_Testing_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_QA_Specialist)
- Task reference (Phase 3 / Task 3.1)
- Testing strategy and approach
- Coverage metrics achieved
- Performance test results
- Accessibility compliance status
- CI/CD integration details

## 10. Clarification Instructions

If any part of this task is unclear, please ask before proceeding. Key areas:
- Specific coverage threshold requirements
- Testing framework preferences (Jest vs Vitest)
- Mock strategy for external dependencies
- Performance testing requirements

Please acknowledge receipt and proceed with implementation.