import { NextFunction, Response, Request } from 'express';
import { getPayment } from 'lib/payment/get';

export function api_getPayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  getPayment(req.query.jwt)
    .then(payment => res.status(200).json(payment))
    .catch(next);
}
