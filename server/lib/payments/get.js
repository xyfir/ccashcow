const authorizeSeller = require('lib/sellers/authorize');
const getProduct = require('lib/products/get');

/**
 * Returns a payment's full or partial info depending on whether the payment's
 *  creator is requesting the information.
 * @param {MySQL} db
 * @param {number} paymentId
 * @param {number} [sellerId]
 * @param {string} [sellerKey]
 * @return {Payment}
 */
/**
 * @typedef {object} Payment
 * @prop {number} id
 * @prop {number} [seller_id]
 * @prop {string[]} methods
 * @prop {Product} product
 * @prop {string} [method]
 * @prop {string} created
 * @prop {string} [paid]
 * @prop {string} [description]
 * @prop {object} [info]
 */
module.exports = async function(db, paymentId, sellerId, sellerKey) {

  /** @type {Payment} */
  let payment;
  let full = false;

  // Only return full info if seller id/key provided and valid
  try {
    await authorizeSeller(db, sellerId, sellerKey);

    [payment] = await db.query(
      'SELECT * FROM payments WHERE id = ? AND seller_id = ?',
      [paymentId, sellerId]
    ),
    full = true;
  }
  catch (err) {
    [payment] = await db.query(
      'SELECT id, product_id, methods, created FROM payments WHERE id = ?',
      [paymentId]
    );
  }

  if (!payment) throw 'Could not find payment';

  payment.methods = JSON.parse(payment.methods);
  payment.product = await getProduct(db, payment.product_id);
  delete payment.product_id;

  if (full) payment.info = JSON.parse(payment.info);

  return payment;

}