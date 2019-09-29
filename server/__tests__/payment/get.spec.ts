import { getPayment } from 'lib/payment/get';
import { CCashCow } from 'types/ccashcow';
import { signJWT } from 'lib/jwt';
import storage from 'node-persist';

test('getPayment()', async () => {
  // Mock storage
  const mockGetItem = ((storage as any).getItem = jest.fn());
  const mockSetItem = ((storage as any).setItem = jest.fn());
  mockGetItem.mockResolvedValueOnce(undefined);
  mockSetItem.mockResolvedValueOnce(undefined);

  // Create payment
  const payment: CCashCow.Payment = {
    id: 1,
    amount: 999,
    methods: ['square']
  };
  const jwt = await signJWT(payment, process.enve.JWT_KEY);
  let _payment = await getPayment(jwt);

  // Validate payment creation
  expect(_payment).toMatchObject(payment);
  expect(mockGetItem).toHaveBeenCalledTimes(1);
  expect(mockGetItem).toHaveBeenCalledWith('payment-1');
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(mockSetItem.mock.calls[0][0]).toBe('payment-1');
  expect(mockSetItem.mock.calls[0][1]).toMatchObject(payment);

  // Get 'saved' payment
  mockGetItem.mockResolvedValueOnce(payment);
  _payment = await getPayment(jwt);

  // Validate getting payment
  expect(mockGetItem).toHaveBeenCalledTimes(2);
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(_payment).toMatchObject(payment);
});
