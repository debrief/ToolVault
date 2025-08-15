# APM Task Assignment: Create Tool Detail View Component

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 2, Task 2.3** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Build detailed view for individual tools showing inputs, outputs, metadata, and execution interface.

**Prerequisites:** Tasks 2.1 and 2.2 completed - Data service layer and tool list should be functional.

## 2. Detailed Action Steps

1. **Create ToolDetail component structure:**
   - Create `src/components/tools/ToolDetail.tsx` as the main detail component:
     ```typescript
     interface ToolDetailProps {
       toolId: string;
     }
     
     export const ToolDetail: React.FC<ToolDetailProps> = ({ toolId }) => {
       // Use useToolById hook from Task 2.1
       // Handle loading, error, and not-found states
       // Implement responsive layout with MUI Grid
     };
     ```
   - Use MUI Paper component for main content container
   - Implement breadcrumb navigation showing: Home > Tools > [Tool Name]
   - Add loading skeleton using MUI Skeleton components

2. **Implement tool metadata display:**
   - Create `src/components/tools/ToolHeader.tsx`:
     ```typescript
     interface ToolHeaderProps {
       tool: Tool;
       onRunClick: () => void;
     }
     ```
   - Display tool information in a structured layout:
     - Tool name as H1 typography
     - Description in body text with proper line spacing
     - Category as a prominent chip/badge
     - Tags as MUI Chips in a flex container
   - Add action buttons:
     - Primary "Run Tool" button (non-functional but styled)
     - Secondary "Bookmark" button (placeholder)
     - Share button with copy-to-clipboard functionality

3. **Create inputs display section:**
   - Create `src/components/tools/InputsList.tsx`:
     ```typescript
     interface InputsListProps {
       inputs: ToolInput[];
       values?: Record<string, any>;
       onChange?: (values: Record<string, any>) => void;
       readOnly?: boolean;
     }
     ```
   - Display each input parameter with:
     - Parameter name and human-readable label
     - Data type badge (string, number, geojson, etc.)
     - Required/optional indicator with clear visual distinction
     - Help text or description if available
     - Input field for parameter entry (for future functionality)
   - Use MUI List, ListItem, ListItemIcon, ListItemText
   - Add type-specific icons for different parameter types:
     - TextFields icon for string inputs
     - Numbers icon for numeric inputs  
     - Map icon for geojson inputs

4. **Implement outputs display section:**
   - Create `src/components/tools/OutputsList.tsx`:
     ```typescript
     interface OutputsListProps {
       outputs: ToolOutput[];
       showPreview?: boolean;
     }
     ```
   - Display output parameters with consistent styling to inputs:
     - Output name and label
     - Data type badges
     - Expected output description
     - Placeholder preview areas for future output display
   - Use similar visual design to InputsList for consistency
   - Add "Expected Output" section header

5. **Add execution interface placeholder:**
   - Create `src/components/tools/ExecutionPanel.tsx`:
     ```typescript
     interface ExecutionPanelProps {
       tool: Tool;
       onExecute: (inputs: Record<string, any>) => void;
       isExecuting?: boolean;
     }
     ```
   - Design execution interface with:
     - Input parameter form (using InputsList component)
     - Large "Execute Tool" button with loading states
     - Execution status indicators
     - Output preview area (placeholder for Phase 3)
   - Add form validation for required parameters
   - Implement proper loading states with MUI CircularProgress

## 3. Navigation and Action Handling

**Navigation Components:**
```typescript
// Breadcrumb component
export const ToolBreadcrumbs: React.FC<{ toolName: string }> = ({ toolName }) => {
  // Use MUI Breadcrumbs component
  // Include navigation links back to tool list
};

// Back button functionality  
export const BackButton: React.FC = () => {
  // Use React Router's navigate hook
  // Style as secondary button
};
```

**Action Handlers:**
- Implement copy-to-clipboard for share functionality
- Add bookmark toggle state (stored in localStorage)
- Create execution handler that validates inputs and shows status messages
- Add keyboard shortcuts (Ctrl+Enter to execute, Esc to go back)

