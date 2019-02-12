import request from 'superagent';
import React from 'react';

export default class PayWithCoinbase extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {Pay} = this.props;
    const {id} = Pay.state.payment;

    if (Pay.state.q.method == 'coinbase') return;

    request
      .post(`/api/payments/${id}/coinbase`)
      .end((err, res) => {
        if (err) return Pay.onError(res.body.message);

        this.setState({ code: res.body.code });
        location.replace(res.body.url);
      });
  }

  async componentDidMount() {
    const {Pay} = this.props;

    if (Pay.state.q.method != 'coinbase') return;

    await this._checkIfPaid();
    this.interval = setInterval(() => this._checkIfPaid(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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
    return null;
  }

}