import { verifyJWT, signJWT } from 'lib/jwt';
import { CCashCow } from 'types/ccashcow';
import storage from 'node-persist';
import axios from 'axios';
import {
  finishCoinbaseCommercePayment,
  startCoinbaseCommercePayment
} from 'lib/payment/coinbase-commerce';

test('startCoinbaseCommercePayment(), finishCoinbaseCommercePayment()', async () => {
  // Mock payment
  const payment: CCashCow.Payment = {
    methods: ['coinbase-commerce'],
    amount: 999,
    id: 3
  };

  // Mock storage
  const mockGetItem = ((storage as any).getItem = jest.fn());
  const mockSetItem = ((storage as any).setItem = jest.fn());
  mockGetItem.mockResolvedValueOnce(payment);
  mockSetItem.mockResolvedValueOnce(undefined);

  // Mock API
  const mockPost = ((axios as any).post = jest.fn());
  const mockGet = ((axios as any).get = jest.fn());
  mockPost.mockResolvedValueOnce({
    data: { data: { hosted_url: 'url', code: 'code' } }
  });

  // Start payment
  const { url } = await startCoinbaseCommercePayment(3);

  // Validate new payment
  expect(mockGetItem).toHaveBeenCalledTimes(1);
  expect(mockGetItem).toHaveBeenCalledWith('payment-3');
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(mockSetItem.mock.calls[0][0]).toBe('payment-3');
  expect((mockSetItem.mock.calls[0][1] as CCashCow.Payment).method).toBe(
    'coinbase-commerce'
  );
  expect(
    (mockSetItem.mock.calls[0][1] as CCashCow.Payment)
      .coinbaseCommerceChargeCode
  ).toBe('code');
  expect(url).toBe('url');
  expect(mockPost).toHaveBeenCalledTimes(1);

  // Mock storage
  mockGetItem.mockResolvedValueOnce(mockSetItem.mock.calls[0][1]);
  mockSetItem.mockResolvedValueOnce(undefined);

  // Mock API
  mockGet.mockResolvedValueOnce({
    data: { data: { timeline: [{ status: 'CONFIRMED' }] } }
  });

  // Finish payment
  const { jwt } = await finishCoinbaseCommercePayment(
    await signJWT(payment, process.enve.JWT_KEY)
  );

  // Validate completed payment
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGetItem).toHaveBeenCalledTimes(2);
  expect(mockSetItem).toHaveBeenCalledTimes(2);
  await expect(verifyJWT(jwt, process.enve.JWT_KEY)).not.toReject();
  expect((mockSetItem.mock.calls[1][1] as CCashCow.Payment).paid).toBeNumber();
});
