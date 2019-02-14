import { Router } from 'express';
import * as c from './controllers';

export const router = Router();

router.get('/payment', c.api_getPayment);
router.post('/payment/square/start', c.api_startSquarePayment);
router.post('/payment/square/finish', c.api_finishSquarePayment);
router.post('/payment/coinbase/start', c.api_startCoinbasePayment);
router.post('/payment/coinbase/finish', c.api_finishCoinbasePayment);
