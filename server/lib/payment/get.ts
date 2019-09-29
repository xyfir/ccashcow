import { verifyJWT } from 'lib/jwt';
import { CCashCow } from 'types/ccashcow';
import storage from 'node-persist';

export async function getPayment(jwt: string): Promise<CCashCow.Payment> {
  const provided = await verifyJWT(jwt, process.enve.JWT_KEY);
  let saved: CCashCow.Payment = await storage.getItem(`payment-${provided.id}`);

  // Save payment
  if (saved === undefined) {
    delete provided.iat;
    delete provided.exp;
    await storage.setItem(`payment-${provided.id}`, provided);
    saved = provided;
  }

  return saved;
}
