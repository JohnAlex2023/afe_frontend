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
      default: '#FAFAFA',
      paper: zentriaColors.blanco,
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    divider: zentriaColors.cinza,
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
          padding: '8px 24px',
          fontSize: '0.95rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(128, 0, 106, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(128, 0, 106, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
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
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
};

export const zentriaTheme = createTheme(themeOptions);
