import { Button } from 'react-md';
import Script from 'react-load-script';
import React from 'react';

// Constants
import { SQUARE_APPLICATION_ID } from 'constants/config';

export default class SquareCardForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = { loaded: false },
    this.form = null;
  }

  componentWillUnmount() {
    this.form && this.form.destroy();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.state.loaded && nextState.loaded;
  }

  componentWillUpdate(nextProps, nextState) {
    if (!(!this.state.loaded && nextState.loaded)) return;

    this.form = new SqPaymentForm({
      applicationId: SQUARE_APPLICATION_ID,
      inputClass: 'sq-input',
      inputStyles: [{
        color: '#222',
        fontFamily: 'monospace',
        fontSize: '2em'
      }],
      cardNumber: {
        elementId: 'sq-card-number',
        placeholder: 'Card Number',
      },
      cvv: {
        elementId: 'sq-cvv',
        placeholder: 'CVV',
      },
      expirationDate: {
        elementId: 'sq-expiration-date',
        placeholder: 'Expiration (MM/YY)'
      },
      postalCode: {
        elementId: 'sq-postal-code',
        placeholder: 'Postal Code'
      },
      callbacks: {
        cardNonceResponseReceived: (errors, nonce, cardData) => {
          if (errors && errors.length)
            this.props.onPayError(errors);
          else
            this.props.onPay(nonce, cardData);
        }
      }
    });

    this.form.build();
  }

  onGenerateNonce(e) {
    if (this.state.loaded && this.form) this.form.requestCardNonce();
  }

  render() {
    return (
      <div className='square-card-form'>
        <Script
          onLoad={() => this.setState({ loaded: true })}
          url='https://js.squareup.com/v2/paymentform'
        />

        <div id='sq-card-number' />
        <div id='sq-cvv' />
        <div id='sq-expiration-date' />
        <div id='sq-postal-code' />

        <Button
          raised primary
          iconChildren='payment'
          onClick={() => this.onGenerateNonce()}
        >Pay</Button>
      </div>
    );
  }

}