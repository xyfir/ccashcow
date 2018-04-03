import { Button, TextField } from 'react-md';
import request from 'superagent';
import React from 'react';

export default class PayWithSwiftDemand extends React.Component {

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const {Pay} = this.props;

    if (Pay.state.q.method != 'swift') return;

    await this._checkIfPaid();
    this.interval = setInterval(() => this._checkIfPaid(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onPay() {
    const {Pay} = this.props;
    const {id} = Pay.state.payment;

    request
      .post(`/api/payments/${id}/swiftdemand`)
      .send({
        swiftId: this._SwiftID.value
      })
      .end((err, res) => {
        if (err) return Pay.onError(res.body.message);
        location.replace(res.body.url);
      });
  }

  async _checkIfPaid() {
    const {Pay} = this.props;

    try {
      const res = await request.get(`/api/payments/${Pay.state.payment.id}`);
      if (res.body.paid !== null) Pay.onSuccess();
    }
    catch (err) {
      return;
    }
  }

  render() {
    return (
      <section className='pay-with-swiftdemand'>
        <TextField
          id='swift-id'
          ref={i => this._SwiftID = i}
          type='text'
          placeholder='Your SwiftDemand #ID'
        />

        <Button
          primary raised
          onClick={() => this.onPay()}
        >
          Pay {this.props.Pay.state.payment.product.amount_swifts} SFT
        </Button>
      </section>
    );
  }

}