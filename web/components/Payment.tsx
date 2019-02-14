import { NAME, APP_PAYMENT_URL, SQUARE_APPLICATION_ID } from 'constants/config';
import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { RichCow } from 'types/rich-cow';
import * as React from 'react';
import { api } from 'lib/api';
import {
  createStyles,
  withStyles,
  Typography,
  WithStyles,
  Button
} from '@material-ui/core';

interface SqPaymentForm {
  constructor(options: any): SqPaymentForm;
  requestCardNonce(): void;
  build(): void;
}

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
  input: {
    color: '#222',
    fontFamily: 'monospace',
    fontSize: '2em'
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
  },
  payButton: {
    marginTop: '1em'
  }
});

interface PaymentState extends Partial<RichCow.GetPaymentResponse> {
  loading: boolean;
  square: boolean;
}

class _Payment extends React.Component<
  WithStyles<typeof styles> & InjectedNotistackProps,
  PaymentState
> {
  state: PaymentState = { loading: true, square: false };
  form: SqPaymentForm;

  componentDidMount() {
    const jwt = location.search.split('?jwt=')[1];
    api
      .get('/payment', { params: { jwt } })
      .then(res => this.setState({ ...res.data, loading: false }))
      .catch(() => location.replace(APP_PAYMENT_URL.replace('{{JWT}}', jwt)));
  }

  componentDidUpdate(prevProps, prevState: PaymentState) {
    if (!prevState.square && this.state.square) {
      this.form = new window['SqPaymentForm']({
        cvv: {
          elementId: 'sq-cvv',
          placeholder: 'CVV'
        },
        callbacks: {
          cardNonceResponseReceived: (
            errors: undefined | { message: string }[],
            nonce: string,
            cardData: any
          ) => {
            console.log(arguments);
            if (errors && errors.length) {
              for (let error of errors)
                this.props.enqueueSnackbar(error.message);
            } else {
              api.post('/payment/square', { nonce, ...cardData });
            }
          }
        },
        cardNumber: {
          elementId: 'sq-card-number',
          placeholder: 'Card Number'
        },
        postalCode: {
          elementId: 'sq-postal-code',
          placeholder: 'Postal Code'
        },
        inputClass: 'sq-input',
        inputStyles: [styles.input],
        applicationId: SQUARE_APPLICATION_ID,
        expirationDate: {
          elementId: 'sq-expires',
          placeholder: 'Expires'
        }
      });
      this.form.build();
    }
  }

  onPayWithCoinbaseCommerce() {}

  onPayWithSquare() {
    if (this.state.square) return this.form.requestCardNonce();

    const script = document.createElement('script');
    script.onload = () => this.setState({ square: true });
    script.src = 'https://js.squareup.com/v2/paymentform';
    document.head.appendChild(script);
  }

  render() {
    const { payment, loading, square, jwt } = this.state;
    const { classes } = this.props;
    if (loading) return null;
    return (
      <main className={classes.main}>
        {square ? (
          <div className={classes.form}>
            <div id="sq-card-number" />
            <div id="sq-cvv" />
            <div id="sq-expires" />
            <div id="sq-postal-code" />
            <Button
              className={classes.payButton}
              onClick={() => this.onPayWithSquare()}
              variant="contained"
              color="primary"
            >
              Pay ${payment.amount / 100} USD
            </Button>
          </div>
        ) : (
          <div className={classes.form}>
            <Typography variant="h1" className={classes.title}>
              ${payment.amount / 100} USD
            </Typography>

            <div className={classes.buttons}>
              {payment.methods.indexOf('square') > -1 ? (
                <Button
                  className={classes.ccButton}
                  onClick={() => this.onPayWithSquare()}
                  variant="contained"
                  color="primary"
                >
                  Credit Card
                </Button>
              ) : null}
              {payment.methods.indexOf('coinbase-commerce') > -1 ? (
                <Button
                  onClick={() => this.onPayWithCoinbaseCommerce()}
                  variant="contained"
                  color="secondary"
                >
                  BTC / Other
                </Button>
              ) : null}
            </div>
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
