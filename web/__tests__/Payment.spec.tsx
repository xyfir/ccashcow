import { waitForDomChange, render, wait } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { Payment } from 'components/Payment';
import * as api from 'lib/api';
import React from 'react';

const { APP_PAYMENT_URL } = process.enve;

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
