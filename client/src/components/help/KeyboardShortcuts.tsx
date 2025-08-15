import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

interface Shortcut {
  key: string;
  description: string;
  context?: string;
}

const globalShortcuts: Shortcut[] = [
  { key: 'Ctrl/Cmd + K', description: 'Focus search field', context: 'Global' },
  { key: 'Ctrl/Cmd + /', description: 'Open help dialog', context: 'Global' },
  { key: 'Ctrl/Cmd + H', description: 'Go to homepage', context: 'Global' },
  { key: 'F1', description: 'Open help dialog', context: 'Global' },
  { key: 'Escape', description: 'Close dialogs or clear focus', context: 'Global' },
];

const navigationShortcuts: Shortcut[] = [
  { key: 'Tab', description: 'Navigate to next element', context: 'Navigation' },
  { key: 'Shift + Tab', description: 'Navigate to previous element', context: 'Navigation' },
  { key: 'Enter', description: 'Activate focused element', context: 'Navigation' },
  { key: 'Space', description: 'Activate button or toggle', context: 'Navigation' },
  { key: 'Arrow Keys', description: 'Navigate within lists or grids', context: 'Navigation' },
  { key: 'Home', description: 'Move to first item in list', context: 'Navigation' },
  { key: 'End', description: 'Move to last item in list', context: 'Navigation' },
];

const searchShortcuts: Shortcut[] = [
  { key: 'Escape', description: 'Clear search and remove focus', context: 'Search' },
  { key: 'Arrow Down', description: 'Navigate to next suggestion', context: 'Search Autocomplete' },
  { key: 'Arrow Up', description: 'Navigate to previous suggestion', context: 'Search Autocomplete' },
  { key: 'Enter', description: 'Select suggestion or perform search', context: 'Search' },
];

const dialogShortcuts: Shortcut[] = [
  { key: 'Tab', description: 'Navigate within dialog', context: 'Dialog' },
  { key: 'Escape', description: 'Close dialog', context: 'Dialog' },
  { key: 'Enter', description: 'Activate default button', context: 'Dialog' },
];

interface ShortcutTableProps {
  shortcuts: Shortcut[];
  title: string;
}

function ShortcutTable({ shortcuts, title }: ShortcutTableProps) {
  return (
    <Accordion defaultExpanded={title === 'Global Shortcuts'}>
      <AccordionSummary 
        expandIcon={<ExpandMore />}
        aria-controls={`${title.toLowerCase().replace(' ', '-')}-shortcuts`}
        id={`${title.toLowerCase().replace(' ', '-')}-header`}
      >
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label={`${title} keyboard shortcuts`}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Keyboard Shortcut
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Action
                  </Typography>
                </TableCell>
                {shortcuts.some(s => s.context) && (
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Context
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {shortcuts.map((shortcut, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Chip 
                      label={shortcut.key} 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        fontFamily: 'monospace',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {shortcut.description}
                    </Typography>
                  </TableCell>
                  {shortcuts.some(s => s.context) && (
                    <TableCell>
                      {shortcut.context && (
                        <Chip 
                          label={shortcut.context} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}

export function KeyboardShortcuts() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Keyboard Shortcuts Reference
      </Typography>
      <Typography paragraph color="text.secondary">
        ToolVault supports comprehensive keyboard navigation. Use these shortcuts 
        to navigate the application efficiently without a mouse.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Key Notation:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Ctrl/Cmd refers to Control on Windows/Linux or Command on Mac<br />
          • + means press keys simultaneously<br />
          • Arrow Keys can be used individually or with modifiers
        </Typography>
      </Box>

      <ShortcutTable shortcuts={globalShortcuts} title="Global Shortcuts" />
      <ShortcutTable shortcuts={navigationShortcuts} title="Navigation Shortcuts" />
      <ShortcutTable shortcuts={searchShortcuts} title="Search & Filtering" />
      <ShortcutTable shortcuts={dialogShortcuts} title="Dialog & Modal Navigation" />

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" gutterBottom>
          Accessibility Tips:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Use Tab to navigate through interactive elements<br />
          • Screen readers will announce element roles and states<br />
          • Focus indicators show your current position<br />
          • All functionality is available via keyboard<br />
          • Press Escape to exit modal dialogs or autocomplete suggestions
        </Typography>
      </Box>
    </Box>
  );
}