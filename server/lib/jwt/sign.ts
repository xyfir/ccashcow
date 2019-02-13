import { RichCow } from 'types/rich-cow';
import { sign } from 'jsonwebtoken';

export function signJWT(
  payment: RichCow.Payment,
  secret: string
): Promise<string> {
  return new Promise((resolve, reject) =>
    sign(payment, secret, { expiresIn: '1h' }, (err, token) =>
      err ? reject(err) : resolve(token)
    )
  );
}
