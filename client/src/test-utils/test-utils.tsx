import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme/theme';

interface AllTheProvidersProps {
  children: ReactNode;
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();

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

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialEntries?: string[];
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
) => {
  const { queryClient, initialEntries, ...renderOptions } = options || {};

  const TestWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const client = queryClient || createTestQueryClient();

    return (
      <QueryClientProvider client={client}>
        <BrowserRouter 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: TestWrapper, ...renderOptions });
};

export * from '@testing-library/react';
export { customRender as render };

// Re-export user-event for convenience
export { default as userEvent } from '@testing-library/user-event';