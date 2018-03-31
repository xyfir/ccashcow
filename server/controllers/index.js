const router = require('express').Router();

/* PAYMENTS */
router.post('/payments/initialize', require('./payments/initialize'));
router.post('/payments/complete', require('./payments/complete'));
router.get('/payments/status', require('./payments/status'));

module.exports = router;