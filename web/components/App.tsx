import { MuiThemeProvider, CssBaseline, Button } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { Payment } from 'components/Payment';
import * as React from 'react';
import { theme } from 'constants/theme';
import { hot } from 'react-hot-loader';

const _App = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider
      action={[
        <Button color="primary" size="small">
          Dismiss
        </Button>
      ]}
      maxSnack={2}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Payment />
    </SnackbarProvider>
  </MuiThemeProvider>
);

export const App = hot(module)(_App);
