import { NextFunction, Response, Request } from 'express';
import { startCoinbasePayment } from 'lib/payment/coinbase/start';

export function api_startCoinbasePayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  startCoinbasePayment(req.body.paymentId)
    .then(info => res.status(200).json(info))
    .catch(next);
}
