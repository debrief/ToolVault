# APM Task Assignment: Implement Routing and Navigation

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 2, Task 2.4** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Set up React Router for navigation between list and detail views with URL state management.

**Prerequisites:** Tasks 2.1, 2.2, and 2.3 completed - Data service, tool list, and tool detail components should be functional.

## 2. Detailed Action Steps

1. **Install and configure React Router:**
   - Install React Router DOM:
     ```bash
     pnpm add react-router-dom
     pnpm add -D @types/react-router-dom
     ```
   - Create `src/router/AppRouter.tsx` with route configuration:
     ```typescript
     export const AppRouter: React.FC = () => {
       return (
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<HomePage />} />
             <Route path="/tools" element={<ToolListPage />} />
             <Route path="/tools/:toolId" element={<ToolDetailPage />} />
             <Route path="/history" element={<HistoryPage />} />
             <Route path="*" element={<NotFoundPage />} />
           </Routes>
         </BrowserRouter>
       );
     };
     ```
   - Update `src/main.tsx` to use AppRouter instead of direct App component
   - Configure basename for potential subdirectory deployment

2. **Create page-level components:**
   - Create `src/pages/HomePage.tsx`:
     ```typescript
     export const HomePage: React.FC = () => {
       // Welcome page with navigation to tools
       // Include project information and quick links
       // Use existing MainLayout wrapper
     };
     ```
   - Create `src/pages/ToolListPage.tsx`:
     ```typescript
     export const ToolListPage: React.FC = () => {
       // Wrapper for ToolList component
       // Handle URL query parameters for search/filters
       // Include page title and meta information
     };
     ```
   - Create `src/pages/ToolDetailPage.tsx`:
     ```typescript
     export const ToolDetailPage: React.FC = () => {
       const { toolId } = useParams<{ toolId: string }>();
       // Use ToolDetail component with toolId
       // Handle invalid/missing toolId
       // Set document title to tool name
     };
     ```
   - Create `src/pages/NotFoundPage.tsx`:
     - 404 error page with navigation back to home
     - Suggest searching for tools
     - Use MUI error styling and icons

3. **Implement navigation components:**
   - Update `src/components/layout/NavigationDrawer.tsx`:
     ```typescript
     // Replace placeholder onClick handlers with React Router navigation
     import { useNavigate, useLocation } from 'react-router-dom';
     
     const navigate = useNavigate();
     const location = useLocation();
     
     // Highlight active navigation items based on current route
     // Add proper navigation handlers for each menu item
     ```
   - Create `src/components/navigation/NavLink.tsx`:
     ```typescript
     interface NavLinkProps {
       to: string;
       children: React.ReactNode;
       icon?: React.ReactNode;
       active?: boolean;
     }
     ```
   - Update existing breadcrumb components to use React Router navigation

4. **Implement URL state management:**
   - Create `src/hooks/useUrlState.ts`:
     ```typescript
     export function useUrlState<T>(
       key: string, 
       defaultValue: T,
       serialize?: (value: T) => string,
       deserialize?: (value: string) => T
     ) {
       // Sync component state with URL query parameters
       // Handle encoding/decoding of complex state objects
       // Debounce URL updates to avoid excessive history entries
     }
     ```
   - Update ToolListPage to sync search/filter state with URL:
     ```typescript
     const [searchQuery, setSearchQuery] = useUrlState('search', '');
     const [selectedCategories, setSelectedCategories] = useUrlState('categories', []);
     const [sortOption, setSortOption] = useUrlState('sort', 'name-asc');
     ```
   - Create shareable URLs for filtered tool views
   - Implement deep linking for specific tool detail views

## 3. Route Configuration and Structure

**Route Definitions:**
```typescript
interface RouteConfig {
  path: string;
  element: React.ComponentType;
  title?: string;
  requiresAuth?: boolean;
}

const routes: RouteConfig[] = [
  { path: '/', element: HomePage, title: 'ToolVault - Analysis Tools' },
  { path: '/tools', element: ToolListPage, title: 'Tool Catalog - ToolVault' },
  { path: '/tools/:toolId', element: ToolDetailPage }, // Dynamic title
  { path: '/history', element: HistoryPage, title: 'Execution History - ToolVault' },
];
```

