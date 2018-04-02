/**
 * Returns a product's full info depending.
 * @param {MySQL} db
 * @param {number} id
 * @return {Product}
 */
/**
 * @typedef {object} Product
 * @prop {number} id
 * @prop {number} [seller_id]
 * @prop {string} name
 * @prop {number} [amount_cents]
 * @prop {number} [amount_swifts]
 * @prop {string} [coinbase_checkout_id]
 */
module.exports = async function(db, id) {

  const [row] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  if (!row) throw 'Could not find product';
  return row;

}