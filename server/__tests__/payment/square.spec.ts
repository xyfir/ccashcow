import { finishSquarePayment, startSquarePayment } from 'lib/payment/square';
import { verifyJWT, signJWT } from 'lib/jwt';
import { CCashCow } from 'types/ccashcow';
import storage from 'node-persist';
import axios from 'axios';

test('startSquarePayment(), finishSquarePayment()', async () => {
  // Mock payment
  const payment: CCashCow.Payment = {
    methods: ['square'],
    amount: 999,
    id: 2
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
    data: { checkout: { checkout_page_url: 'url' } }
  });

  // Start payment
  const { url } = await startSquarePayment(2);

  // Validate new payment
  expect(mockGetItem).toHaveBeenCalledTimes(1);
  expect(mockGetItem).toHaveBeenCalledWith('payment-2');
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(mockPost).toHaveBeenCalledTimes(1);
  expect(mockSetItem.mock.calls[0][0]).toBe('payment-2');
  expect((mockSetItem.mock.calls[0][1] as CCashCow.Payment).method).toBe(
    'square'
  );
  expect(url).toBe('url');

  // Mock storage
  mockGetItem.mockResolvedValueOnce(mockSetItem.mock.calls[0][1]);
  mockSetItem.mockResolvedValueOnce(undefined);

  // Mock API
  mockGet.mockResolvedValueOnce({
    data: { transaction: { reference_id: '2' } }
  });

  // Finish payment
  const { jwt } = await finishSquarePayment(
    await signJWT(payment, process.enve.JWT_KEY),
    'tx'
  );

  // Validate completed payment
  expect(mockGetItem).toHaveBeenCalledTimes(2);
  expect(mockSetItem).toHaveBeenCalledTimes(2);
  expect(mockGet).toHaveBeenCalledTimes(1);
  await expect(verifyJWT(jwt, process.enve.JWT_KEY)).not.toReject();
  expect((mockSetItem.mock.calls[1][1] as CCashCow.Payment).paid).toBeNumber();
  expect(
    (mockSetItem.mock.calls[1][1] as CCashCow.Payment).squareTransactionId
  ).toBe('tx');
});
