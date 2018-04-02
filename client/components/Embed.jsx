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
      /** @type {string[]} */
      errors: []
    };
  }

  componentWillMount() {
    const match = location.search.match(/payment_id=(\d+)/);

    request.get(`/api/payments/${+match[1]}`).end((err, res) => {
      if (err) return this._communicate(STATUS.ERROR, err);
      this.setState({ payment: res.body });
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
    const {payment, errors} = this.state;

    if (!payment) return null;

    return (
      <div className='embed-entry'>
        {errors.length ? (<ul className='errors'>{
          errors.map((e, i) => <li key={i}>{e}</li>)
        }</ul>) : null}

        <PayWithSquare Embed={this} />
      </div>
    )
  }

}

render(<Embed />, document.getElementById('content'));