import { Router } from 'express';
import * as c from './controllers';

export const router = Router();

router.post('/payments', c.api_initializePayment);
router.get('/payments/:payment', c.api_getPayment);
router.post('/payments/:payment/square', c.api_squarePayment);
router.post('/payments/:payment/fulfill', c.api_fulfillPayment);
router.post('/payments/:payment/coinbase', c.api_createCoinbasePayment);
router.post('/payments/null/coinbase/complete', c.api_completeCoinbasePayment);
