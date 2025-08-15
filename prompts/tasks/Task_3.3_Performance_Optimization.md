# APM Task Assignment: Optimize Application Performance

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 3, Task 3.3** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Ensure optimal loading times and runtime performance through code splitting, bundle optimization, and performance monitoring.

**Prerequisites:** Tasks 3.1 and 3.2 completed - Testing infrastructure should be in place.

## 2. Detailed Action Steps

1. **Implement Code Splitting and Lazy Loading:**
   - Configure dynamic imports for route-based code splitting:
     ```typescript
     // src/router/AppRouter.tsx
     import { lazy, Suspense } from 'react';
     
     const HomePage = lazy(() => import('../pages/HomePage'));
     const ToolListPage = lazy(() => import('../pages/ToolListPage'));
     const ToolDetailPage = lazy(() => import('../pages/ToolDetailPage'));
     
     export function AppRouter() {
       return (
         <BrowserRouter>
           <Suspense fallback={<PageSkeleton />}>
             <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/tools" element={<ToolListPage />} />
               <Route path="/tools/:toolId" element={<ToolDetailPage />} />
             </Routes>
           </Suspense>
         </BrowserRouter>
       );
     }
     ```
   - Create loading skeleton components:
     ```typescript
     // src/components/common/PageSkeleton.tsx
     export function PageSkeleton() {
       return (
         <MainLayout>
           <Container maxWidth="lg" sx={{ py: 3 }}>
             <Skeleton variant="text" width="40%" height={60} sx={{ mb: 2 }} />
             <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
             <Skeleton variant="text" width="80%" height={24} sx={{ mb: 4 }} />
             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
               {[1, 2, 3, 4, 5, 6].map(i => (
                 <Skeleton key={i} variant="rectangular" height={200} />
               ))}
             </Box>
           </Container>
         </MainLayout>
       );
     }
     ```
   - Implement progressive loading for heavy components

2. **Optimize Bundle Size:**
   - Configure Vite for optimal chunking:
     ```typescript
     // vite.config.ts
     export default defineConfig({
       build: {
         rollupOptions: {
           output: {
             manualChunks: {
               vendor: ['react', 'react-dom'],
               mui: ['@mui/material', '@mui/icons-material'],
               router: ['react-router-dom'],
               query: ['@tanstack/react-query'],
             },
           },
         },
         chunkSizeWarningLimit: 1000,
       },
     });
     ```
   - Analyze bundle composition:
     ```bash
     # Add to package.json scripts
     "analyze": "npx vite-bundle-analyzer dist"
     ```
   - Remove unused code and dependencies
   - Optimize imports to reduce bundle size:
     ```typescript
     // Instead of: import { Button } from '@mui/material';
     import Button from '@mui/material/Button';
     ```

3. **Optimize Rendering Performance:**
   - Implement React.memo for expensive components:
     ```typescript
     // src/components/tools/ToolCard.tsx
     export const ToolCard = React.memo<ToolCardProps>(({ tool, onViewDetails }) => {
       // Component implementation
     });
     ```
   - Add useMemo for complex calculations:
     ```typescript
     // src/components/tools/ToolList.tsx
     const filteredAndSortedTools = useMemo(() => {
       const filtered = filterTools(tools, filters);
       return sortTools(filtered, sortOption);
     }, [tools, filters, sortOption]);
     ```
   - Optimize re-render patterns with useCallback:
     ```typescript
     const handleViewDetails = useCallback((tool: Tool) => {
       navigate(`/tools/${tool.id}`);
     }, [navigate]);
     ```
   - Implement virtual scrolling for large lists:
     ```typescript
     // src/components/common/VirtualizedList.tsx
     import { FixedSizeList as List } from 'react-window';
     
     export function VirtualizedToolList({ tools }: { tools: Tool[] }) {
       const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
         <div style={style}>
           <ToolCard tool={tools[index]} />
         </div>
       );
       
       return (
         <List
           height={600}
           itemCount={tools.length}
           itemSize={200}
           width="100%"
         >
           {Row}
         </List>
       );
     }
     ```

4. **Optimize Asset Loading:**
   - Implement image optimization:
     ```typescript
     // src/components/common/OptimizedImage.tsx
     export function OptimizedImage({ 
       src, 
       alt, 
       width, 
       height, 
       loading = 'lazy' 
     }: OptimizedImageProps) {
       return (
         <picture>
           <source srcSet={`${src}?format=webp`} type="image/webp" />
           <source srcSet={`${src}?format=avif`} type="image/avif" />
           <img
             src={src}
             alt={alt}
             width={width}
             height={height}
             loading={loading}
             style={{ aspectRatio: `${width}/${height}` }}
           />
         </picture>
       );
     }
     ```
   - Configure proper caching headers:
     ```typescript
     // vite.config.ts
     export default defineConfig({
       build: {
         assetsDir: 'assets',
         rollupOptions: {
           output: {
             assetFileNames: 'assets/[name]-[hash][extname]',
             chunkFileNames: 'assets/[name]-[hash].js',
             entryFileNames: 'assets/[name]-[hash].js',
           },
         },
       },
     });
     ```
   - Optimize font loading:
     ```html
     <!-- index.html -->
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link rel="preload" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
     ```

## 3. Performance Monitoring Implementation

