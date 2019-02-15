import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { NAME, APP_PAYMENT_URL } from 'constants/config';
import { RichCow } from 'types/rich-cow';
import * as React from 'react';
import { parse } from 'qs';
import { api } from 'lib/api';
import {
  createStyles,
  withStyles,
  Typography,
  WithStyles,
  Button
} from '@material-ui/core';

const styles = createStyles({
  main: {
    flexDirection: 'column',
    fontFamily: 'Roboto',
    display: 'flex',
    height: '100vh'
  },
  form: {
    maxWidth: '21em',
    padding: '1em',
    margin: '0.5em auto'
  },
  title: {
    fontSize: '300%'
  },
  footer: {
    maxWidth: '20em',
    padding: '1em',
    margin: '0 auto'
  },
  buttons: {
    marginTop: '2em'
  },
  ccButton: {
    marginRight: '0.5em'
  }
});

interface PaymentState {
  payment?: RichCow.Payment;
  loading: boolean;
  jwt?: string;
}

class _Payment extends React.Component<
  WithStyles<typeof styles> & InjectedNotistackProps,
  PaymentState
> {
  interval?: NodeJS.Timer;
  state: PaymentState = { loading: true };

  componentDidMount() {
    const { jwt }: { jwt?: string } = parse(location.search.substr(1));
    api
      .get('/payment', { params: { jwt } })
      .then(res => {
        const payment: RichCow.Payment = res.data;
        this.setState({ payment, loading: false, jwt });
        if (payment.paid) throw 'Payment already paid';
        if (payment.method) this.waitForPayment();
      })
      .catch(() => location.replace(APP_PAYMENT_URL.replace('{{JWT}}', jwt)));
  }

  onPay(method: RichCow.PaymentMethod) {
    api
      .post(`/payment/${method}/start`, { paymentId: this.state.payment.id })
      .then(res => location.replace(res.data.url))
      .catch(err => this.props.enqueueSnackbar(err.response.data.error));
  }

  waitForPayment() {
    const { method } = this.state.payment;
    this.interval = setInterval(
      () =>
        api
          .post(`/payment/${method}/finish`, parse(location.search.substr(1)))
          .then(res =>
            location.replace(APP_PAYMENT_URL.replace('{{JWT}}', res.data.jwt))
          )
          .catch(err => console.warn('waitForPayment()', err)),
      5000
    );
  }

  render() {
    const { payment, loading, jwt } = this.state;
    const { classes } = this.props;
    if (loading) return null;
    return (
      <main className={classes.main}>
        {payment.method === undefined ? (
          <div className={classes.form}>
            <Typography variant="h1" className={classes.title}>
              ${payment.amount / 100} USD
            </Typography>

            <div className={classes.buttons}>
              {payment.methods.indexOf('square') > -1 ? (
                <Button
                  className={classes.ccButton}
                  onClick={() => this.onPay('square')}
                  variant="contained"
                  color="primary"
                >
                  Credit Card
                </Button>
              ) : null}
              {payment.methods.indexOf('coinbase-commerce') > -1 ? (
                <Button
                  onClick={() => this.onPay('coinbase-commerce')}
                  variant="contained"
                  color="secondary"
                >
                  BTC / Other
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={classes.form}>
            <Typography>
              Please wait while your payment is confirmed. Do not navigate away
              from this page unless your payment failed or cancelled.
            </Typography>
          </div>
        )}
        <footer className={classes.footer}>
          <Button
            href={APP_PAYMENT_URL.replace('{{JWT}}', jwt)}
            color="secondary"
          >
            Back to {NAME}
          </Button>
        </footer>
      </main>
    );
  }
}

export const Payment = withSnackbar(withStyles(styles)(_Payment));
