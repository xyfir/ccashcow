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

  // Start payment
  const { url } = await startSquarePayment(2);

  // Validate new payment
  expect(mockGetItem).toHaveBeenCalledTimes(1);
  expect(mockGetItem).toHaveBeenCalledWith('payment-2');
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(mockSetItem.mock.calls[0][0]).toBe('payment-2');
  expect((mockSetItem.mock.calls[0][1] as CCashCow.Payment).method).toBe(
    'square'
  );
  expect(url).toStartWith('https://connect.squareup.com/v2/checkout?c=');

  // 'Pay' the transaction
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

  // Finish payment
  const { jwt } = await finishSquarePayment(
    await signJWT(payment, process.enve.JWT_KEY),
    squareTransactionId
  );

  // Validate completed payment
  expect(mockGetItem).toHaveBeenCalledTimes(2);
  expect(mockSetItem).toHaveBeenCalledTimes(2);
  await expect(verifyJWT(jwt, process.enve.JWT_KEY)).not.toReject();
  expect((mockSetItem.mock.calls[1][1] as CCashCow.Payment).paid).toBeNumber();
  expect(
    (mockSetItem.mock.calls[1][1] as CCashCow.Payment).squareTransactionId
  ).toBe(squareTransactionId);
});
