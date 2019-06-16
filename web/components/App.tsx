import { MuiThemeProvider, CssBaseline, Button } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { Payment } from 'components/Payment';
import { CCashCow } from 'types/ccashcow';
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
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider
      maxSnack={2}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Payment />
    </SnackbarProvider>
  </MuiThemeProvider>
);

export const App = hot(module)(_App);
