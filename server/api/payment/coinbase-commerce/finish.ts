import { NextFunction, Response, Request } from 'express';
import { finishCoinbaseCommercePayment } from 'lib/payment/coinbase-commerce/finish';

export function api_finishCoinbaseCommercePayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  finishCoinbaseCommercePayment(req.body.data.metadata.jwt, req.body.data.code)
    .then(() => res.status(200).json({}))
    .catch(next);
}
