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
module.exports = async function(req, res) {

  const db = new MySQL;

  try {
    const payment = await getPayment(
      db, req.params.payment, req.query.seller_id, req.query.seller_key
    );
    db.release();
    res.status(200).json(payment);
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }

}