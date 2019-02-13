import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';
import { signJWT } from 'lib/jwt/sign';
import axios from 'axios';
import {
  COINBASE_WEBHOOK_SECRET,
  COINBASE_API_KEY,
  RICH_COW_WEB_URL,
  JWT_KEY,
  STORAGE,
  NAME
} from 'constants/config';

export async function startCoinbasePayment(
  paymentId: RichCow.Payment['id']
): Promise<{ url: string }> {
  // Get payment
  await storage.init(STORAGE);
  const payment: RichCow.Payment = await storage.getItem(
    `payment-${paymentId}`
  );
  if (!payment) throw 'Payment does not exist';
  if (payment.paid) throw 'Payment has already been paid';
  if (payment.methods.indexOf('coinbase-commerce') == -1)
    throw 'Payment method rejected';

  // Generate tokens, one for webhook and one for redirect
  const redirectJWT = await signJWT(payment, JWT_KEY);
  const webhookJWT = await signJWT(payment, COINBASE_WEBHOOK_SECRET);

  // Create charge
  const charge = await axios.post(
    'https://api.commerce.coinbase.com/charges',
    {
      name: NAME,
      metadata: { webhookJWT },
      local_price: { amount: payment.amount, currency: 'USD' },
      redirect_url: `${RICH_COW_WEB_URL}?jwt=${redirectJWT}`,
      pricing_type: 'fixed_price'
    },
    {
      headers: {
        'X-CC-Version': '2018-03-22',
        'X-CC-Api-Key': COINBASE_API_KEY
      }
    }
  );

  return { url: charge.data.data.hosted_url };
}
