import { NextFunction, Response, Request } from 'express';
import { finishSquarePayment } from 'lib/payment/square/finish';

export function api_finishSquarePayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  finishSquarePayment(req.body.paymentId, req.body.squareTransactionId)
    .then(info => res.status(200).json(info))
    .catch(next);
}
