import * as storage from 'node-persist';
import { CCashCow } from 'types/ccashcow';
import { signJWT } from 'lib/jwt/sign';
import axios from 'axios';

export async function startCoinbaseCommercePayment(
  paymentId: CCashCow.Payment['id']
): Promise<{ url: string }> {
  // Get payment
  await storage.init(process.enve.STORAGE);
  const payment: CCashCow.Payment = await storage.getItem(
    `payment-${paymentId}`
  );
  if (!payment) throw 'Payment does not exist';
  if (payment.paid) throw 'Payment has already been paid';
  if (payment.methods.indexOf('coinbase-commerce') == -1)
    throw 'Payment method rejected';

  // Set method so we know a payment is in progress
  payment.method = 'coinbase-commerce';

  // Create charge
  const jwt = await signJWT(payment, process.enve.JWT_KEY);
  const res = await axios.post(
    'https://api.commerce.coinbase.com/charges',
    {
      name: process.enve.NAME,
      local_price: {
        currency: process.enve.CURRENCY,
        amount: payment.amount * process.enve.CURRENCY_MODIFIER
      },
      redirect_url: `${process.enve.CCASHCOW_WEB_URL}?jwt=${jwt}`,
      pricing_type: 'fixed_price'
    },
    {
      headers: {
        'X-CC-Version': '2018-03-22',
        'X-CC-Api-Key': process.enve.COINBASE_COMMERCE_API_KEY
      }
    }
  );

  // Save Charge code
  payment.coinbaseCommerceChargeCode = res.data.data.code;
  await storage.setItem(`payment-${payment.id}`, payment);

  // Return URL to charge hosted on Coinbase Commerce
  return { url: res.data.data.hosted_url };
}
