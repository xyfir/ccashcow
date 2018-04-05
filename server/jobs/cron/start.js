const deleteUnpaidPayments = require('jobs/cron/delete-unpaid-payments');

module.exports = function() {

  // runs hourly
  setInterval(deleteUnpaidPayments, 3600 * 1000);

}