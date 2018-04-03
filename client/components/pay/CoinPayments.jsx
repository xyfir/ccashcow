import { Button, TextField } from 'react-md';
import request from 'superagent';
import React from 'react';

export default class PayWithCoinPayments extends React.Component {

  constructor(props) {
    super(props);

    this.state = { view: 'pick', tx: null };
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  /** @param {string} currency */
  onPay(currency) {
    const {Embed} = this.props;
    const {id} = Embed.state.payment;

    request
      .post(`/api/payments/${id}/coinpayments`)
      .send({ currency })
      .end((err, res) => {
        if (err) return Embed.onError(res.body.message);

        this.setState({ tx: res.body, view: currency });

        this.interval = setInterval(() => request
          .get(`/api/payments/${id}`)
          .end((err, res) => {
            console.log(err, res.body);
            if (!err && res.body.paid !== null) Embed.onSuccess();
          }),
          30 * 1000
        );
      });
  }

  render() {
    const {view, tx} = this.state;

    return (
      <section className='pay-with-coinpayments'>{
        view != 'pick' && tx ? (
          <div className='view-currency'>
            <header>
              <Button
                icon
                onClick={() => this.setState({ view: 'pick' })}
                iconChildren='arrow_back'
              />
              <p>
                Your transaction must receive <strong>{
                  tx.confirms_needed
                }</strong> confirmations by <strong>{
                  (new Date(Date.now() + (tx.timeout * 1000))).toLocaleString()
                }</strong>.
              </p>
            </header>

            <TextField
              id='amount'
              type='number'
              value={tx.amount}
              helpText='Amount to send'
            />
            <TextField
              id='address'
              type='text'
              value={tx.address}
              helpText='Address to send amount to'
            />

            <img src={tx.qrcode_url} />
          </div>
        ) : (
          <div className='pick-currency'>
            <Button raised onClick={() => this.onPay('BTC')}>BTC</Button>
            <Button raised onClick={() => this.onPay('LTC')}>LTC</Button>
            <Button raised onClick={() => this.onPay('BCH')}>BCH</Button>
            <Button raised onClick={() => this.onPay('ETH')}>ETH</Button>
          </div>
        )
      }
      </section>
    );
  }

}