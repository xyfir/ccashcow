import { NextFunction, Response, Request } from 'express';
import { startSquarePayment } from 'lib/payment/square';

export function api_startSquarePayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  startSquarePayment(req.body.paymentId)
    .then(info => res.status(200).json(info))
    .catch(next);
}