**URL Structure:**
- `/` - Homepage with welcome content
- `/tools` - Tool list with optional query parameters
- `/tools?search=analysis&category=text` - Filtered tool list
- `/tools/wordcount` - Individual tool detail page
- `/history` - Execution history (placeholder)

## 4. Navigation Enhancement Features

**Browser Integration:**
- Implement proper page titles for each route using React Helmet or document.title
- Add browser back/forward button support
- Handle page refresh on any route
- Implement scroll restoration for list views

**Navigation Guards:**
```typescript
// Route protection hook
export const useRouteGuard = (toolId?: string) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Validate toolId exists in available tools
    // Redirect to 404 if tool not found
    // Handle loading states during validation
  }, [toolId, navigate]);
};
```

**Active State Management:**
- Highlight current page in navigation drawer
- Update page breadcrumbs dynamically
- Show loading states during route transitions

## 5. Error Handling and Route Guards

**Error Scenarios:**
- Invalid tool IDs in detail routes
- Malformed URL query parameters
- Network errors during route data loading
- Browser navigation edge cases

**Route Validation:**
```typescript
// Tool ID validation
export const ToolDetailGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toolId } = useParams();
  const { data: tools, isLoading } = useToolVaultData();
  
  if (isLoading) return <LoadingPage />;
  if (!tools?.tools.find(t => t.id === toolId)) {
    return <Navigate to="/404" replace />;
  }
  
  return <>{children}</>;
};
```

## 6. Performance Optimizations

**Code Splitting:**
```typescript
// Lazy load page components
const ToolListPage = lazy(() => import('../pages/ToolListPage'));
const ToolDetailPage = lazy(() => import('../pages/ToolDetailPage'));

// Wrap routes with Suspense
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/tools" element={<ToolListPage />} />
    <Route path="/tools/:toolId" element={<ToolDetailPage />} />
  </Routes>
</Suspense>
```

**Route Preloading:**
- Preload tool detail pages on list item hover
- Cache frequently accessed routes
- Implement prefetch strategies for common navigation patterns

## 7. Expected Output & Deliverables

**Success Criteria:**
- All routes navigate correctly without page refresh
- URL state synchronization works for search/filters
- Browser back/forward buttons function properly
- Deep linking works for all pages
- Active navigation states are correct
- 404 handling works for invalid routes
- Page titles update correctly

**Deliverables:**
1. `router/AppRouter.tsx` - Main routing configuration
2. `pages/HomePage.tsx` - Landing page component
3. `pages/ToolListPage.tsx` - Tool list page wrapper
4. `pages/ToolDetailPage.tsx` - Tool detail page wrapper  
5. `pages/NotFoundPage.tsx` - 404 error page
6. `hooks/useUrlState.ts` - URL state synchronization hook
7. `components/navigation/NavLink.tsx` - Navigation link component
8. Updated navigation components with routing
9. Comprehensive routing tests

## 8. Testing Requirements

Create tests for:
- **Routing Tests** (`router/AppRouter.test.tsx`):
  - All routes render correctly
  - Invalid routes show 404 page
  - Navigation between routes works
  - URL parameter parsing

- **Page Component Tests**:
  - Each page renders its content
  - Page titles are set correctly
  - Route parameters are handled properly

- **Navigation Tests**:
  - Active states update correctly
  - Navigation drawer links work
  - Breadcrumb navigation functions

- **URL State Tests** (`hooks/useUrlState.test.ts`):
  - State syncs with URL correctly
  - Complex objects serialize/deserialize properly
  - Debouncing works correctly

- **Integration Tests**:
  - Complete navigation workflows
  - Deep linking functionality
  - Browser navigation edge cases

## 9. Accessibility Considerations

- Proper focus management during route changes
- Screen reader announcements for page changes
- Keyboard navigation for all route links
- Skip links for main content areas
- Proper heading hierarchy maintenance across routes

## 10. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_2_Core_UI_Implementation/Task_2.4_Routing_Navigation_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_Frontend_Dev)
- Task reference (Phase 2 / Task 2.4)
- Router configuration approach
- URL state management strategy
- Performance optimizations implemented
- Error handling and validation approach
- Test coverage for routing functionality

## 11. Clarification Instruction

If any part of this task is unclear, please ask before proceeding. Key areas:
- Route structure preferences
- URL parameter naming conventions
- Error handling strategies
- Code splitting implementation approach

Please acknowledge receipt and proceed with implementation.