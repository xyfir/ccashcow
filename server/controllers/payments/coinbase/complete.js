const getPayment = require('lib/payments/get');
const CONFIG = require('constants/config');
const MySQL = require('lib/MySQL');

/**
 * `POST /api/payments/null/coinbase/complete`
 * @param {object} req
 * @param {object} req.body
 * @param {object} req.body.event
 * @param {string} req.body.event.id
 * @param {object} req.body.event.data
 * @param {object} req.body.event.data.metadata
 * @param {string} req.body.event.data.metadata.key
 * @param {number} req.body.event.data.metadata.paymentId
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 */
module.exports = async function(req, res) {

  const {paymentId} = req.body.event.data.metadata;
  const db = new MySQL;

  try {
    if (req.body.event.data.metadata.key != CONFIG.COINBASE.WEBHOOK_SECRET)
      throw 'Invalid request';

    const payment = await getPayment(db, { paymentId, full: true });
    if (payment.paid !== null) throw 'Payment has already been paid';

    await db.query(`
      UPDATE payments SET transaction = ?, method = ?, paid = NOW()
      WHERE id = ?
    `, [
      req.body.event.id, 'coinbase',
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