**Web Vitals Tracking:**
```typescript
// src/utils/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Send to your analytics service
  console.log('Performance metric:', metric);
}

export function initPerformanceMonitoring() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

// Custom performance marks
export function markPerformance(name: string) {
  performance.mark(`${name}-start`);
  return () => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  };
}
```

**Performance Budget Configuration:**
```typescript
// src/utils/performanceBudget.ts
export const PERFORMANCE_BUDGETS = {
  // Time budgets (milliseconds)
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  timeToInteractive: 3000,
  firstInputDelay: 100,
  cumulativeLayoutShift: 0.1,
  
  // Size budgets (bytes)
  totalBundleSize: 1000000, // 1MB
  mainChunkSize: 500000,    // 500KB
  cssSize: 100000,          // 100KB
  imageSize: 200000,        // 200KB per image
} as const;

export function checkPerformanceBudget() {
  // Implementation for CI/CD performance checking
}
```

**Performance Testing:**
```typescript
// src/__tests__/performance.test.ts
describe('Performance Tests', () => {
  it('should render ToolList within performance budget', () => {
    const startTime = performance.now();
    const tools = generateManyTools(1000);
    
    render(<ToolList tools={tools} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // 100ms budget
  });

  it('should handle large datasets efficiently', () => {
    const tools = generateManyTools(10000);
    const filtered = filterTools(tools, { query: 'test' });
    
    expect(filtered.length).toBeGreaterThan(0);
    expect(performance.now()).toBeLessThan(50); // Fast filtering
  });
});
```

## 4. Memory Management and Leak Prevention

**Memory Leak Prevention:**
```typescript
// src/hooks/useCleanupEffect.ts
export function useCleanupEffect(effect: () => (() => void) | void, deps: DependencyList) {
  useEffect(() => {
    const cleanup = effect();
    return () => {
      if (cleanup) cleanup();
    };
  }, deps);
}

// Usage in components
const ToolList = () => {
  useCleanupEffect(() => {
    const interval = setInterval(() => {
      // Some periodic task
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
};
```

**Memory Usage Monitoring:**
```typescript
// src/utils/memoryMonitoring.ts
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log({
      usedJSHeapSize: memInfo.usedJSHeapSize,
      totalJSHeapSize: memInfo.totalJSHeapSize,
      jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
    });
  }
}

// Component memory profiling
export function withMemoryProfiler<T extends object>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return (props: T) => {
    useEffect(() => {
      const componentName = Component.displayName || Component.name;
      console.log(`${componentName} mounted`);
      monitorMemoryUsage();
      
      return () => {
        console.log(`${componentName} unmounted`);
        monitorMemoryUsage();
      };
    }, []);
    
    return <Component {...props} />;
  };
}
```

## 5. Network Optimization

**Request Optimization:**
```typescript
// src/services/optimizedFetch.ts
interface CacheConfig {
  ttl: number;
  key: string;
}

const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export async function fetchWithCache<T>(
  url: string, 
  config: CacheConfig
): Promise<T> {
  const cached = cache.get(config.key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return cached.data;
  }
  
  const data = await fetch(url).then(r => r.json());
  cache.set(config.key, { data, timestamp: now, ttl: config.ttl });
  
  return data;
}

// Preloading strategies
export function preloadRoute(routePath: string) {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = routePath;
  document.head.appendChild(link);
}
```

## 6. Performance Testing Integration

**Lighthouse CI Configuration:**
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173/', 'http://localhost:5173/tools'],
      startServerCommand: 'pnpm preview',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Performance CI/CD Integration:**
```yaml
# Add to .github/workflows/ci.yml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli@0.12.x
    lhci autorun

- name: Check bundle size
  run: |
    npm install -g bundlesize
    bundlesize

# package.json bundlesize config
"bundlesize": [
  {
    "path": "./dist/assets/*.js",
    "maxSize": "500kb",
    "compression": "gzip"
  },
  {
    "path": "./dist/assets/*.css",
    "maxSize": "100kb",
    "compression": "gzip"
  }
]
```

## 7. Expected Output & Deliverables

**Performance Targets:**
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle Size**: < 1MB total, < 500KB main chunk

**Success Criteria:**
- All performance budgets met in CI/CD
- Bundle size optimized with proper code splitting
- Memory leaks eliminated
- Virtual scrolling implemented for large lists
- Performance monitoring integrated

**Deliverables:**
1. **Performance Infrastructure:**
   - `src/utils/performance.ts` - Performance monitoring
   - `src/utils/performanceBudget.ts` - Budget configuration
   - `src/components/common/PageSkeleton.tsx` - Loading states
   - `src/components/common/VirtualizedList.tsx` - Virtual scrolling

2. **Optimization Implementations:**
   - Route-based code splitting
   - Component memoization and optimization
   - Bundle size optimization configuration
   - Asset loading optimization

3. **Monitoring and Testing:**
   - Performance test suite
   - Lighthouse CI integration
   - Bundle size monitoring
   - Memory leak prevention utilities

## 8. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_3_Testing_Polish/Task_3.3_Performance_Optimization_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_Performance_Optimizer)
- Task reference (Phase 3 / Task 3.3)
- Performance optimization strategies implemented
- Benchmark results before and after optimization
- Bundle size reduction achieved
- Performance monitoring setup details
- CI/CD performance gate configuration

Please acknowledge receipt and proceed with implementation.