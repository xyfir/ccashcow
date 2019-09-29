import { finishSquarePayment, startSquarePayment } from 'lib/payment/square';
import { verifyJWT, signJWT } from 'lib/jwt';
import { getPayment } from 'lib/payment/get';
import { CCashCow } from 'types/ccashcow';
import storage from 'node-persist';
import axios from 'axios';
import {
  finishCoinbaseCommercePayment,
  startCoinbaseCommercePayment
} from 'lib/payment/coinbase-commerce';

test('square payment', async () => {
  const _jwt = await signJWT(
    { id: 2, amount: 999, methods: ['square'] },
    process.enve.JWT_KEY
  );
  await getPayment(_jwt);
  const { url } = await startSquarePayment(2);
  expect(url).toStartWith('https://connect.squareup.com/v2/checkout?c=');
  let payment: CCashCow.Payment = await storage.getItem('payment-2');
  expect(payment.method).toBe('square');

  const res = await axios.post(
    `https://connect.squareup.com/v2/locations/${process.enve.SQUARE_LOCATION_KEY}/transactions`,
    {
      card_nonce: 'fake-card-nonce-ok',
      amount_money: {
        amount: 999,
        currency: 'USD'
      },
      reference_id: '2',
      delay_capture: false,
      idempotency_key: Date.now().toString(),
      billing_address: {
        address_line_1: '',
        postal_code: '94103',
        country: 'US'
      }
    },
    { headers: { Authorization: `Bearer ${process.enve.SQUARE_ACCESS_TOKEN}` } }
  );

  const squareTransactionId: string = res.data.transaction.id;
  const { jwt } = await finishSquarePayment(_jwt, squareTransactionId);
  await expect(verifyJWT(jwt, process.enve.JWT_KEY)).not.toReject();
  payment = await storage.getItem('payment-2');
  expect(payment.paid).toBeNumber();
  expect(payment.squareTransactionId).toBe(squareTransactionId);
});

test('coinbase commerce payment', async () => {
  const _jwt = await signJWT(
    { id: 3, amount: 1, methods: ['coinbase-commerce'] },
    process.enve.JWT_KEY
  );
  await getPayment(_jwt);
  const { url } = await startCoinbaseCommercePayment(3);
  expect(url).toStartWith('https://commerce.coinbase.com/charges/');
  let payment: CCashCow.Payment = await storage.getItem('payment-3');
  expect(payment.method).toBe('coinbase-commerce');
  expect(payment.coinbaseCommerceChargeCode).toBeString();

  const { jwt } = await finishCoinbaseCommercePayment(_jwt);
  await expect(verifyJWT(jwt, process.enve.JWT_KEY)).not.toReject();
  payment = await storage.getItem('payment-3');
  expect(payment.paid).toBeNumber();
});
