const authorizeSeller = require('lib/sellers/authorize');
const MySQL = require('lib/MySQL');

/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 */
/**
 * `POST /api/payments/:payment/fulfill`
 * @param {object} req
 * @param {object} req.params
 * @param {number} req.params.payment
 * @param {object} req.body
 * @param {number} req.body.seller_id
 * @param {string} req.body.seller_key
 */
export async function api_fulfillPayment(req, res) {
  const db = new MySQL();

  try {
    await authorizeSeller(db, req.body.seller_id, req.body.seller_key);

    const result = await db.query(
      'UPDATE payments SET fulfilled = 1 WHERE id = ? AND seller_id = ?',
      [req.params.payment, req.body.seller_id]
    );

    if (!result.affectedRows) throw 'Could not fulfill payment';

    db.release();
    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }
}
