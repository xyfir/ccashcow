import { NextFunction, Response, Request } from 'express';
import { startSquarePayment } from 'lib/payment/square/start';

export function api_startSquarePayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  startSquarePayment(req.body)
    .then(() => res.status(200).json({}))
    .catch(next);
}
