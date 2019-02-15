import { COINBASE_WEBHOOK_SECRET, STORAGE } from 'constants/config';
import { verifyJWT } from 'lib/jwt/verify';
import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';

export async function finishCoinbaseCommercePayment(
  jwt: string,
  code: RichCow.Payment['coinbaseCommerceChargeCode']
): Promise<void> {
  const provided = await verifyJWT(jwt, COINBASE_WEBHOOK_SECRET);
  await storage.init(STORAGE);
  const payment: RichCow.Payment = await storage.getItem(
    `payment-${provided.id}`
  );
  if (payment.paid) throw 'Payment has already been paid';

  // Save completed charge
  payment.paid = Date.now();
  payment.method = 'coinbase-commerce';
  payment.coinbaseCommerceChargeCode = code;
  await storage.setItem(`payment-${payment.id}`, payment);
}
