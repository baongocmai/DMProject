import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#B84C63',
      light: '#c66d81',
      dark: '#8c3a4b',
      contrastText: '#fff',
    },
    background: {
      default: '#B84C63',
      paper: '#fff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#B84C63',
          boxShadow: '0 4px 12px rgba(184,76,99,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme; 