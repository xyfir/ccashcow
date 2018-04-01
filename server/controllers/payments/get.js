const authorizeSeller = require('lib/sellers/authorize');
const MySQL = require('lib/MySQL');

/**
 * `GET /api/payments/:payment`
 * @param {object} req
 * @param {object} req.params
 * @param {number} req.params.payment
 * @param {object} req.query
 * @param {number} req.query.seller_id
 * @param {string} req.query.seller_key
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 * @prop {number} id
 * @prop {number} [seller_id]
 * @prop {string[]} methods
 * @prop {number} amount
 * @prop {string} [method]
 * @prop {string} created
 * @prop {string} [paid]
 * @prop {string} [description]
 * @prop {object} [info]
 */
module.exports = async function(req, res) {

  const db = new MySQL;

  try {
    /** @type {ResponseBody} */
    let payment;
    let full = false;

    // Only return full info if seller id/key provided and valid
    try {
      await authorizeSeller(db, req.query.seller_id, req.query.seller_key);

      [payment] = await db.query(
        'SELECT * FROM payments WHERE id = ?', [req.params.payment]
      ),
      full = true;
    }
    catch (err) {
      [payment] = await db.query(
        'SELECT id, methods, amount, created FROM payments WHERE id = ?',
        [req.params.payment]
      );
    }

    if (!payment) throw 'Could not find payment';

    if (payment.methods) payment.methods = JSON.parse(payment.methods);
    if (payment.info) payment.info = JSON.parse(payment.info);

    db.release();
    res.status(200).json(payment);
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }

}