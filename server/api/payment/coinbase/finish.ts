import { NextFunction, Response, Request } from 'express';
import { finishCoinbasePayment } from 'lib/payment/coinbase/finish';

export function api_finishCoinbasePayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  finishCoinbasePayment(req.body.data.metadata.jwt, req.body.data.code)
    .then(() => res.status(200).json({}))
    .catch(next);
}
