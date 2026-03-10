import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export function useThemeMode() {
  return useContext(ThemeContext);
}

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#2e7d32', light: '#60ad5e', dark: '#005005' },
          secondary: { main: '#00897b', light: '#4ebaaa', dark: '#005b4f' },
          background: { default: '#f5f7f5', paper: '#ffffff' },
          success: { main: '#43a047' },
          warning: { main: '#f9a825' },
          error: { main: '#e53935' },
          info: { main: '#1565c0' },
        }
      : {
          primary: { main: '#66bb6a', light: '#98ee99', dark: '#338a3e' },
          secondary: { main: '#4db6ac', light: '#82e9de', dark: '#00867d' },
          background: { default: '#121212', paper: '#1e1e1e' },
          success: { main: '#66bb6a' },
          warning: { main: '#fdd835' },
          error: { main: '#ef5350' },
          info: { main: '#42a5f5' },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light'
            ? '0 2px 12px rgba(0,0,0,0.08)'
            : '0 2px 12px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: mode === 'light' ? '#e8f5e9' : '#1b5e20',
          },
        },
      },
    },
  },
});

export default function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved) setMode(saved);
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
