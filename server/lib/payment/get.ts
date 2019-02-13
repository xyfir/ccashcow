import { JWT_KEY, STORAGE } from 'constants/config';
import { verify, sign } from 'jsonwebtoken';
import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';

export async function getPayment(
  jwt: string
): Promise<RichCow.RetrievedPayment> {
  // Verify JWT
  const provided: RichCow.Payment = await new Promise((resolve, reject) =>
    verify(jwt, JWT_KEY, {}, (err, token) =>
      err ? reject(err) : resolve(token as RichCow.Payment)
    )
  );

  await storage.init(STORAGE);
  const saved: RichCow.Payment = await storage.getItem(
    `payment-${provided.id}`
  );

  // Payment is complete
  // Return saved payment and generate a JWT from it
  if (saved && saved.paid) {
    const newJWT: string = await new Promise((resolve, reject) =>
      sign(saved, JWT_KEY, { expiresIn: '10m' }, (err, token) =>
        err ? reject(err) : resolve(token)
      )
    );
    return { payment: saved, jwt: newJWT };
  }
  // User has not paid yet
  // Return payment object parsed from provided JWT
  else {
    return { payment: provided };
  }
}
