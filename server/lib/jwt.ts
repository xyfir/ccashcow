import { verify, sign } from 'jsonwebtoken';
import { CCashCow } from 'types/ccashcow';

export function signJWT(
  payment: CCashCow.Payment,
  secret: string
): Promise<string> {
  return new Promise((resolve, reject) =>
    sign(payment, secret, { expiresIn: '1d' }, (err, token) =>
      err ? reject(err) : resolve(token)
    )
  );
}

export function verifyJWT(
  jwt: string,
  secret: string
): Promise<CCashCow.Payment> {
  return new Promise((resolve, reject) =>
    verify(jwt, secret, {}, (err, token) =>
      err ? reject(err) : resolve(token as CCashCow.Payment)
    )
  );
}
