import { verifyJWT } from 'lib/jwt/verify';
import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';

export async function getPayment(jwt: string): Promise<RichCow.Payment> {
  const provided = await verifyJWT(jwt, process.enve.JWT_KEY);
  await storage.init(process.enve.STORAGE);
  let saved: RichCow.Payment = await storage.getItem(`payment-${provided.id}`);

  // Save payment
  if (saved === undefined) {
    delete provided.iat;
    delete provided.exp;
    await storage.setItem(`payment-${provided.id}`, provided);
    saved = provided;
  }

  return saved;
}
