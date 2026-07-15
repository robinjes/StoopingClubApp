import type { ShopifyMoney } from '../types/shopify';

export function formatPrice(money: ShopifyMoney): string {
  const amount = Number.parseFloat(money.amount);

  if (Number.isNaN(amount)) {
    return money.amount;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(amount);
}

/** Matches the web cart, e.g. "$75.00 USD". */
export function formatPriceWithCode(money: ShopifyMoney): string {
  return `${formatPrice(money)} ${money.currencyCode}`;
}
