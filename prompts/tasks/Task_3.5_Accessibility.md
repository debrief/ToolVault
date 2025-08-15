# APM Task Assignment: Implement Accessibility and Final Polish

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 3, Task 3.5** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Ensure WCAG 2.1 AA compliance and polish the user experience with accessibility features, micro-interactions, and comprehensive documentation.

**Prerequisites:** Tasks 3.1-3.4 completed - Testing infrastructure, performance optimization, and error handling should be in place.

## 2. Detailed Action Steps

1. **Implement WCAG 2.1 AA Compliance:**
   - Add comprehensive ARIA labels and roles:
     ```typescript
     // src/components/tools/ToolCard.tsx - Enhanced accessibility
     export function ToolCard({ tool, onViewDetails }: ToolCardProps) {
       return (
         <Card 
           component="article"
           role="button"
           tabIndex={0}
           aria-labelledby={`tool-title-${tool.id}`}
           aria-describedby={`tool-desc-${tool.id}`}
           onClick={() => onViewDetails(tool)}
           onKeyDown={(e) => {
             if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               onViewDetails(tool);
             }
           }}
           sx={{ 
             cursor: 'pointer',
             '&:hover': { transform: 'translateY(-2px)' },
             '&:focus': { 
               outline: '2px solid',
               outlineColor: 'primary.main',
               outlineOffset: '2px'
             }
           }}
         >
           <CardContent>
             <Typography 
               id={`tool-title-${tool.id}`}
               variant="h6" 
               component="h3"
               gutterBottom
             >
               {tool.name}
             </Typography>
             <Typography 
               id={`tool-desc-${tool.id}`}
               variant="body2" 
               color="text.secondary"
               sx={{ mb: 2 }}
             >
               {tool.description}
             </Typography>
             <Box 
               sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
               role="list"
               aria-label="Tool tags"
             >
               {tool.tags.map((tag) => (
                 <Chip
                   key={tag}
                   label={tag}
                   size="small"
                   role="listitem"
                   aria-label={`Tag: ${tag}`}
                 />
               ))}
             </Box>
           </CardContent>
         </Card>
       );
     }
     ```

2. **Implement Focus Management System:**
   - Create focus management utilities:
     ```typescript
     // src/utils/focusManagement.ts
     export class FocusManager {
       private static focusHistory: HTMLElement[] = [];

       static saveFocus() {
         const activeElement = document.activeElement as HTMLElement;
         if (activeElement && activeElement !== document.body) {
           this.focusHistory.push(activeElement);
         }
       }

       static restoreFocus() {
         const lastFocused = this.focusHistory.pop();
         if (lastFocused) {
           lastFocused.focus();
         }
       }

       static trapFocus(container: HTMLElement) {
         const focusableElements = container.querySelectorAll(
           'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
         );
         const firstFocusable = focusableElements[0] as HTMLElement;
         const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

         const handleKeyDown = (e: KeyboardEvent) => {
           if (e.key === 'Tab') {
             if (e.shiftKey) {
               if (document.activeElement === firstFocusable) {
                 e.preventDefault();
                 lastFocusable.focus();
               }
             } else {
               if (document.activeElement === lastFocusable) {
                 e.preventDefault();
                 firstFocusable.focus();
               }
             }
           }
         };

         container.addEventListener('keydown', handleKeyDown);
         return () => container.removeEventListener('keydown', handleKeyDown);
       }
     }

     // Custom hook for focus management
     export function useFocusManagement() {
       const restoreFocus = useRef<HTMLElement | null>(null);

       const saveFocus = useCallback(() => {
         restoreFocus.current = document.activeElement as HTMLElement;
       }, []);

       const restoreFocusTo = useCallback(() => {
         if (restoreFocus.current) {
           restoreFocus.current.focus();
         }
       }, []);

       return { saveFocus, restoreFocus: restoreFocusTo };
     }
     ```

