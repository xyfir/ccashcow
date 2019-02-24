import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';
import axios from 'axios';
import { signJWT } from 'lib/jwt/sign';

export async function startSquarePayment(
  paymentId: RichCow.Payment['id']
): Promise<{ url: string }> {
  // Get payment
  await storage.init(process.enve.STORAGE);
  const payment: RichCow.Payment = await storage.getItem(
    `payment-${paymentId}`
  );
  if (!payment) throw 'Payment does not exist';
  if (payment.paid) throw 'Payment has already been paid';
  if (payment.methods.indexOf('square') == -1) throw 'Payment method rejected';

  // Set method so we know a payment is in progress
  payment.method = 'square';

  // Create Checkout
  const jwt = await signJWT(payment, process.enve.JWT_KEY);
  const res = await axios.post(
    `https://connect.squareup.com/v2/locations/${
      process.enve.SQUARE_LOCATION_KEY
    }/checkouts`,
    {
      order: {
        line_items: [
          {
            name: `${process.enve.NAME} Payment`,
            quantity: '1',
            base_price_money: {
              currency: 'USD',
              amount: payment.amount
            }
          }
        ],
        reference_id: payment.id.toString()
      },
      redirect_url: `${process.enve.RICH_COW_WEB_URL}?jwt=${jwt}`,
      reference_id: payment.id.toString(),
      idempotency_key:
        typeof test == 'undefined'
          ? payment.id.toString()
          : Date.now().toString()
    },
    { headers: { Authorization: `Bearer ${process.enve.SQUARE_ACCESS_TOKEN}` } }
  );

  // Checkout was created successfully so we can update the payment on disk
  await storage.setItem(`payment-${payment.id}`, payment);

  // Return the url for Square's hosted Checkout page
  return { url: res.data.checkout.checkout_page_url };
}
