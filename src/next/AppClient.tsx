'use client';

import { ThemeProvider, createTheme } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/zh-cn';
import App from '@/App';

const theme = createTheme({
  palette: {
    primary: {
      main: '#005f8f',
    },
    error: {
      main: '#b42318',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export const AppClient = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
      <App />
    </LocalizationProvider>
  </ThemeProvider>
);
