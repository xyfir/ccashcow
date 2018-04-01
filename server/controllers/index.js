const router = require('express').Router();

/* PAYMENTS */
router.post('/payments/initialize', require('./payments/initialize'));
router.post('/payments/complete', require('./payments/complete'));
router.get('/payments/:payment', require('./payments/get'));

module.exports = router;