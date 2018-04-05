const MySQL = require('lib/MySQL');

module.exports = async function() {

  const db = new MySQL;

  try {
    await db.query(`
      DELETE FROM payments
      WHERE paid IS NULL AND created < DATE_SUB(NOW(), INTERVAL 1 DAY)
    `)
  }
  catch (err) {}

  db.release();

}