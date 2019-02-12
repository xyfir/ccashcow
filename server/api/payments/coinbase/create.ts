const getPayment = require('lib/payments/get');
const request = require('superagent');
const CONFIG = require('constants/config');
const MySQL = require('lib/MySQL');

/**
 * `POST /api/payments/:payment/coinbase`
 * @param {object} req
 * @param {object} req.params
 * @param {number} req.params.payment
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 * @prop {string} [url]
 */
export async function api_createCoinbasePayment(req, res) {
  const paymentId = req.params.payment;
  const db = new MySQL();

  try {
    const payment = await getPayment(db, { paymentId, full: true });
    db.release();

    if (payment.paid !== null) throw 'Payment has already been paid';

    const amount = payment.totalPrice.usd;
    const charge = await request
      .post('https://api.commerce.coinbase.com/charges')
      .set('X-CC-Version', '2018-03-22')
      .set('X-CC-Api-Key', CONFIG.COINBASE.API_KEY)
      .send({
        name: `xyPayments ${amount} USD`,
        metadata: {
          paymentId,
          key: CONFIG.COINBASE.WEBHOOK_SECRET
        },
        local_price: {
          amount,
          currency: 'USD'
        },
        description: payment.description,
        redirect_url: `${
          CONFIG.URL.MAIN
        }/pay?payment_id=${paymentId}&method=coinbase`,
        pricing_type: 'fixed_price'
      });

    res.status(200).json({ url: charge.body.data.hosted_url });
  } catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }
}
