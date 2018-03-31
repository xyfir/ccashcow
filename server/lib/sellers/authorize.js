/**
 * Validate that seller id and key match.
 * @param {object} db
 * @param {number} id
 * @param {string} key
 * @throws {string} Throws error message when not authorized.
 */
module.exports = async function(db, id, key) {

  const rows = await db.query(
    `SELECT id FROM sellers WHERE id = ? AND api_key = ?`, [id, key]
  );

  if (!rows.length) throw 'Invalid seller id/key';

}