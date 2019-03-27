const formatter = new Intl.NumberFormat(navigator.language, {
  currency: process.enve.CURRENCY,
  style: 'currency'
});

export const formatAmount = (amount: number): string =>
  formatter.format(amount);
