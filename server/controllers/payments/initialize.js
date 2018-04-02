const authorizeSeller = require('lib/sellers/authorize');
const MySQL = require('lib/MySQL');

/**
 * @typedef {object} RequestBody
 * @prop {number} seller_id
 * @prop {string} seller_key
 * @prop {string[]} methods
 * @prop {number} product_id
 * @prop {string} description
 * @prop {object} info
 * @prop {string} email
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 * @prop {number} [id]
 */
/**
 * `POST /api/payments`
 * @param {object} req
 * @param {RequestBody} req.body
 * @param {object} res
 */
module.exports = async function(req, res) {

  const db = new MySQL;

  try {
    await authorizeSeller(db, req.body.seller_id, req.body.seller_key);

    const result = db.query(`
      INSERT INTO payments SET ?
    `, {
      description: req.body.description,
      product_id: req.body.product_id,
      seller_id: req.body.seller_id,
      methods: JSON.stringify(req.body.methods),
      email: req.body.email,
      info: JSON.stringify(req.body.info)
    });

    db.release();
    res.status(200).json({ id: result.insertId });
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }

}