import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import { CCashCow } from 'types/ccashcow';
import { Payment } from 'components/Payment';
import * as React from 'react';
import { theme } from 'lib/theme';
import { hot } from 'react-hot-loader';

declare global {
  namespace NodeJS {
    interface Process {
      enve: CCashCow.Env.Web;
    }
  }
}

const _App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider
      maxSnack={2}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Payment />
    </SnackbarProvider>
  </ThemeProvider>
);

export const App = hot(module)(_App);
