const authorizeSeller = require('lib/sellers/authorize');
const CONFIG = require('constants/config');
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
 * @prop {string} redirect_url
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 * @prop {number} [url]
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
      redirect_url: req.body.redirect_url,
      description: req.body.description,
      product_id: req.body.product_id,
      seller_id: req.body.seller_id,
      methods: JSON.stringify(req.body.methods),
      email: req.body.email,
      info: JSON.stringify(req.body.info)
    });

    db.release();
    res.status(200).json({
      url: `${CONFIG.URL.MAIN}/pay/?payment_id=${result.insertId}`
    });
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }

}