import { useState, forwardRef } from 'react';
import { Button, CircularProgress, ButtonProps } from '@mui/material';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface InteractiveButtonProps extends Omit<ButtonProps, 'loading'> {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Interactive button with accessibility features and reduced motion support
 */
export const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ children, onClick, loading = false, loadingText, disabled, sx, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const handleMouseDown = () => {
      if (!loading && !disabled) {
        setIsPressed(true);
      }
    };

    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsPressed(false);

    const isDisabled = loading || disabled;
    const buttonText = loading && loadingText ? loadingText : children;

    return (
      <Button
        {...props}
        ref={ref}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-describedby={loading ? 'button-loading-status' : undefined}
        sx={{
          transform: !prefersReducedMotion && isPressed ? 'scale(0.98)' : 'scale(1)',
          transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 44, // WCAG minimum touch target size
          minWidth: 44,
          '&:hover': {
            transform: prefersReducedMotion ? 'none' : !isPressed ? 'scale(1.02)' : 'scale(0.98)',
          },
          '&:focus': {
            outline: '2px solid',
            outlineOffset: '2px',
            outlineColor: 'primary.main',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineOffset: '2px',
            outlineColor: 'primary.main',
          },
          '&:disabled': {
            opacity: 0.6,
            cursor: 'not-allowed',
          },
          ...sx,
        }}
      >
        {loading && (
          <>
            <CircularProgress 
              size={20} 
              sx={{ 
                position: 'absolute',
                color: 'inherit',
                left: '50%',
                top: '50%',
                marginLeft: '-10px',
                marginTop: '-10px',
              }}
              aria-hidden="true"
            />
            <span 
              id="button-loading-status" 
              className="sr-only"
              role="status" 
              aria-live="polite"
            >
              {loadingText || 'Loading...'}
            </span>
          </>
        )}
        <span style={{ opacity: loading ? 0 : 1 }} aria-hidden={loading}>
          {buttonText}
        </span>
      </Button>
    );
  }
);

InteractiveButton.displayName = 'InteractiveButton';