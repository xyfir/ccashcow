import { verifyJWT, signJWT } from 'lib/jwt';
import { CCashCow } from 'types/ccashcow';
import storage from 'node-persist';
import axios from 'axios';

export async function startSquarePayment(
  paymentId: CCashCow.Payment['id']
): Promise<{ url: string }> {
  // Get payment
  const payment: CCashCow.Payment = await storage.getItem(
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
    `https://connect.squareup.com/v2/locations/${process.enve.SQUARE_LOCATION_KEY}/checkouts`,
    {
      order: {
        line_items: [
          {
            name: `${process.enve.NAME} Payment`,
            quantity: '1',
            base_price_money: {
              currency: process.enve.CURRENCY,
              amount: payment.amount
            }
          }
        ],
        reference_id: payment.id.toString()
      },
      redirect_url: `${process.enve.CCASHCOW_WEB_URL}?jwt=${jwt}`,
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

export async function finishSquarePayment(
  jwt: string,
  squareTransactionId: string
): Promise<{ jwt: string }> {
  const { id: paymentId } = await verifyJWT(jwt, process.enve.JWT_KEY);

  const payment: CCashCow.Payment = await storage.getItem(
    `payment-${paymentId}`
  );
  if (payment.method != 'square') throw 'Not a Square payment';
  if (payment.paid) throw 'Payment has already been paid';

  // Verify transaction with Square
  const res = await axios.get(
    `https://connect.squareup.com/v2/locations/${process.enve.SQUARE_LOCATION_KEY}/transactions/${squareTransactionId}`,
    { headers: { Authorization: `Bearer ${process.enve.SQUARE_ACCESS_TOKEN}` } }
  );
  if (res.data.transaction.reference_id != payment.id.toString())
    throw 'Invalid transaction';

  // Save completed payment
  payment.paid = Date.now();
  payment.squareTransactionId = squareTransactionId;
  await storage.setItem(`payment-${payment.id}`, payment);

  return { jwt: await signJWT(payment, process.enve.JWT_KEY) };
}
