const request = require('request');
const CONFIG = require('constants/config');
const MySQL = require('lib/MySQL');
const iap = require('in-app-purchase');

const testing = CONFIG.ENVIRONMENT == 'production';

/**
 * `POST /api/payments/:payment/iap`
 *  github.com/j3k0/cordova-plugin-purchase/blob/master/doc/api.md#transactions
 *  github.com/j3k0/cordova-plugin-purchase/wiki/HOWTO
 * @param {object} req
 * @param {object} req.params
 * @param {number} req.params.payment
 * @param {object} req.body
 * @param {string} req.body.type - 'ios-appstore|android-playstore'
 */
 module.exports = async function(req, res) {

  const db = new MySQL;

  try {
    // Get Google Play Store public/license/billing key for seller (app)
    const [seller] = await db.query(`
      SELECT play_store_public_key AS playKey FROM sellers WHERE id = (
        SELECT seller_id FROM payments WHERE id = ?
      )
    `, [
      req.params.payment
    ]);

    if (!seller) throw 'Bad payment';

    iap.config({
      googlePublicKeyStrLive: seller.playKey,
      verbose: testing,
      test: testing
    });

    // Validate receipt
    await new Promise((resolve, reject) =>
      iap.setup(err => {
        if (err) return reject('Could not validate purchase');

        iap.validate(req.body, (err, response) => {
          if (err)
            return reject('Could not validate purchase');
          if (!iap.isValidated(response))
            return reject('Invalid purchase receipt received');

          resolve();
        });
      })
    );

    // Set payment as paid
    await db.query(
      'UPDATE payments SET method = ?, paid = NOW() WHERE id = ?',
      [`iap:${req.body.type.split('-')[0]}`, req.params.payment]
    );

    db.release();
    res.status(200).json({ });
  }
  catch (e) {
    db.release();
    res.status(400).json({ message: e });
  }

};