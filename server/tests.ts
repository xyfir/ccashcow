import { COINBASE_WEBHOOK_SECRET, JWT_KEY, TESTS } from 'constants/config';
import { finishCoinbasePayment } from 'lib/payment/coinbase/finish';
import { startCoinbasePayment } from 'lib/payment/coinbase/start';
import { chargeSquare } from 'lib/payment/charge-square';
import { getPayment } from 'lib/payment/get';
import { verifyJWT } from 'lib/jwt/verify';
import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';
import { signJWT } from 'lib/jwt/sign';
import 'jest-extended';

beforeAll(async () => {
  await storage.init(TESTS.STORAGE);
  for (let i = 1; i < 4; i++) await storage.removeItem(`payment-${i}`);
});

test('sign and verify jwt', async () => {
  const payment: RichCow.Payment = { id: 1, amount: 999, methods: ['square'] };
  const encoded = await signJWT(payment, JWT_KEY);
  const decoded = await verifyJWT(encoded, JWT_KEY);
  expect(decoded.id).toBe(1);
  expect(decoded.amount).toBe(999);
  expect(decoded.methods).toMatchObject(['square']);
});

test('get payment', async () => {
  let data = await getPayment(
    await signJWT({ id: 1, amount: 999, methods: ['square'] }, JWT_KEY)
  );
  expect(data.payment.id).toBe(1);

  const payment: RichCow.Payment = await storage.getItem('payment-1');
  expect(payment).not.toBeUndefined();
  expect(payment.id).toBe(1);

  data = await getPayment(data.jwt);
  expect(data.payment.id).toBe(1);
});

test('charge square', async () => {
  await getPayment(
    await signJWT({ id: 2, amount: 999, methods: ['square'] }, JWT_KEY)
  );
  await expect(
    chargeSquare({
      nonce: 'fake-card-nonce-ok',
      postal: '94103',
      country: 'US',
      address: '',
      paymentId: 2
    })
  ).not.toReject();
  const payment: RichCow.Payment = await storage.getItem('payment-2');
  expect(payment.paid).toBeNumber();
  expect(payment.method).toBe('square');
  expect(payment.squareTransactionId).toBeString();
});

test('coinbase commerce payment', async () => {
  await getPayment(
    await signJWT({ id: 3, amount: 1, methods: ['coinbase-commerce'] }, JWT_KEY)
  );
  const { url } = await startCoinbasePayment(3);
  expect(url).toStartWith('https://commerce.coinbase.com/charges/');

  await expect(
    finishCoinbasePayment(
      await signJWT(
        { id: 3, amount: 1, methods: ['coinbase-commerce'] },
        COINBASE_WEBHOOK_SECRET
      ),
      'T3ST'
    )
  ).not.toReject();
  const payment: RichCow.Payment = await storage.getItem('payment-3');
  expect(payment.paid).toBeNumber();
  expect(payment.method).toBe('coinbase-commerce');
  expect(payment.coinbaseCommerceChargeCode).toBe('T3ST');
});
