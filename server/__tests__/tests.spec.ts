import { config } from 'dotenv';
config();
import 'enve';

import { finishCoinbaseCommercePayment } from 'lib/payment/coinbase-commerce/finish';
import { startCoinbaseCommercePayment } from 'lib/payment/coinbase-commerce/start';
import { finishSquarePayment } from 'lib/payment/square/finish';
import { startSquarePayment } from 'lib/payment/square/start';
import { verifyJWT, signJWT } from 'lib/jwt';
import { getPayment } from 'lib/payment/get';
import * as storage from 'node-persist';
import { CCashCow } from 'types/ccashcow';
import axios from 'axios';
import 'jest-extended';

beforeAll(async () => {
  await storage.init(process.enve.TEST_STORAGE);
  for (let i = 1; i < 4; i++) await storage.removeItem(`payment-${i}`);
});

test('sign and verify jwt', async () => {
  const payment: CCashCow.Payment = { id: 1, amount: 999, methods: ['square'] };
  const encoded = await signJWT(payment, process.enve.JWT_KEY);
  const decoded = await verifyJWT(encoded, process.enve.JWT_KEY);
  expect(decoded.id).toBe(1);
  expect(decoded.amount).toBe(999);
  expect(decoded.methods).toMatchObject(['square']);
});

test('get payment', async () => {
  const jwt = await signJWT(
    { id: 1, amount: 999, methods: ['square'] },
    process.enve.JWT_KEY
  );

  let payment = await getPayment(jwt);
  expect(payment.id).toBe(1);

  const _payment: CCashCow.Payment = await storage.getItem('payment-1');
  expect(_payment).not.toBeUndefined();
  expect(_payment.id).toBe(1);

  payment = await getPayment(jwt);
  expect(payment.id).toBe(1);
});

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
