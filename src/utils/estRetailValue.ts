import type { ShopifyMoney } from '../types/shopify';

const EST_RETAIL_PATTERN =
  /est\.?\s*retail\s*value\s*[:\-]?\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/i;

export function parseEstRetailAmount(
  ...sources: Array<string | null | undefined>
): number | null {
  for (const source of sources) {
    if (!source) {
      continue;
    }

    const match = source.match(EST_RETAIL_PATTERN);
    if (!match?.[1]) {
      continue;
    }

    const amount = Number.parseFloat(match[1].replace(/,/g, ''));
    if (!Number.isNaN(amount) && amount > 0) {
      return amount;
    }
  }

  return null;
}

export function parseMetafieldMoney(
  value: string | null | undefined,
  currencyCode = 'USD',
): ShopifyMoney | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as { amount?: string; currency_code?: string };
    if (parsed.amount) {
      const amount = Number.parseFloat(parsed.amount);
      if (!Number.isNaN(amount) && amount > 0) {
        return {
          amount: String(amount),
          currencyCode: parsed.currency_code ?? currencyCode,
        };
      }
    }
  } catch {
    // Fall through to plain number / currency string parsing.
  }

  const match = value.match(/([\d,]+(?:\.\d{1,2})?)/);
  if (!match?.[1]) {
    return null;
  }

  const amount = Number.parseFloat(match[1].replace(/,/g, ''));
  if (Number.isNaN(amount) || amount <= 0) {
    return null;
  }

  return { amount: String(amount), currencyCode };
}

export function moneyFromAmount(
  amount: number | null | undefined,
  currencyCode = 'USD',
): ShopifyMoney | null {
  if (amount == null || Number.isNaN(amount) || amount <= 0) {
    return null;
  }

  return { amount: String(amount), currencyCode };
}

export function moneyAmount(money: ShopifyMoney | null | undefined): number {
  if (!money) {
    return 0;
  }

  const amount = Number.parseFloat(money.amount);
  return Number.isNaN(amount) ? 0 : amount;
}
