import { TESTS, JWT_KEY } from 'constants/config';
import { getPayment } from 'lib/payment/get';
import { verifyJWT } from 'lib/jwt/verify';
import * as storage from 'node-persist';
import { RichCow } from 'types/rich-cow';
import { signJWT } from 'lib/jwt/sign';
import 'jest-extended';

beforeAll(async () => {
  await storage.init(TESTS.STORAGE);
  await storage.removeItem('payment-1');
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
