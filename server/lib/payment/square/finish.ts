import { verifyJWT } from 'lib/jwt/verify';
import * as storage from 'node-persist';
import { CCashCow } from 'types/ccashcow';
import { signJWT } from 'lib/jwt/sign';
import axios from 'axios';

export async function finishSquarePayment(
  jwt: string,
  squareTransactionId: string
): Promise<{ jwt: string }> {
  const { id: paymentId } = await verifyJWT(jwt, process.enve.JWT_KEY);

  await storage.init(process.enve.STORAGE);
  const payment: CCashCow.Payment = await storage.getItem(
    `payment-${paymentId}`
  );
  if (payment.method != 'square') throw 'Not a Square payment';
  if (payment.paid) throw 'Payment has already been paid';

  // Verify transaction with Square
  const res = await axios.get(
    `https://connect.squareup.com/v2/locations/${
      process.enve.SQUARE_LOCATION_KEY
    }/transactions/${squareTransactionId}`,
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
