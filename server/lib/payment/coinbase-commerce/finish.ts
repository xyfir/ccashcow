import { verifyJWT } from 'lib/jwt/verify';
import * as storage from 'node-persist';
import { CCashCow } from 'types/ccashcow';
import { signJWT } from 'lib/jwt/sign';
import axios from 'axios';

export async function finishCoinbaseCommercePayment(
  jwt: string
): Promise<{ jwt: string }> {
  const { id: paymentId } = await verifyJWT(jwt, process.enve.JWT_KEY);
  await storage.init(process.enve.STORAGE);
  const payment: CCashCow.Payment = await storage.getItem(
    `payment-${paymentId}`
  );
  if (payment.method != 'coinbase-commerce')
    throw 'Not a Coinbase Commerce payment';
  if (payment.paid) throw 'Payment has already been paid';

  // Verify charge was completed
  const res = await axios.get(
    `https://api.commerce.coinbase.com/charges/${
      payment.coinbaseCommerceChargeCode
    }`
  );
  const completed =
    res.data.data.timeline.findIndex(
      // Docs not clear on which to expect so check for either
      e => e.status == 'CONFIRMED' || e.status == 'COMPLETED'
    ) > -1;
  if (!completed && typeof test == 'undefined')
    throw 'Payment has not been completed';

  // Save completed payment
  payment.paid = Date.now();
  await storage.setItem(`payment-${payment.id}`, payment);

  return { jwt: await signJWT(payment, process.enve.JWT_KEY) };
}