3. **Implement Keyboard Navigation:**
   - Enhanced search and filter keyboard support:
     ```typescript
     // src/components/tools/ToolSearch.tsx - Keyboard navigation
     export function ToolSearch({ onSearch }: ToolSearchProps) {
       const [value, setValue] = useState('');
       const [suggestions, setSuggestions] = useState<string[]>([]);
       const [selectedIndex, setSelectedIndex] = useState(-1);

       const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
         switch (e.key) {
           case 'ArrowDown':
             e.preventDefault();
             setSelectedIndex(prev => 
               prev < suggestions.length - 1 ? prev + 1 : prev
             );
             break;
           case 'ArrowUp':
             e.preventDefault();
             setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
             break;
           case 'Enter':
             e.preventDefault();
             if (selectedIndex >= 0) {
               setValue(suggestions[selectedIndex]);
               onSearch(suggestions[selectedIndex]);
             } else {
               onSearch(value);
             }
             setSuggestions([]);
             break;
           case 'Escape':
             setSuggestions([]);
             setSelectedIndex(-1);
             break;
         }
       };

       return (
         <Autocomplete
           freeSolo
           options={suggestions}
           value={value}
           onInputChange={(_, newValue) => setValue(newValue)}
           renderInput={(params) => (
             <TextField
               {...params}
               label="Search tools"
               placeholder="Enter tool name or description..."
               onKeyDown={handleKeyDown}
               aria-label="Search for analysis tools"
               aria-describedby="search-help"
               InputProps={{
                 ...params.InputProps,
                 startAdornment: <SearchIcon />,
               }}
             />
           )}
         />
       );
     }
     ```

4. **Create Screen Reader Announcements:**
   - Live region announcements:
     ```typescript
     // src/components/common/LiveRegion.tsx
     export function LiveRegion() {
       const [message, setMessage] = useState('');

       useEffect(() => {
         const announceUpdate = (event: CustomEvent) => {
           setMessage(event.detail.message);
           // Clear message after announcement
           setTimeout(() => setMessage(''), 100);
         };

         window.addEventListener('announce', announceUpdate as EventListener);
         return () => window.removeEventListener('announce', announceUpdate as EventListener);
       }, []);

       return (
         <div
           aria-live="polite"
           aria-atomic="true"
           className="sr-only"
           role="status"
         >
           {message}
         </div>
       );
     }

     // Utility function to announce messages
     export function announceToScreenReader(message: string) {
       window.dispatchEvent(
         new CustomEvent('announce', { detail: { message } })
       );
     }

     // Usage in components
     const handleToolsLoaded = (count: number) => {
       announceToScreenReader(`${count} tools loaded and displayed`);
     };
     ```

5. **Implement High Contrast and Dark Mode Support:**
   - Enhanced theme with accessibility considerations:
     ```typescript
     // src/theme/accessibleTheme.ts
     export const createAccessibleTheme = (mode: 'light' | 'dark' | 'high-contrast') => {
       const baseTheme = createTheme({
         palette: {
           mode: mode === 'high-contrast' ? 'dark' : mode,
           ...(mode === 'high-contrast' && {
             primary: { main: '#ffffff' },
             secondary: { main: '#ffff00' },
             background: { default: '#000000', paper: '#1a1a1a' },
             text: { primary: '#ffffff', secondary: '#ffff00' },
             error: { main: '#ff6b6b' },
             warning: { main: '#ffa726' },
             info: { main: '#29b6f6' },
             success: { main: '#66bb6a' },
           }),
         },
         typography: {
           // Ensure minimum 16px font size for accessibility
           body1: { fontSize: '1rem', lineHeight: 1.6 },
           body2: { fontSize: '0.875rem', lineHeight: 1.6 },
         },
         components: {
           MuiButton: {
             styleOverrides: {
               root: {
                 minHeight: 44, // Minimum touch target size
                 '&:focus': {
                   outline: '2px solid',
                   outlineOffset: '2px',
                   outlineColor: mode === 'high-contrast' ? '#ffff00' : '#1976d2',
                 },
               },
             },
           },
           MuiCard: {
             styleOverrides: {
               root: {
                 '&:focus': {
                   outline: '2px solid',
                   outlineOffset: '2px',
                   outlineColor: mode === 'high-contrast' ? '#ffff00' : '#1976d2',
                 },
               },
             },
           },
         },
       });

       return baseTheme;
     };
     ```

