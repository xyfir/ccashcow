import { JWT_KEY, STORAGE } from 'constants/config';
import { verify, sign } from 'jsonwebtoken';
import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';

export async function getPayment(
  jwt: string
): Promise<RichCow.GetPaymentResponse> {
  // Verify JWT
  const provided: RichCow.Payment = await new Promise((resolve, reject) =>
    verify(jwt, JWT_KEY, {}, (err, token) =>
      err ? reject(err) : resolve(token as RichCow.Payment)
    )
  );

  await storage.init(STORAGE);
  let saved: RichCow.Payment = await storage.getItem(`payment-${provided.id}`);

  // Save payment
  if (saved === undefined) {
    await storage.setItem(`payment-${provided.id}`, provided);
    saved = provided;
  }

  // Generate new JWT
  const newJWT: string = await new Promise((resolve, reject) =>
    sign(saved, JWT_KEY, { expiresIn: '10m' }, (err, token) =>
      err ? reject(err) : resolve(token)
    )
  );
  return { payment: saved, jwt: newJWT };
}
