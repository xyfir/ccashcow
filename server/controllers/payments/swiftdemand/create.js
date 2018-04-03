const getPayment = require('lib/payments/get');
const request = require('superagent');
const CONFIG = require('constants/config');
const MySQL = require('lib/MySQL');

/**
 * `POST /api/payments/:payment/swiftdemand`
 * @param {object} req
 * @param {object} req.params
 * @param {number} req.params.payment
 * @param {object} req.body
 * @param {string} req.body.swiftId
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 * @prop {string} [url]
 */
module.exports = async function(req, res) {

  const paymentId = req.params.payment;
  const db = new MySQL;

  try {
    const payment = await getPayment(db, { paymentId, full: true });
    db.release();

    if (payment.paid !== null) throw 'Payment has already been paid';

    const result = await request
      .post(`${CONFIG.SWIFTDEMAND.URL}/api/v0/payments`)
      .send({
        product_id: payment.product.swiftdemand_product_id,
        redirect_url:
          `${CONFIG.URL.MAIN}/pay?payment_id=${paymentId}&method=swift`,
        callback_url:
          `${CONFIG.URL.CALLBACK}/api/payments/${paymentId}/swiftdemand` +
          `/complete?key=${CONFIG.SWIFTDEMAND.KEY}`,
        sender_swift_name: req.body.swiftId
      });

    res.status(200).json({ url: result.body.link });
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }

}