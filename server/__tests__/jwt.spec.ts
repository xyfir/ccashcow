import { verifyJWT, signJWT } from 'lib/jwt';
import { CCashCow } from 'types/ccashcow';

test('signJWT(), verifyJWT()', async () => {
  const payment: CCashCow.Payment = { id: 1, amount: 999, methods: ['square'] };
  const encoded = await signJWT(payment, process.enve.JWT_KEY);
  const decoded = await verifyJWT(encoded, process.enve.JWT_KEY);
  expect(decoded.id).toBe(1);
  expect(decoded.amount).toBe(999);
  expect(decoded.methods).toMatchObject(['square']);
});
