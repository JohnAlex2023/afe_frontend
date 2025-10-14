import { createTheme } from '@mui/material/styles';
import { zentriaColors } from './colors';

/**
 * Zentria Enterprise Theme
 * Tema corporativo basado en los colores oficiales de Zentria
 */

const themeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: zentriaColors.violeta.main,
      light: zentriaColors.violeta.light,
      dark: zentriaColors.violeta.dark,
      contrastText: zentriaColors.blanco,
      50: '#F3E5F5',
      100: '#E1BEE7',
    },
    secondary: {
      main: zentriaColors.naranja.main,
      light: zentriaColors.naranja.light,
      dark: zentriaColors.naranja.dark,
      contrastText: zentriaColors.blanco,
    },
    success: {
      main: zentriaColors.verde.main,
      light: zentriaColors.verde.light,
      dark: zentriaColors.verde.dark,
      50: '#E0F7F4',
      100: '#B3EDE5',
    },
    warning: {
      main: zentriaColors.amarillo.main,
      light: zentriaColors.amarillo.light,
      dark: zentriaColors.amarillo.dark,
    },
    error: {
      main: zentriaColors.naranja.main,
      light: zentriaColors.naranja.light,
      dark: zentriaColors.naranja.dark,
    },
    info: {
      main: zentriaColors.verde.light,
      light: '#6EE8D3',
      dark: '#00A085',
    },
    background: {
      default: '#F5F7FA',
      paper: zentriaColors.blanco,
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 500,
          textTransform: 'none',
          letterSpacing: 0.3,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(128, 0, 106, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(128, 0, 106, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          letterSpacing: 0.2,
        },
        outlined: {
          borderWidth: '1.5px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(128, 0, 106, 0.3)',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
};

export const zentriaTheme = createTheme(themeOptions);