## 4. Layout and Design Specifications

**Responsive Layout:**
- **Desktop**: Two-column layout (inputs/outputs side-by-side)
- **Tablet**: Single column with collapsible sections  
- **Mobile**: Stack all sections vertically with optimal spacing

**Visual Hierarchy:**
```typescript
// Layout structure
<Container maxWidth="lg">
  <ToolBreadcrumbs />
  <ToolHeader />
  
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Paper>
        <InputsList />
      </Paper>
    </Grid>
    
    <Grid item xs={12} md={6}>  
      <Paper>
        <OutputsList />
      </Paper>
    </Grid>
    
    <Grid item xs={12}>
      <ExecutionPanel />
    </Grid>
  </Grid>
</Container>
```

## 5. State Management

**Component State:**
```typescript
interface ToolDetailState {
  inputValues: Record<string, any>;
  isBookmarked: boolean;
  executionStatus: 'idle' | 'validating' | 'executing' | 'complete' | 'error';
  validationErrors: Record<string, string>;
}
```

**Persistence:**
- Save bookmarked tools to localStorage
- Persist input parameter values during session
- Clear execution state when navigating away

## 6. Error Handling and Edge Cases

**Error Scenarios:**
- Tool not found (404-style error page)
- Network errors loading tool data
- Invalid tool ID format
- Missing required fields in tool data

**Fallback UI:**
- Skeleton loading states for all major sections
- Error boundaries for component failures
- Graceful degradation when optional data is missing
- User-friendly error messages with actionable suggestions

## 7. Expected Output & Deliverables

**Success Criteria:**
- Tool details display correctly with all metadata
- Inputs and outputs are clearly presented with type information
- Navigation breadcrumbs work properly
- Responsive design functions on all screen sizes
- Non-functional execution interface is properly styled
- Error and loading states are handled gracefully

**Deliverables:**
1. `components/tools/ToolDetail.tsx` - Main detail page component
2. `components/tools/ToolHeader.tsx` - Tool metadata and actions
3. `components/tools/InputsList.tsx` - Parameter input display
4. `components/tools/OutputsList.tsx` - Expected output display  
5. `components/tools/ExecutionPanel.tsx` - Execution interface
6. `components/tools/ToolBreadcrumbs.tsx` - Navigation breadcrumbs
7. `utils/inputValidation.ts` - Input validation utilities
8. `hooks/useBookmarks.ts` - Bookmark management hook
9. Comprehensive test suite for all components

## 8. Testing Requirements

Create tests for:
- **ToolDetail.test.tsx**:
  - Renders tool details correctly
  - Handles not found scenarios
  - Navigation functionality works
  - Responsive layout behavior

- **ToolHeader.test.tsx**:
  - Displays all tool metadata
  - Action buttons function properly
  - Share functionality works

- **InputsList/OutputsList.test.tsx**:
  - Parameter display accuracy
  - Type badge rendering
  - Required/optional indicators

- **ExecutionPanel.test.tsx**:
  - Form validation logic
  - Button states and loading
  - Error handling

- **Integration tests**:
  - Complete tool detail workflow
  - Navigation integration
  - State persistence

## 9. Accessibility Requirements

- Proper heading hierarchy (H1 for tool name, H2 for sections)
- ARIA labels for all interactive elements
- Keyboard navigation for all actions
- Screen reader support for parameter types and requirements
- Focus management for form inputs
- High contrast support for status indicators

## 10. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_2_Core_UI_Implementation/Task_2.3_Tool_Detail_View_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_UI_Specialist)  
- Task reference (Phase 2 / Task 2.3)
- Component architecture decisions
- Layout and responsive design approach
- State management strategy
- Accessibility features implemented
- Test coverage achieved

## 11. Clarification Instruction

If any part of this task is unclear, please ask before proceeding. Key areas:
- Specific layout preferences for inputs/outputs
- Validation requirements for parameter inputs
- Bookmark storage mechanism preferences
- Error handling approach

Please acknowledge receipt and proceed with implementation.