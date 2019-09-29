import { NextFunction, Response, Request } from 'express';
import { startCoinbaseCommercePayment } from 'lib/payment/coinbase-commerce';

export function api_startCoinbaseCommercePayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  startCoinbaseCommercePayment(req.body.paymentId)
    .then(info => res.status(200).json(info))
    .catch(next);
}
