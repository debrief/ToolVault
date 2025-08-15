import { createTheme, Theme, PaletteMode } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'high-contrast';

/**
 * WCAG AA color contrast ratios:
 * - Normal text: 4.5:1
 * - Large text (18pt+ or 14pt+ bold): 3:1
 * - Non-text (UI components): 3:1
 */
const colorContrastRatios = {
  normal: 4.5,
  large: 3.0,
  nonText: 3.0,
};

/**
 * High contrast color palette for accessibility
 */
const highContrastPalette = {
  primary: {
    main: '#ffffff',
    light: '#ffffff',
    dark: '#cccccc',
    contrastText: '#000000',
  },
  secondary: {
    main: '#ffff00',
    light: '#ffff33',
    dark: '#cccc00',
    contrastText: '#000000',
  },
  background: {
    default: '#000000',
    paper: '#1a1a1a',
  },
  text: {
    primary: '#ffffff',
    secondary: '#ffff00',
  },
  error: {
    main: '#ff6b6b',
    light: '#ff8a80',
    dark: '#e57373',
    contrastText: '#000000',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000',
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
    contrastText: '#000000',
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#000000',
  },
  divider: '#444444',
};

/**
 * Enhanced dark theme with better contrast
 */
const darkPalette = {
  primary: {
    main: '#90caf9',
    light: '#bbdefb',
    dark: '#42a5f5',
  },
  secondary: {
    main: '#f48fb1',
    light: '#f8bbd9',
    dark: '#e91e63',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
};

/**
 * Enhanced light theme with better contrast
 */
const lightPalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    main: '#dc004e',
    light: '#e33371',
    dark: '#9a0036',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
  },
};

/**
 * Create accessible theme based on mode
 */
export function createAccessibleTheme(mode: ThemeMode): Theme {
  const paletteMode: PaletteMode = mode === 'high-contrast' ? 'dark' : mode;
  
  const palette = mode === 'high-contrast' 
    ? highContrastPalette 
    : mode === 'dark' 
      ? darkPalette 
      : lightPalette;

  const baseTheme = createTheme({
    palette: {
      mode: paletteMode,
      ...palette,
    },
    typography: {
      // Ensure minimum 16px font size for accessibility
      htmlFontSize: 16,
      fontSize: 14,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      body1: { 
        fontSize: '1rem', 
        lineHeight: 1.6,
        fontWeight: 400,
      },
      body2: { 
        fontSize: '0.875rem', 
        lineHeight: 1.6,
        fontWeight: 400,
      },
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none', // More accessible than all caps
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 8,
    },
    components: {
      // Button accessibility enhancements
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 44, // Minimum touch target size (WCAG AA)
            minWidth: 44,
            '&:focus': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
            '&:focus:not(:focus-visible)': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
          },
        },
      },
      
      // Card accessibility enhancements
      MuiCard: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
            '&:focus:not(:focus-visible)': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
          },
        },
      },
      
      // TextField accessibility enhancements
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:focus-within': {
                outline: '2px solid',
                outlineOffset: '2px',
                outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
              },
            },
          },
        },
      },
      
      // IconButton accessibility enhancements
      MuiIconButton: {
        styleOverrides: {
          root: {
            minHeight: 44, // Minimum touch target size
            minWidth: 44,
            '&:focus': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
            '&:focus:not(:focus-visible)': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
          },
        },
      },
      
      // Chip accessibility enhancements
      MuiChip: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
            '&.MuiChip-clickable:focus': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
          },
        },
      },
      
      // Link accessibility enhancements
      MuiLink: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
            '&:focus:not(:focus-visible)': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
          },
        },
      },
      
      // Menu accessibility enhancements
      MuiMenuItem: {
        styleOverrides: {
          root: {
            minHeight: 44, // Minimum touch target size
            '&:focus': {
              outline: '2px solid',
              outlineOffset: '-2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
          },
        },
      },
      
      // Tab accessibility enhancements
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 44,
            '&:focus': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
            '&:focus:not(:focus-visible)': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineOffset: '2px',
              outlineColor: mode === 'high-contrast' ? '#ffff00' : palette.primary?.main || '#1976d2',
            },
          },
        },
      },
    },
  });

  return baseTheme;
}

/**
 * Get theme mode from system preferences and user settings
 */
export function getPreferredThemeMode(): ThemeMode {
  // Check for high contrast preference first
  if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
    return 'high-contrast';
  }
  
  // Check for dark mode preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // Default to light mode
  return 'light';
}

/**
 * Hook for detecting system theme preferences
 */
export function useSystemThemePreference() {
  const getPreference = () => getPreferredThemeMode();
  
  return {
    getPreference,
    isHighContrastSupported: () => window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches,
    isDarkModeSupported: () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
  };
}

/**
 * Accessibility helper to check color contrast
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  // This is a simplified contrast check
  // In a real implementation, you would use a proper color contrast library
  const luminance = (color: string) => {
    // Simplified luminance calculation
    const rgb = parseInt(color.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7.0,
  };
}