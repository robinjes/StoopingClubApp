/**
 * Shopify Storefront API configuration.
 * Add these to a .env file (see .env.example) before connecting to your store.
 */
export const shopifyConfig = {
  storeDomain: process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN ?? 'your-store.myshopify.com',
  storefrontAccessToken:
    process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? 'your-storefront-access-token',
  apiVersion: process.env.EXPO_PUBLIC_SHOPIFY_API_VERSION ?? '2024-10',
} as const;

export function getStorefrontApiUrl(): string {
  const { storeDomain, apiVersion } = shopifyConfig;
  return `https://${storeDomain}/api/${apiVersion}/graphql.json`;
}

export function isShopifyConfigured(): boolean {
  const { storeDomain, storefrontAccessToken } = shopifyConfig;
  return (
    !storeDomain.includes('your-store') &&
    storefrontAccessToken !== 'your-storefront-access-token'
  );
}
