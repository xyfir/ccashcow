import 'babel-polyfill';

import { SelectField } from 'react-md';
import QueryString from 'query-string';
import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';

// Constants
import STATUS from 'constants/status';

// Components
import PayWithCoinPayments from 'components/pay/CoinPayments';
import PayWithSwiftDemand from 'components/pay/SwiftDemand';
import PayWithSquare from 'components/pay/Square';

class Pay extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      /**
       * The shortened payment object from the API
       * @type {object}
       */
      payment: null,
      /**
       * The selected payment method to use
       * @type {string}
       */
      method: null,
      /** @type {string[]} */
      errors: [],
      /**
       * Parsed `location.search`
       * @type {object}
       */
      q: null
    };
  }

  componentWillMount() {
    const q = QueryString.parse(location.search);

    request.get(`/api/payments/${q.payment_id}`).end(async (err, res) => {
      if (err) return history.back();

      res.body.methods = res.body.methods.map(m => {
        switch (m) {
          case 'card':
          case 'square':
            return { label: 'Credit Card', value: 'square' };
          case 'crypto':
          case 'coinpayments':
            return { label: 'Cryptocurrency', value: 'coinpayments' };
          case 'swiftdemand':
            return { label: 'SwiftDemand', value: 'swiftdemand' };
          case 'iap':
            return { label: 'In-App Purchase', value: 'iap' };
          default:
            return null;
        }
      });

      // Wait for Cordova API to be available if they're needed
      // Seller should not have supplied IAP as a method if not available
      if (res.body.methods.findIndex(m => m.value == 'iap') > -1) {
        await new Promise(resolve => {
          const interval = setInterval(() => {
            if (window.cordova) {
              clearInterval(interval);
              resolve();
            }
          }, 150);
        });
      }

      this.setState({
        q,
        method: q.method || res.body.methods[0].value,
        payment: res.body
      });
    });
  }

  /** @param {string|string[]} */
  onError(error) {
    this.setState({ errors: Array.isArray(error) ? error : [error] });
  }

  onSuccess() {
    this.setState({ errors: [] });
    location.replace(this.state.payment.redirect_url);
  }

  render() {
    const {payment, method, errors} = this.state;

    if (!payment) return null;

    const form = (() => {
      switch (method) {
        case 'coinpayments': return <PayWithCoinPayments Pay={this} />
        case 'swiftdemand': return <PayWithSwiftDemand Pay={this} />
        case 'square': return <PayWithSquare Pay={this} />
        default: return null
      }
    })();

    return (
      <div className='pay-entry'>
        {payment.methods.length > 1 ? (
          <header className='method-selector'>
            <label>Payment Method</label>
            <SelectField
              id='payment-method'
              value={method}
              onChange={v => this.setState({ method: v })}
              menuItems={payment.methods}
              className='md-cell'
            />
          </header>
        ) : null}

        {errors.length ? (<ul className='errors'>{
          errors.map((e, i) => <li key={i}>{e}</li>)
        }</ul>) : null}

        {form}
      </div>
    )
  }

}

render(<Pay />, document.getElementById('content'));