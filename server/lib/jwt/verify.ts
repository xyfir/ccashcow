import { CCashCow } from 'types/ccashcow';
import { verify } from 'jsonwebtoken';

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
