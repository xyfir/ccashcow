const router = require('express').Router();

router.post('/payments', require('./payments/initialize'));
router.get('/payments/:payment', require('./payments/get'));
router.post('/payments/:payment/square', require('./payments/square'));
router.post('/payments/:payment/fulfill', require('./payments/fulfill'));
router.post(
  '/payments/:payment/coinbase',
  require('./payments/coinbase/create')
);
router.post(
  '/payments/null/coinbase/complete',
  require('./payments/coinbase/complete')
);

module.exports = router;
