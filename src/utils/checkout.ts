export function isCheckoutCompleteUrl(url: string): boolean {
  const normalized = url.toLowerCase();

  return (
    normalized.includes('thank_you') ||
    normalized.includes('thank-you') ||
    normalized.includes('/orders/') ||
    normalized.includes('checkout/success')
  );
}
