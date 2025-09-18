// lib/currency.ts
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.85 },
  CNY: { symbol: '¥', rate: 7.2 },
  JPY: { symbol: '¥', rate: 150 },
};

export function convertPrice(price: number, fromCurrency: string, toCurrency: string) {
  const usdPrice = price / SUPPORTED_CURRENCIES[fromCurrency].rate;
  return usdPrice * SUPPORTED_CURRENCIES[toCurrency].rate;
}