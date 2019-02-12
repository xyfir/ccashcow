const getPayment = require('lib/payments/get');
const request = require('superagent');
const CONFIG = require('constants/config');
const MySQL = require('lib/MySQL');

/**
 * @typedef {object} RequestBody
 * @prop {string} nonce
 * @prop {string} postal
 * @prop {string} country
 * @prop {string} address
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 */
/**
 * `POST /api/payments/:payment/square`
 * @param {object} req
 * @param {RequestBody} req.body
 * @param {object} req.params
 * @param {number} req.params.payment
 * @param {object} res
 */
module.exports = async function(req, res) {

  const db = new MySQL;

  try {
    const payment = await getPayment(db, {
      paymentId: req.params.payment,
      full: true
    });

    if (!payment)
      throw 'Could not find valid payment';
    else if (payment.paid !== null)
      throw 'Payment is already paid';

    const charge = await request
      .post(
        `https://connect.squareup.com/v2/locations/` +
        `${CONFIG.SQUARE.LOCATION_KEY}/transactions`
      )
      .set('Authorization', `Bearer ${CONFIG.SQUARE.ACCESS_TOKEN}`)
      .send({
        idempotency_key: req.params.payment,
        billing_address: {
          address_line_1: req.body.address,
          postal_code: req.body.postal,
          country: req.body.country
        },
        amount_money: {
          amount: payment.totalPrice.usd_cents,
          currency: 'USD'
        },
        card_nonce: req.body.nonce,
        reference_id: req.params.payment,
        note: payment.description,
        delay_capture: false,
        buyer_email_address: payment.email
      });

    const result = await db.query(`
      UPDATE payments SET
        paid = NOW(), transaction = ?, method = ?
      WHERE id = ?
    `, [
      charge.body.transaction.id, 'square',
      req.params.payment
    ]);

    if (!result.affectedRows) throw 'Could not complete payment';

    db.release();
    res.status(200).json({ });
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }

}