import { Button } from 'react-md';
import request from 'superagent';
import React from 'react';

export default class PayWithInAppPurchase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      /**
       * The product from the App/Play Store.
       * @type {object}
       */
      product: null
    };

    this._verifyPurchase = this._verifyPurchase.bind(this);
  }

  componentDidMount() {
    const {Pay} = this.props;
    const {iap_id: id, iap_type} = Pay.state.payment.product;

    // Register product
    const type = iap_type[
      window.device.platform == 'Android' ? 'android' : 'apple'
    ];
    window.store.register({ id, type });

    // Update product in state when loaded
    window.store.when(id).updated(() =>
      this.setState({ product: window.store.get(id) })
    );

    // Validates an approved transaction remotely
    window.store.validator = this._verifyPurchase;

    // When user approves purchase, verify their purchase before finished
    window.store.when(id).approved(p => p.verify());

    // Finalize purchase after it is verified with API
    window.store.when(id).verified(p => p.finish());

    // Purchase is entirely complete
    window.store.when(id).finished(() => Pay.onSuccess());

    // Render error messages
    window.store.error(err => Pay.onError(err.message));

    // Load full info for registered product
    window.store.refresh();
  }

  /**
   * @param {object} product
   * @param {function} callback
   */
  _verifyPurchase(product, callback) {
    const {Pay} = this.props;
    const {id} = Pay.state.payment;

    request
      .post(`/api/payments/${id}/iap`)
      .send(product.transaction)
      .end((err, res) => {
        if (err) {
          callback(false, res.body.message);
          Pay.onError(res.body.message);
        }
        else {
          callback(true, '');
        }
      });
  }

  render() {
    const {product} = this.state;

    if (
      !product ||
      !window.store ||
      product.state == window.store.INVALID ||
      product.state == window.store.REGISTERED
    ) return null;

    return (
      <section className='pay-with-iap'>
        <Button
          primary raised
          onClick={() => window.store.order(product.id)}
        >Pay {product.price}</Button>
      </section>
    );
  }

}