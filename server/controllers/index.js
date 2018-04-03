const router = require('express').Router();

/* PAYMENTS */
router.post('/payments', require('./payments/initialize'));
router.get('/payments/:payment', require('./payments/get'));
router.post('/payments/:payment/square', require('./payments/square'));
router.post(
  '/payments/:payment/coinpayments',
  require('./payments/coinpayments/create')
);
router.post(
  '/payments/:payment/coinpayments/complete',
  require('./payments/coinpayments/complete')
);
router.post(
  '/payments/:payment/swiftdemand',
  require('./payments/swiftdemand/create')
);
router.post(
  '/payments/:payment/swiftdemand/complete',
  require('./payments/swiftdemand/complete')
);

module.exports = router;