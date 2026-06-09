/**
 * Shopify API configuration.
 * Values are read from EXPO_PUBLIC_* env vars (see .env.example).
 */
export const shopifyConfig = {
  storeDomain:
    process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN ?? 'stooping-club-berkeley.myshopify.com',
  storefrontAccessToken: process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '',
  apiVersion: process.env.EXPO_PUBLIC_SHOPIFY_API_VERSION ?? '2024-10',
  customerAccountClientId: process.env.EXPO_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ?? '',
} as const;

export function getStorefrontApiUrl(): string {
  const { storeDomain, apiVersion } = shopifyConfig;
  return `https://${storeDomain}/api/${apiVersion}/graphql.json`;
}

export function getCustomerAccountApiUrl(): string {
  const { storeDomain } = shopifyConfig;
  return `https://shopify.com/${storeDomain.replace('.myshopify.com', '')}/account/customer/api/2024-10/graphql`;
}

export function isShopifyConfigured(): boolean {
  const { storeDomain, storefrontAccessToken } = shopifyConfig;
  return (
    storeDomain.length > 0 &&
    !storeDomain.includes('your-store') &&
    storefrontAccessToken.length > 0 &&
    storefrontAccessToken !== 'your-storefront-access-token'
  );
}

export function isCustomerAccountConfigured(): boolean {
  const { customerAccountClientId } = shopifyConfig;
  return (
    customerAccountClientId.length > 0 &&
    customerAccountClientId !== 'your-customer-account-client-id'
  );
}
