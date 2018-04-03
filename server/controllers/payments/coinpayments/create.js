const getPayment = require('lib/payments/get');
const request = require('superagent');
const CONFIG = require('constants/config');
const MySQL = require('lib/MySQL');

/**
 * `POST /api/payments/:payment/coinpayments`
 * @param {object} req
 * @param {object} req.params
 * @param {number} req.params.payment
 * @param {object} req.body
 * @param {string} req.body.currency
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 * @prop {number} [amount]
 * @prop {string} [address]
 * @prop {string} [qrcode_url]
 * @prop {string} [status_url]
 * @prop {string} [txn_id]
 * @prop {number} [confirms_needed]
 * @prop {number} [timeout]
 */
module.exports = async function(req, res) {

  const paymentId = req.params.payment;
  const db = new MySQL;

  try {
    const payment = await getPayment(db, { paymentId, full: true });
    db.release();

    if (payment.paid !== null) throw 'Payment has already been paid';

    const tx = await request
      .post('https://www.coinpayments.net/api.php')
      .send({
        buyer_email: payment.email,
        currency1: 'USD',
        currency2: req.body.currency,
        ipn_url: `${CONFIG.URL}/api/payments/${paymentId}/coinpayments/complete`,
        version: 1,
        amount: payment.product.amount_cents / 100,
        key: CONFIG.COINPAYMENTS.PUBLIC_KEY,
        cmd: 'create_transaction'
      });

    if (tx.body.error != 'ok') throw tx.body.error;

    res.status(200).json(tx.body.result);
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }

}