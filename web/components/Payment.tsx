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

declare class SqPaymentForm {
  constructor(options: any);
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
  footer: {
    maxWidth: '20em',
    padding: '1em',
    margin: '0 auto'
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
      this.form = new SqPaymentForm({
        cvv: {
          elementId: 'sq-cvv',
          placeholder: 'CVV'
        },
        callbacks: {
          cardNonceResponseReceived: (
            errors: undefined | string[],
            nonce: string,
            cardData: any
          ) => {
            if (errors && errors.length) {
              for (let error of errors) this.props.enqueueSnackbar(error);
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
        inputStyles: [
          {
            color: '#222',
            fontFamily: 'monospace',
            fontSize: '2em'
          }
        ],
        applicationId: SQUARE_APPLICATION_ID,
        expirationDate: {
          elementId: 'sq-expiration-date',
          placeholder: 'Expiration (MM/YY)'
        }
      });
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
          <div>
            <input type="text" placeholder="Country (US/UK/CA/etc)" />
            <input type="text" placeholder="Address" />
            <div id="sq-postal-code" />
            <div id="sq-card-number" />
            <div id="sq-cvv" />
            <div id="sq-expiration-date" />
            <Button
              onClick={() => this.onPayWithSquare()}
              variant="contained"
              color="primary"
            >
              Pay
            </Button>
          </div>
        ) : (
          <div>
            <Typography variant="h1">Pay With...</Typography>
            {payment.methods.indexOf('square') > -1 ? (
              <Button
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
                Cryptocurrency
              </Button>
            ) : null}
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
