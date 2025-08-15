import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Backdrop,
  Paper,
  Stack,
  Fade,
  useTheme,
  keyframes,
} from '@mui/material';

// Custom spinning animation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

export interface LoadingSpinnerProps {
  size?: number | string;
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  variant?: 'circular' | 'linear' | 'dots' | 'pulse';
  color?: 'primary' | 'secondary' | 'inherit';
  progress?: number; // 0-100 for determinate progress
  thickness?: number;
  backdrop?: boolean;
  minHeight?: number | string;
  center?: boolean;
}

export function LoadingSpinner({
  size = 40,
  message = 'Loading...',
  submessage,
  fullScreen = false,
  overlay = false,
  variant = 'circular',
  color = 'primary',
  progress,
  thickness,
  backdrop = true,
  minHeight,
  center = true,
}: LoadingSpinnerProps) {
  const theme = useTheme();

  const renderSpinner = () => {
    switch (variant) {
      case 'linear':
        return (
          <LinearProgress
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            value={progress}
            color={color}
            sx={{ width: '100%', mb: 1 }}
          />
        );

      case 'dots':
        return <DotsLoader color={color} />;

      case 'pulse':
        return (
          <Box
            sx={{
              width: size,
              height: size,
              borderRadius: '50%',
              bgcolor: `${color}.main`,
              animation: `${pulse} 1.5s ease-in-out infinite`,
            }}
          />
        );

      default:
        return (
          <CircularProgress
            size={size}
            color={color}
            thickness={thickness}
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            value={progress}
          />
        );
    }
  };

  const content = (
    <Stack
      alignItems="center"
      spacing={2}
      sx={{
        textAlign: 'center',
        ...(minHeight && { minHeight }),
      }}
    >
      {renderSpinner()}
      
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            animation: variant === 'pulse' ? `${pulse} 2s ease-in-out infinite` : 'none',
          }}
        >
          {message}
          {progress !== undefined && ` (${Math.round(progress)}%)`}
        </Typography>
      )}
      
      {submessage && (
        <Typography variant="caption" color="text.disabled">
          {submessage}
        </Typography>
      )}
    </Stack>
  );

  if (fullScreen) {
    return (
      <Backdrop
        open
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: backdrop ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          backdropFilter: backdrop ? 'blur(2px)' : 'none',
        }}
      >
        <Paper
          elevation={backdrop ? 3 : 0}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: backdrop ? 'background.paper' : 'transparent',
            boxShadow: backdrop ? theme.shadows[3] : 'none',
          }}
        >
          {content}
        </Paper>
      </Backdrop>
    );
  }

  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(1px)',
          zIndex: 1,
          borderRadius: 'inherit',
        }}
      >
        {content}
      </Box>
    );
  }

  if (center) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(minHeight && { minHeight }),
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

// Dots loader component
interface DotsLoaderProps {
  color?: 'primary' | 'secondary' | 'inherit';
  size?: number;
}

function DotsLoader({ color = 'primary', size = 8 }: DotsLoaderProps) {
  const theme = useTheme();
  
  const dotColor = color === 'inherit' 
    ? 'currentColor' 
    : theme.palette[color].main;

  const bounce = keyframes`
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  `;

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            bgcolor: dotColor,
            animation: `${bounce} 1.4s ease-in-out infinite both`,
            animationDelay: `${index * 0.16}s`,
          }}
        />
      ))}
    </Box>
  );
}

// Inline loader for buttons and small spaces
export interface InlineLoaderProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
  message?: string;
}

export function InlineLoader({ size = 20, color = 'inherit', message }: InlineLoaderProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Stack>
  );
}

// Page loader with fade transition
export interface PageLoaderProps extends Omit<LoadingSpinnerProps, 'fullScreen'> {
  show?: boolean;
  delay?: number;
}

export function PageLoader({ 
  show = true, 
  delay = 200,
  minHeight = '50vh',
  ...props 
}: PageLoaderProps) {
  const [shouldShow, setShouldShow] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setShouldShow(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [show, delay]);

  return (
    <Fade in={shouldShow} timeout={300}>
      <Box sx={{ width: '100%' }}>
        <LoadingSpinner
          center
          minHeight={minHeight}
          {...props}
        />
      </Box>
    </Fade>
  );
}

// Progress loader with steps
export interface ProgressLoaderProps {
  steps: string[];
  currentStep: number;
  progress?: number;
  error?: string;
}

export function ProgressLoader({ 
  steps, 
  currentStep, 
  progress,
  error 
}: ProgressLoaderProps) {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <LinearProgress
        variant={progress !== undefined ? 'determinate' : 'indeterminate'}
        value={progress}
        sx={{ mb: 2 }}
        color={error ? 'error' : 'primary'}
      />
      
      <Stack spacing={1}>
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              opacity: index <= currentStep ? 1 : 0.5,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index < currentStep 
                  ? 'success.main' 
                  : index === currentStep 
                    ? error ? 'error.main' : 'primary.main'
                    : 'grey.300',
                animation: index === currentStep && !error 
                  ? `${pulse} 1s ease-in-out infinite` 
                  : 'none',
              }}
            />
            <Typography
              variant="body2"
              color={
                index < currentStep 
                  ? 'success.main'
                  : index === currentStep
                    ? error ? 'error.main' : 'text.primary'
                    : 'text.secondary'
              }
            >
              {step}
            </Typography>
          </Box>
        ))}
      </Stack>
      
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

// HOC for adding loading state to components
export function withLoader<P extends object>(
  Component: React.ComponentType<P>,
  loaderProps?: Partial<LoadingSpinnerProps>
) {
  return function LoaderWrappedComponent(
    props: P & { loading?: boolean; loaderProps?: Partial<LoadingSpinnerProps> }
  ) {
    const { loading = false, loaderProps: propLoaderProps, ...componentProps } = props;
    
    if (loading) {
      return (
        <LoadingSpinner
          center
          minHeight="200px"
          {...loaderProps}
          {...propLoaderProps}
        />
      );
    }
    
    return <Component {...(componentProps as P)} />;
  };
}