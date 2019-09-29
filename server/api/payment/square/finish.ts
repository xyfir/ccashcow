import { NextFunction, Response, Request } from 'express';
import { finishSquarePayment } from 'lib/payment/square';

export function api_finishSquarePayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  finishSquarePayment(req.body.jwt, req.body.transactionId)
    .then(info => res.status(200).json(info))
    .catch(next);
}
