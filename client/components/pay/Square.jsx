import React from 'react';

// Constants
import { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID } from 'constants/config';

// Components
import CardForm from 'components/pay/SquareCardForm';

export default class PayWithSquare extends React.Component {

  constructor(props) {
    super(props);
  }

  /**
   * @param {string} nonce
   * @param {object} card
   */
  onPay(nonce, card) {
    console.log('nonce', nonce, 'card', card);
  }

  /** @param {SquareError[]} e */
  /**
   * @typedef {object} SquareError
   * @prop {string} type
   * @prop {string} message
   * @prop {string} field
   */
  onPayError(e) {
    console.error(e);
  }

  render() {
    return (
      <section className='pay-with-square'>
        <CardForm
          onPay={(n, c) => this.onPay(n, c)}
          onPayError={e => this.onPayError(e)}
        />
      </section>
    );
  }

}