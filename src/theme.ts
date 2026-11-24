import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0b0c0e', paper: '#141619' },
    primary: { main: '#c7f36b', contrastText: '#171a11' },
    text: { primary: '#f3f4ef', secondary: '#969a9c' },
    divider: '#282b2d',
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 650 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10, minHeight: 42 } } },
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
})
