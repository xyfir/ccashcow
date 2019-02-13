import { RichCow } from 'types/rich-cow';
import { verify } from 'jsonwebtoken';

export function verifyJWT(
  jwt: string,
  secret: string
): Promise<RichCow.Payment> {
  return new Promise((resolve, reject) =>
    verify(jwt, secret, {}, (err, token) =>
      err ? reject(err) : resolve(token as RichCow.Payment)
    )
  );
}
