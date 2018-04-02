const router = require('express').Router();

/* PAYMENTS */
router.post('/payments', require('./payments/initialize'));
router.get('/payments/:payment', require('./payments/get'));
router.post('/payments/:payment/square', require('./payments/square'));

module.exports = router;