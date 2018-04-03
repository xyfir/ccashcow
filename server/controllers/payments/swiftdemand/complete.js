const getPayment = require('lib/payments/get');
const CONFIG = require('constants/config');
const MySQL = require('lib/MySQL');

/**
 * `POST /api/payments/:payment/swiftdemand/complete`
 * @param {object} req
 * @param {object} req.params
 * @param {number} req.params.payment
 * @param {object} req.body
 * @param {string} req.body.status
 * @param {object} req.query
 * @param {string} req.query.key
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 */
module.exports = async function(req, res) {

  const paymentId = req.params.payment;
  const db = new MySQL;

  try {
    if (req.query.key != CONFIG.SWIFTDEMAND.key) throw 'Invalid request';

    const payment = await getPayment(db, { paymentId, full: true });
    if (payment.paid !== null) throw 'Payment has already been paid';

    await db.query(`
      UPDATE payments SET transaction = ?, method = ?, paid = NOW()
      WHERE id = ?
    `, [
      req.body.txn_id, 'swiftdemand',
      paymentId
    ]);
    db.release();

    res.status(200).json({ });
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }

}