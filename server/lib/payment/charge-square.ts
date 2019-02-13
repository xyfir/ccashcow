import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';
import axios from 'axios';
import {
  SQUARE_ACCESS_TOKEN,
  SQUARE_LOCATION_KEY,
  STORAGE
} from 'constants/config';

export async function chargeSquare(data: {
  nonce: string;
  postal: string;
  country: string;
  address: string;
  paymentId: RichCow.Payment['id'];
}): Promise<void> {
  // Get payment
  await storage.init(STORAGE);
  const payment: RichCow.Payment = await storage.getItem(
    `payment-${data.paymentId}`
  );
  if (!payment) throw 'Payment does not exist';
  if (payment.paid) throw 'Payment has already been paid';
  if (payment.methods.indexOf('square') == -1) throw 'Payment method rejected';

  // Attempt to charge card
  const charge = await axios.post(
    `https://connect.squareup.com/v2/locations/${SQUARE_LOCATION_KEY}/transactions`,
    {
      card_nonce: data.nonce,
      amount_money: {
        amount: payment.amount,
        currency: 'USD'
      },
      reference_id: payment.id,
      delay_capture: false,
      idempotency_key: payment.id,
      billing_address: {
        address_line_1: data.address,
        postal_code: data.postal,
        country: data.country
      },
      buyer_email_address: payment.email
    },
    { headers: { Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}` } }
  );

  // Save completed charge
  payment.paid = Date.now();
  payment.method = 'square';
  payment.squareTransactionId = charge.data.transaction.id;
  await storage.setItem(`payment-${payment.id}`, payment);
}