## 3. Performance Optimization for Accessibility

**Reduce Motion for Users with Vestibular Disorders:**
```typescript
// src/hooks/useReducedMotion.ts
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Usage in components
export function AnimatedCard({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <Card
      sx={{
        transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: prefersReducedMotion ? 'none' : 'translateY(-4px)',
        },
      }}
    >
      {children}
    </Card>
  );
}
```

## 4. Comprehensive Testing for Accessibility

**Automated Accessibility Testing:**
```typescript
// src/test-utils/accessibilityHelpers.ts
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

export async function testAccessibility(container: HTMLElement) {
  const results = await axe(container, {
    rules: {
      // Configure specific rules for your application
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-labels': { enabled: true },
    },
  });
  
  expect(results).toHaveNoViolations();
  return results;
}

// Integration test example
describe('ToolList Accessibility', () => {
  it('should meet WCAG 2.1 AA standards', async () => {
    const { container } = render(<ToolList tools={mockTools} />);
    await testAccessibility(container);
  });

  it('should support keyboard navigation', async () => {
    const { getByRole } = render(<ToolList tools={mockTools} />);
    const firstTool = getByRole('button', { name: /test tool/i });
    
    firstTool.focus();
    expect(firstTool).toHaveFocus();
    
    fireEvent.keyDown(firstTool, { key: 'Enter' });
    // Assert navigation occurred
  });

  it('should announce content changes to screen readers', async () => {
    const { rerender } = render(<ToolList tools={[]} />);
    
    rerender(<ToolList tools={mockTools} />);
    
    // Verify live region announcement
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('3 tools loaded and displayed');
    });
  });
});
```

## 5. Micro-Interactions and Polish

**Enhanced User Experience:**
```typescript
// src/components/common/InteractiveButton.tsx
export function InteractiveButton({ 
  children, 
  onClick, 
  loading = false,
  ...props 
}: InteractiveButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <Button
      {...props}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={loading}
      sx={{
        transform: !prefersReducedMotion && isPressed ? 'scale(0.98)' : 'scale(1)',
        transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: prefersReducedMotion ? 'none' : 'scale(1.02)',
        },
        '&:focus': {
          outline: '2px solid',
          outlineOffset: '2px',
        },
        ...props.sx,
      }}
    >
      {loading && (
        <CircularProgress 
          size={20} 
          sx={{ 
            position: 'absolute',
            color: 'inherit'
          }} 
        />
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>
    </Button>
  );
}

// Tooltip enhancements
export function AccessibleTooltip({ 
  title, 
  children, 
  ...props 
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Tooltip
      {...props}
      title={title}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      enterDelay={500}
      leaveDelay={200}
      arrow
      PopperProps={{
        'aria-describedby': props.id,
        role: 'tooltip',
      }}
    >
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
    </Tooltip>
  );
}
```

## 6. Documentation and Help System

**Comprehensive Documentation Components:**
```typescript
// src/components/help/HelpSystem.tsx
export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <>
      <Fab
        color="primary"
        aria-label="Open help"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setIsOpen(true)}
      >
        <HelpIcon />
      </Fab>
      
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="help-title"
      >
        <DialogTitle id="help-title">
          ToolVault Help & Documentation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex' }}>
            <List sx={{ minWidth: 200 }}>
              {helpSections.map((section) => (
                <ListItem
                  key={section.id}
                  button
                  selected={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                >
                  <ListItemIcon>{section.icon}</ListItemIcon>
                  <ListItemText primary={section.title} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ flex: 1, p: 2 }}>
              <HelpContent section={activeSection} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Contextual help tooltips
export function ContextualHelp({ content, placement = 'top' }: ContextualHelpProps) {
  return (
    <AccessibleTooltip title={content} placement={placement}>
      <IconButton
        size="small"
        aria-label="Help information"
        sx={{ ml: 1 }}
      >
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </AccessibleTooltip>
  );
}
```

