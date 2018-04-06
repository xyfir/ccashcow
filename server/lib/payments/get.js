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
 * @typedef {object} TotalPrice
 * @prop {number} [usd]
 * @prop {number} [usd_cents]
 * @prop {number} [swifts]
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
 * @prop {number} [discount]
 * @prop {TotalPrice} totalPrice
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
      SELECT
        id, product_id, methods, created, paid, redirect_url, amount, discount
      FROM payments WHERE id = ?
    `, [
      opt.paymentId
    ]);
  }

  if (!payment) throw 'Could not find payment';

  // Parse values only available in full payment object
  if (opt.full || (opt.sellerId && opt.sellerKey)) {
    payment.fulfilled = !!payment.fulfilled,
    payment.info = JSON.parse(payment.info);
  }

  // Parse payment values
  payment.methods = JSON.parse(payment.methods),
  payment.product = await getProduct(db, payment.product_id),
  payment.totalPrice = {},
  payment.redirect_url = payment.redirect_url.replace('PAYMENT_ID', payment.id);
  delete payment.product_id;

  const discount = payment.discount ? payment.discount / 100 : null;

  // Set `payment.totalPrice` values
  if (payment.product && payment.product.amount_cents) {
    payment.totalPrice.usd = payment.product.amount_cents / 100,
    payment.totalPrice.usd_cents = payment.product.amount_cents;
  }
  if (payment.amount) {
    payment.totalPrice.usd = payment.amount / 100,
    payment.totalPrice.usd_cents = payment.amount;
  }
  if (payment.totalPrice.usd && discount) {
    payment.totalPrice.usd -=
      +(payment.totalPrice.usd * discount).toFixed(2),
    payment.totalPrice.usd_cents -=
      +(payment.totalPrice.usd_cents * discount).toFixed(0);
  }
  if (payment.product && payment.product.amount_swifts) {
    payment.totalPrice.swifts = payment.product.amount_swifts;

    if (discount) {
      payment.totalPrice.swifts -=
        +(payment.product.amount_swifts * discount).toFixed(0);
    }
  }

  return payment;

}