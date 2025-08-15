import { useState, useRef, useId, cloneElement } from 'react';
import { Tooltip, TooltipProps, Portal } from '@mui/material';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface AccessibleTooltipProps extends Omit<TooltipProps, 'children'> {
  children: React.ReactElement;
  /**
   * Whether to use the tooltip as a description (aria-describedby) 
   * or label (aria-labelledby) for the child element
   */
  role?: 'description' | 'label';
  /**
   * Custom delay before showing tooltip (in ms)
   */
  showDelay?: number;
  /**
   * Custom delay before hiding tooltip (in ms)
   */
  hideDelay?: number;
}

/**
 * Accessible tooltip component with proper ARIA support and reduced motion
 */
export function AccessibleTooltip({ 
  title,
  children, 
  role = 'description',
  showDelay = 500,
  hideDelay = 200,
  placement = 'top',
  arrow = true,
  ...props 
}: AccessibleTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const prefersReducedMotion = useReducedMotion();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleOpen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, showDelay);
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, hideDelay);
  };

  const handleImmediateClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(false);
  };

  // Don't render tooltip if no title is provided
  if (!title) {
    return children;
  }

  // Clone child element to add accessibility attributes
  const childElement = cloneElement(children, {
    ...children.props,
    [role === 'label' ? 'aria-labelledby' : 'aria-describedby']: open ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      handleOpen();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleClose();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleOpen();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleClose();
      children.props.onBlur?.(e);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleImmediateClose();
      }
      children.props.onKeyDown?.(e);
    },
  });

  return (
    <Tooltip
      {...props}
      title={title}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      placement={placement}
      arrow={arrow}
      enterDelay={0} // We handle our own delay
      leaveDelay={0}
      TransitionProps={{
        timeout: prefersReducedMotion ? 0 : 300,
        ...props.TransitionProps,
      }}
      componentsProps={{
        tooltip: {
          id: tooltipId,
          role: 'tooltip',
          ...props.componentsProps?.tooltip,
        },
        popper: {
          'aria-hidden': !open,
          ...props.componentsProps?.popper,
        },
      }}
      slotProps={{
        tooltip: {
          id: tooltipId,
          role: 'tooltip',
          ...props.slotProps?.tooltip,
        },
        popper: {
          'aria-hidden': !open,
          ...props.slotProps?.popper,
        },
      }}
    >
      {childElement}
    </Tooltip>
  );
}

/**
 * Simple tooltip wrapper for common use cases
 */
export interface SimpleTooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: TooltipProps['placement'];
}

export function SimpleTooltip({ content, children, placement = 'top' }: SimpleTooltipProps) {
  return (
    <AccessibleTooltip title={content} placement={placement}>
      {children}
    </AccessibleTooltip>
  );
}

/**
 * Help tooltip component for contextual help
 */
export interface HelpTooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: TooltipProps['placement'];
}

export function HelpTooltip({ content, children, placement = 'top' }: HelpTooltipProps) {
  return (
    <AccessibleTooltip 
      title={`Help: ${content}`} 
      placement={placement}
      role="description"
      showDelay={300}
      hideDelay={100}
    >
      {children}
    </AccessibleTooltip>
  );
}