## 7. Keyboard Shortcuts

**Comprehensive Keyboard Navigation:**
```typescript
// src/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            // Focus search
            const searchInput = document.querySelector('[aria-label*="Search"]') as HTMLElement;
            searchInput?.focus();
            break;
          case '/':
            e.preventDefault();
            // Open help
            const helpButton = document.querySelector('[aria-label="Open help"]') as HTMLElement;
            helpButton?.click();
            break;
          case 'h':
            e.preventDefault();
            // Navigate home
            window.location.href = '/';
            break;
        }
      }
      
      // Escape key handling
      if (e.key === 'Escape') {
        // Close any open dialogs or clear focus
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 0) {
          const closeButton = dialogs[dialogs.length - 1].querySelector('button[aria-label*="close"]') as HTMLElement;
          closeButton?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}

// Keyboard shortcut help component
export function KeyboardShortcuts() {
  const shortcuts = [
    { key: 'Ctrl/Cmd + K', description: 'Focus search' },
    { key: 'Ctrl/Cmd + /', description: 'Open help' },
    { key: 'Ctrl/Cmd + H', description: 'Go to homepage' },
    { key: 'Tab', description: 'Navigate between elements' },
    { key: 'Enter/Space', description: 'Activate focused element' },
    { key: 'Escape', description: 'Close dialogs or clear focus' },
  ];

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Keyboard Shortcut</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {shortcuts.map((shortcut) => (
          <TableRow key={shortcut.key}>
            <TableCell>
              <Chip label={shortcut.key} variant="outlined" size="small" />
            </TableCell>
            <TableCell>{shortcut.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## 8. Expected Output & Deliverables

**Success Criteria:**
- WCAG 2.1 AA compliance verified through automated and manual testing
- Complete keyboard navigation support
- Screen reader compatibility confirmed
- High contrast and reduced motion support
- Comprehensive documentation and help system
- All interactive elements have proper focus indicators
- Live regions announce important state changes

**Deliverables:**
1. **Accessibility Infrastructure:**
   - `src/components/common/LiveRegion.tsx`
   - `src/utils/focusManagement.ts`
   - `src/hooks/useFocusManagement.ts`
   - `src/hooks/useReducedMotion.ts`
   - `src/hooks/useKeyboardShortcuts.ts`

2. **Enhanced Components:**
   - Updated `src/components/tools/ToolCard.tsx` with ARIA support
   - Updated `src/components/tools/ToolSearch.tsx` with keyboard nav
   - `src/components/common/InteractiveButton.tsx`
   - `src/components/common/AccessibleTooltip.tsx`

3. **Theme and Visual:**
   - `src/theme/accessibleTheme.ts`
   - High contrast theme implementation
   - Focus indicator styling

4. **Documentation System:**
   - `src/components/help/HelpSystem.tsx`
   - `src/components/help/ContextualHelp.tsx`
   - `src/components/help/KeyboardShortcuts.tsx`
   - Component documentation files

5. **Testing Infrastructure:**
   - `src/test-utils/accessibilityHelpers.ts`
   - Accessibility test suites for all components
   - Manual testing checklist

## 9. Manual Testing Checklist

**Accessibility Testing Checklist:**
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible and consistent
- [ ] Screen reader announcements are meaningful and timely
- [ ] Color contrast ratios meet WCAG AA standards
- [ ] All images have appropriate alt text
- [ ] Forms have proper labels and error messages
- [ ] Keyboard shortcuts work as expected
- [ ] High contrast mode is fully functional
- [ ] Reduced motion preferences are respected
- [ ] Page titles and headings create logical structure

## 10. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_3_Testing_Polish/Task_3.5_Accessibility_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_QA_Specialist)
- Task reference (Phase 3 / Task 3.5)
- WCAG compliance level achieved
- Accessibility features implemented
- Keyboard navigation capabilities
- Screen reader compatibility details
- Testing approach and results
- Documentation and help system features

Please acknowledge receipt and proceed with implementation.