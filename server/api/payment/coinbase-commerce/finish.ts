import { NextFunction, Response, Request } from 'express';
import { finishCoinbaseCommercePayment } from 'lib/payment/coinbase-commerce';

export function api_finishCoinbaseCommercePayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  finishCoinbaseCommercePayment(req.body.jwt)
    .then(info => res.status(200).json(info))
    .catch(next);
}
