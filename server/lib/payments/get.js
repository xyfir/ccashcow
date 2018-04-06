const authorizeSeller = require('lib/sellers/authorize');
const getProduct = require('lib/products/get');

/**
 * @typedef {object} GetPaymentOptions
 * @prop {number} paymentId
 * @prop {number} [sellerId]
 * @prop {string} [sellerKey]
 * @prop {boolean} [full]
 */
/**
 * Returns a payment's full or partial info depending on whether the payment's
 *  creator is requesting the information.
 * @param {MySQL} db
 * @param {GetPaymentOptions} opt
 * @return {Payment}
 */
/**
 * @typedef {object} Payment
 * @prop {number} id
 * @prop {number} [seller_id]
 * @prop {string[]} methods
 * @prop {Product} [product]
 * @prop {string} [method]
 * @prop {string} created
 * @prop {string} paid
 * @prop {string} [description]
 * @prop {object} [info]
 * @prop {string} [email]
 * @prop {string} redirect_url
 * @prop {number} [amount]
 * @prop {boolean} [fulfilled]
 */
module.exports = async function(db, opt) {

  /** @type {Payment} */
  let payment;

  // Load full payment data if request is authorized for this payment
  if (opt.sellerId && opt.sellerKey) {
    await authorizeSeller(db, opt.sellerId, opt.sellerKey);

    [payment] = await db.query(
      'SELECT * FROM payments WHERE id = ? AND seller_id = ?',
      [opt.paymentId, opt.sellerId]
    );
  }
  // Load full paynent data
  else if (opt.full) {
    [payment] = await db.query(
      'SELECT * FROM payments WHERE id = ?', [opt.paymentId]
    );
  }
  // Load public data for payment
  else {
    [payment] = await db.query(`
      SELECT id, product_id, methods, created, paid, redirect_url, amount
      FROM payments WHERE id = ?
    `, [
      opt.paymentId
    ]);
  }

  if (!payment) throw 'Could not find payment';

  if (opt.full || (opt.sellerId && opt.sellerKey)) {
    payment.fulfilled = !!payment.fulfilled,
    payment.info = JSON.parse(payment.info);
  }

  payment.methods = JSON.parse(payment.methods),
  payment.product = await getProduct(db, payment.product_id),
  payment.redirect_url = payment.redirect_url.replace('PAYMENT_ID', payment.id);
  delete payment.product_id;

  return payment;

}