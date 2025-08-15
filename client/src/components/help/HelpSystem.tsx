import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Fab,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Help as HelpIcon,
  Close as CloseIcon,
  ExpandMore,
  Info,
  Search,
  Keyboard,
  Accessibility,
  FilterList,
  ViewList,
} from '@mui/icons-material';
import { useFocusManagement } from '../../hooks/useFocusManagement';
import { AccessibleTooltip } from '../common/AccessibleTooltip';
import { KeyboardShortcuts } from './KeyboardShortcuts';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactElement;
  content: React.ReactNode;
}

const helpSections: HelpSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: <Info />,
    content: (
      <Box>
        <Typography variant="h6" gutterBottom>
          Welcome to ToolVault
        </Typography>
        <Typography paragraph>
          ToolVault is a comprehensive analysis tools catalog that helps you discover, 
          explore, and utilize various data analysis tools. This application is designed 
          with accessibility in mind, ensuring all users can effectively navigate and 
          use the interface.
        </Typography>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Key Features:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Search and filter tools by name, category, or tags" />
          </ListItem>
          <ListItem>
            <ListItemText primary="View detailed information about each tool" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Keyboard navigation support" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Screen reader compatibility" />
          </ListItem>
          <ListItem>
            <ListItemText primary="High contrast and reduced motion support" />
          </ListItem>
        </List>
      </Box>
    ),
  },
  {
    id: 'search',
    title: 'Search & Filtering',
    icon: <Search />,
    content: (
      <Box>
        <Typography variant="h6" gutterBottom>
          Finding Tools
        </Typography>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Search</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              Use the search bar to find tools by name or description. The search 
              is case-insensitive and matches partial text.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Press Ctrl+K (or Cmd+K on Mac) to quickly focus the search field.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Category Filtering</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              Filter tools by category using the dropdown menu. This helps narrow 
              down tools to specific types of analysis.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Tag Filtering</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              Select multiple tags to find tools that match your specific needs. 
              Tags represent tool capabilities, technologies, or use cases.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Sorting</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              Sort tools by name or category in ascending or descending order. 
              Click the sort direction button to toggle between ascending and descending.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    ),
  },
  {
    id: 'navigation',
    title: 'Navigation',
    icon: <ViewList />,
    content: (
      <Box>
        <Typography variant="h6" gutterBottom>
          Navigating ToolVault
        </Typography>
        <Typography paragraph>
          ToolVault supports both mouse and keyboard navigation to ensure accessibility 
          for all users.
        </Typography>
        
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Mouse Navigation:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Click on tool cards to view detailed information" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Use toolbar buttons to switch between grid and list views" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Hover over elements to see tooltips with additional information" />
          </ListItem>
        </List>
        
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Touch Navigation:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="All interactive elements meet minimum 44px touch target size" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Tap tool cards to view details" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Use standard touch gestures for scrolling" />
          </ListItem>
        </List>
      </Box>
    ),
  },
  {
    id: 'keyboard',
    title: 'Keyboard Shortcuts',
    icon: <Keyboard />,
    content: <KeyboardShortcuts />,
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    icon: <Accessibility />,
    content: (
      <Box>
        <Typography variant="h6" gutterBottom>
          Accessibility Features
        </Typography>
        <Typography paragraph>
          ToolVault is designed to be accessible to users with disabilities and 
          follows WCAG 2.1 AA guidelines.
        </Typography>
        
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Screen Reader Support</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemText primary="All interactive elements have appropriate ARIA labels" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Live regions announce important changes" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Semantic HTML structure for proper navigation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Status announcements for search results and filters" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Keyboard Navigation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemText primary="Full keyboard accessibility with Tab navigation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Arrow key navigation within lists and grids" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Enter and Space key activation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Escape key to close dialogs and clear focus" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Visual Accessibility</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemText primary="High contrast mode support" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Sufficient color contrast ratios (WCAG AA)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Focus indicators on all interactive elements" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Scalable text and interface elements" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Motion & Animation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemText primary="Respects prefers-reduced-motion settings" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Optional animations and transitions" />
              </ListItem>
              <ListItem>
                <ListItemText primary="No auto-playing content or flashing elements" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
    ),
  },
];

export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const { saveFocus, restoreFocus, trapFocus, releaseFocusTrap } = useFocusManagement();

  const handleOpen = () => {
    saveFocus();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    releaseFocusTrap();
    restoreFocus();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        handleOpen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeContent = helpSections.find(section => section.id === activeSection)?.content;

  return (
    <>
      <AccessibleTooltip title="Open help (F1 or Ctrl+/)">
        <Fab
          color="primary"
          aria-label="Open help documentation"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            zIndex: 1000,
          }}
          onClick={handleOpen}
        >
          <HelpIcon />
        </Fab>
      </AccessibleTooltip>
      
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        aria-labelledby="help-dialog-title"
        aria-describedby="help-dialog-description"
        PaperProps={{
          ref: (node: HTMLElement | null) => {
            if (node && isOpen) {
              trapFocus(node);
            }
          },
        }}
      >
        <DialogTitle id="help-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpIcon color="primary" />
            ToolVault Help & Documentation
          </Box>
          <IconButton
            onClick={handleClose}
            aria-label="Close help dialog"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Typography 
            id="help-dialog-description" 
            variant="body2" 
            color="text.secondary" 
            sx={{ px: 3, pt: 1, pb: 2 }}
          >
            Comprehensive guide to using ToolVault effectively and accessibly
          </Typography>
          
          <Box sx={{ display: 'flex', minHeight: 400 }}>
            {/* Navigation sidebar */}
            <Box 
              sx={{ 
                width: 280, 
                borderRight: 1, 
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
              component="nav"
              role="navigation"
              aria-label="Help sections"
            >
              <List sx={{ p: 0 }}>
                {helpSections.map((section, index) => (
                  <ListItem
                    key={section.id}
                    component="button"
                    selected={activeSection === section.id}
                    onClick={() => setActiveSection(section.id)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&.Mui-selected': { 
                        bgcolor: 'action.selected',
                        '&:hover': { bgcolor: 'action.selected' },
                      },
                    }}
                    role="tab"
                    aria-selected={activeSection === section.id}
                    aria-controls={`help-panel-${section.id}`}
                    tabIndex={activeSection === section.id ? 0 : -1}
                  >
                    <ListItemIcon sx={{ color: activeSection === section.id ? 'primary.main' : 'inherit' }}>
                      {section.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={section.title}
                      primaryTypographyProps={{
                        color: activeSection === section.id ? 'primary' : 'inherit',
                        fontWeight: activeSection === section.id ? 'medium' : 'normal',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            {/* Content area */}
            <Box 
              sx={{ flex: 1, p: 3, overflow: 'auto' }}
              role="tabpanel"
              id={`help-panel-${activeSection}`}
              aria-labelledby={`help-tab-${activeSection}`}
            >
              {activeContent}
            </Box>
          </Box>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Press F1 or Ctrl+/ to open help anytime
          </Typography>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}