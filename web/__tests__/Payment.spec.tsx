import { waitForDomChange, render, wait } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { Payment } from 'components/Payment';
import * as api from 'lib/api';
import React from 'react';
import { CCashCow } from 'types/ccashcow';

const { APP_PAYMENT_URL } = process.enve;

test('<Payment>', async () => {
  // Mock API / payment
  const mockGet = jest.fn();
  const payment: CCashCow.Payment = {
    methods: ['coinbase-commerce', 'square'],
    amount: 999,
    id: 1
  };
  mockGet.mockResolvedValueOnce({ data: payment });
  (api as any).api = { get: mockGet };

  // Render
  const { getByText } = render(
    <SnackbarProvider>
      <Payment qs={{ jwt: 'jwt123' }} />
    </SnackbarProvider>
  );

  // Validate
  await wait(() => expect(mockGet).toHaveBeenCalledTimes(1));
  expect(mockGet.mock.calls[0][0]).toBe('/payment');
  expect(mockGet.mock.calls[0][1]).toMatchObject({ params: { jwt: 'jwt123' } });
  getByText('$9.99');
  getByText('Credit Card');
  getByText('BTC / Other');
});

test('<Payment> paid', async () => {
  // Mock location
  const mockReplace = ((location as any).replace = jest.fn());

  // Mock API / payment
  const mockGet = jest.fn();
  mockGet.mockResolvedValueOnce({ data: { paid: 1234, method: 'square' } });
  (api as any).api = { get: mockGet };

  // Render
  render(
    <SnackbarProvider>
      <Payment qs={{ jwt: 'jwt123' }} />
    </SnackbarProvider>
  );

  // Validate
  await wait(() => expect(mockGet).toHaveBeenCalledTimes(1));
  expect(mockGet.mock.calls[0][0]).toBe('/payment');
  expect(mockGet.mock.calls[0][1]).toMatchObject({ params: { jwt: 'jwt123' } });
  expect(mockReplace).toHaveBeenCalledTimes(1);
  expect(mockReplace).toHaveBeenCalledWith(
    APP_PAYMENT_URL.replace('{{JWT}}', 'jwt123')
  );
});
