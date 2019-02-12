const getPayment = require('lib/payments/get');
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
export async function api_getPayment(req, res) {
  const db = new MySQL();

  try {
    const payment = await getPayment(db, {
      sellerId: req.query.seller_id,
      paymentId: req.params.payment,
      sellerKey: req.query.seller_key
    });
    db.release();
    res.status(200).json(payment);
  } catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }
}
