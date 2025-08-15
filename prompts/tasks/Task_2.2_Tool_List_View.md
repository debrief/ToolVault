# APM Task Assignment: Build Tool List View Component

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 2, Task 2.2** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Create the main tool browsing interface with search and filter capabilities using Material-UI components.

**Prerequisites:** Task 2.1 completed - Data service layer with React Query integration should be functional.

## 2. Detailed Action Steps

1. **Create ToolList component structure:**
   - Create `src/components/tools/ToolList.tsx` as the main container component:
     ```typescript
     interface ToolListProps {
       // Optional props for external filtering
       categoryFilter?: string;
       searchQuery?: string;
     }
     
     export const ToolList: React.FC<ToolListProps> = (props) => {
       // Use useToolVaultData hook from Task 2.1
       // Implement responsive grid layout using MUI Grid
       // Handle loading, error, and empty states
     };
     ```
   - Create `src/components/tools/ToolCard.tsx` for individual tool display:
     - Display tool name, description, and category
     - Show tags as MUI Chips
     - Include hover effects and click handlers
     - Use MUI Card, CardContent, CardActions components
     - Add "View Details" button linking to detail view

2. **Implement search functionality:**
   - Create `src/components/tools/SearchBar.tsx`:
     ```typescript
     interface SearchBarProps {
       value: string;
       onChange: (value: string) => void;
       placeholder?: string;
     }
     ```
   - Use MUI TextField with InputAdornment for search icon
   - Implement real-time search with 300ms debouncing using `useDebouncedValue` hook
   - Search across tool name, description, and tags
   - Highlight search matches in results using `src/utils/searchUtils.ts`:
     ```typescript
     export function highlightMatches(text: string, query: string): ReactNode;
     export function searchTools(tools: Tool[], query: string): Tool[];
     ```
   - Add clear search functionality with X button

3. **Build filtering system:**
   - Create `src/components/tools/FilterPanel.tsx`:
     ```typescript
     interface FilterPanelProps {
       categories: string[];
       selectedCategories: string[];
       onCategoryChange: (categories: string[]) => void;
       availableTags: string[];
       selectedTags: string[];
       onTagChange: (tags: string[]) => void;
     }
     ```
   - Use MUI Accordion for collapsible filter sections:
     - Category filter with checkboxes (FormGroup, FormControlLabel, Checkbox)
     - Tag-based filtering with autocomplete chips (Autocomplete component)
     - "Clear all filters" functionality
   - Extract unique categories and tags from the tools data
   - Persist filter state in URL query parameters (using React Router)

4. **Add sorting capabilities:**
   - Create `src/components/tools/SortControls.tsx`:
     - Dropdown using MUI Select with sorting options:
       - Name (A-Z, Z-A)
       - Category (A-Z, Z-A) 
       - Recently updated (if timestamp available)
     - Include sort direction toggle buttons
   - Implement sorting logic in `src/utils/sortUtils.ts`:
     ```typescript
     export type SortOption = 'name-asc' | 'name-desc' | 'category-asc' | 'category-desc';
     export function sortTools(tools: Tool[], sortOption: SortOption): Tool[];
     ```
   - Persist sort preferences in localStorage

## 3. State Management and Performance

**Local State Structure:**
```typescript
interface ToolListState {
  searchQuery: string;
  selectedCategories: string[];
  selectedTags: string[];
  sortOption: SortOption;
  currentPage: number;
  itemsPerPage: number;
}
```

**Performance Optimizations:**
- Use `useMemo` for filtering and sorting expensive operations
- Implement virtual scrolling or pagination for large tool lists (MUI Pagination)
- Lazy load tool icons/images if present
- Debounce search input to avoid excessive filtering

## 4. Responsive Design Requirements

- **Desktop (≥1200px)**: 4 tools per row, sidebar filters
- **Tablet (768px-1199px)**: 3 tools per row, collapsible filters  
- **Mobile (≤767px)**: 1-2 tools per row, bottom sheet filters

Use MUI breakpoints and Grid system:
```typescript
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <ToolCard tool={tool} />
  </Grid>
</Grid>
```

## 5. Expected Output & Deliverables

**Success Criteria:**
- Tool list displays all tools from index.json correctly
- Search functionality works across name, description, and tags
- Filtering by categories and tags functions properly
- Sorting options work and persist across sessions
- Responsive design works on all screen sizes
- Loading and error states are handled gracefully

**Deliverables:**
1. `components/tools/ToolList.tsx` - Main container component
2. `components/tools/ToolCard.tsx` - Individual tool display
3. `components/tools/SearchBar.tsx` - Search input with debouncing
4. `components/tools/FilterPanel.tsx` - Category and tag filtering
5. `components/tools/SortControls.tsx` - Sort dropdown and controls
6. `utils/searchUtils.ts` - Search and highlighting utilities
7. `utils/sortUtils.ts` - Sorting logic
8. `hooks/useDebouncedValue.ts` - Debouncing hook
9. Comprehensive tests for all components

## 6. Testing Requirements

Create tests for:
- **ToolList.test.tsx**: 
  - Renders tool list correctly
  - Handles loading and error states
  - Integrates search, filter, and sort functionality
  - Responsive behavior

- **ToolCard.test.tsx**:
  - Displays tool information correctly
  - Click handlers work properly
  - Chip rendering for tags

- **SearchBar.test.tsx**:
  - Search input debouncing
  - Clear search functionality
  - Search highlighting

- **FilterPanel.test.tsx**:
  - Category filtering
  - Tag filtering with autocomplete
  - Clear filters functionality

- **Integration tests**:
  - Complete search + filter + sort workflow
  - URL state synchronization
  - localStorage persistence

## 7. Accessibility Requirements

- Proper ARIA labels for all interactive elements
- Keyboard navigation support for all controls  
- Screen reader announcements for filter changes
- Focus management for search and filter interactions
- High contrast support for search highlighting

## 8. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_2_Core_UI_Implementation/Task_2.2_Tool_List_View_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_UI_Specialist)
- Task reference (Phase 2 / Task 2.2)
- Component architecture overview
- Search and filter implementation details
- Performance optimization strategies applied
- Responsive design approach
- Test coverage summary

## 9. Clarification Instruction

If any part of this task is unclear, please ask before proceeding. Key areas:
- Specific search algorithm preferences
- Filter UI layout preferences  
- Pagination vs virtual scrolling choice
- Performance requirements for large datasets

Please acknowledge receipt and proceed with implementation.