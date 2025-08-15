import { IconButton } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { AccessibleTooltip } from '../common/AccessibleTooltip';

export interface ContextualHelpProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  size?: 'small' | 'medium' | 'large';
  'aria-label'?: string;
}

/**
 * Contextual help component that provides tooltips with help information
 * for specific UI elements or sections
 */
export function ContextualHelp({ 
  content, 
  placement = 'top',
  size = 'small',
  'aria-label': ariaLabel,
}: ContextualHelpProps) {
  return (
    <AccessibleTooltip 
      title={content} 
      placement={placement}
      role="description"
      showDelay={300}
      hideDelay={100}
    >
      <IconButton
        size={size}
        aria-label={ariaLabel || 'Help information'}
        sx={{ 
          ml: 0.5,
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }}
      >
        <HelpOutline fontSize={size === 'large' ? 'medium' : 'small'} />
      </IconButton>
    </AccessibleTooltip>
  );
}

/**
 * Pre-configured contextual help for common UI patterns
 */
export const HelpContent = {
  search: "Use keywords to find tools. Search looks through tool names, descriptions, and categories.",
  filters: "Apply filters to narrow down results. Multiple filters work together to refine your search.",
  sorting: "Change how results are ordered. Click the direction button to reverse the sort order.",
  viewMode: "Switch between grid and list layouts. Grid shows more visual information, list is more compact.",
  virtualization: "Enable for large datasets. Improves performance by only rendering visible items.",
  accessibility: "This application supports keyboard navigation and screen readers. Press F1 for help.",
  tags: "Tags represent tool capabilities or technologies. Select multiple tags to find tools with specific features.",
  category: "Categories group similar types of analysis tools. Filter by category to focus on specific tool types.",
} as const;

/**
 * Common contextual help components for frequent use cases
 */
export function SearchHelp() {
  return (
    <ContextualHelp
      content={HelpContent.search}
      aria-label="Search help"
      placement="bottom"
    />
  );
}

export function FiltersHelp() {
  return (
    <ContextualHelp
      content={HelpContent.filters}
      aria-label="Filters help"
      placement="bottom"
    />
  );
}

export function SortingHelp() {
  return (
    <ContextualHelp
      content={HelpContent.sorting}
      aria-label="Sorting help"
      placement="bottom"
    />
  );
}

export function ViewModeHelp() {
  return (
    <ContextualHelp
      content={HelpContent.viewMode}
      aria-label="View mode help"
      placement="bottom"
    />
  );
}

export function VirtualizationHelp() {
  return (
    <ContextualHelp
      content={HelpContent.virtualization}
      aria-label="Virtualization help"
      placement="bottom"
    />
  );
}

export function AccessibilityHelp() {
  return (
    <ContextualHelp
      content={HelpContent.accessibility}
      aria-label="Accessibility help"
      placement="bottom"
    />
  );
}

export function TagsHelp() {
  return (
    <ContextualHelp
      content={HelpContent.tags}
      aria-label="Tags help"
      placement="bottom"
    />
  );
}

export function CategoryHelp() {
  return (
    <ContextualHelp
      content={HelpContent.category}
      aria-label="Category help"
      placement="bottom"
    />
  );
}