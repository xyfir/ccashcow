import { NextFunction, Response, Request } from 'express';
import { chargeSquare } from 'lib/payment/charge-square';

export function api_chargeSquare(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  chargeSquare(req.body)
    .then(() => res.status(200).json({}))
    .catch(next);
}
