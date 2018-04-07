/**
 * Returns a product's full info depending.
 * @param {MySQL} db
 * @param {number} id
 * @return {Product|null}
 */
/**
 * @typedef {object} IAPType
 * @prop {string} [android]
 * @prop {string} [apple]
 */
/**
 * @typedef {object} Product
 * @prop {number} id
 * @prop {number} seller_id
 * @prop {string} name
 * @prop {number} [amount_cents]
 * @prop {number} [amount_swifts]
 * @prop {string} [coinbase_checkout_id]
 * @prop {string} [iap_id]
 * @prop {IAPType} [iap_type]
 */
module.exports = async function(db, id) {

  if (!id) return null;

  const [row] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  if (!row) throw 'Could not find product';

  if (row.iap_type) row.iap_type = JSON.parse(row.iap_type);

  return row;

}