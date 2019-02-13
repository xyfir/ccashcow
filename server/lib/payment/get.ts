import { JWT_KEY, STORAGE } from 'constants/config';
import { verifyJWT } from 'lib/jwt/verify';
import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';
import { signJWT } from 'lib/jwt/sign';

export async function getPayment(
  jwt: string
): Promise<RichCow.GetPaymentResponse> {
  const provided = await verifyJWT(jwt, JWT_KEY);
  await storage.init(STORAGE);
  let saved: RichCow.Payment = await storage.getItem(`payment-${provided.id}`);

  // Save payment
  if (saved === undefined) {
    await storage.setItem(`payment-${provided.id}`, provided);
    saved = provided;
  }

  // Generate new JWT
  const newJWT = await signJWT(saved, JWT_KEY);
  return { payment: saved, jwt: newJWT };
}
