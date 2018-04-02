import { SelectField } from 'react-md';
import { render } from 'react-dom';
import request from 'superagent';
import React from 'react';

// Constants
import STATUS from 'constants/status';

// Components
import PayWithSquare from 'components/pay/Square';

class Embed extends React.Component {

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
      errors: []
    };
  }

  componentWillMount() {
    const match = location.search.match(/payment_id=(\d+)/);

    request.get(`/api/payments/${+match[1]}`).end((err, res) => {
      if (err) return this._communicate(STATUS.ERROR, err);

      /** @type {string} */
      const method = res.body.methods[0];

      res.body.methods = res.body.methods.map(m => {
        switch (m) {
          case 'card':
          case 'square':
            return { label: 'Credit Card', value: 'square' };
          case 'crypto':
            return { label: 'Cryptocurrency', value: 'crypto' };
          case 'swift':
            return { label: 'SwiftDemand', value: 'swift' };
          case 'inapp':
            return { label: 'In-App Purchase', value: 'inapp' };
          default:
            return null;
        }
      });

      this.setState({ payment: res.body, method });
    });
  }

  /** @param {string|string[]} */
  onError(error) {
    this.setState({ errors: Array.isArray(error) ? error : [error] });
  }

  onSuccess() {
    this.setState({ errors: [] });
    this._communicate(0);
  }

  /**
   * @param {number} status
   * @param {object} data
   */
  _communicate(status, data) {
    console.log('_communicate()', status, data);
    window.parent.postMessage({ xyPayments: true, status, data }, '*');
  }

  render() {
    const {payment, method, errors} = this.state;

    if (!payment) return null;

    const form = (() => {
      switch (method) {
        case 'square': return <PayWithSquare Embed={this} />
        default: return null
      }
    })();

    return (
      <div className='embed-entry'>
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

render(<Embed />, document.getElementById('content'));