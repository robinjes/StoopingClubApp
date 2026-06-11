import { isCustomerAccountConfigured, shopifyConfig } from './config';

/** Shopify requires mobile callback URLs to use the shop.{shop_id}.app scheme. */
export function buildCustomerAccountRedirectUri(shopId: string = shopifyConfig.shopId): string {
  return `shop.${shopId}.app://account/callback`;
}

/**
 * Customer Account API (OAuth + PKCE) — used for logged-in customer features
 * like order history and saved addresses. Cart/checkout works without this.
 *
 * Register `redirectUri` in Shopify Admin → Sales channels → Headless → Customer Account API.
 */
export const customerAccountConfig = {
  clientId: shopifyConfig.customerAccountClientId,
  scopes: ['openid', 'email', 'customer-account-api:full'],
  redirectUri: buildCustomerAccountRedirectUri(),
  /** Used by shop.app during the Shop login UI (matches the Berkeley storefront). */
  shopReturnUri: 'https://berkeleystooping.org/?country=US',
  storefrontDomain: 'https://berkeleystooping.org',
  shopAppBase: 'https://shop.app',
} as const;

export function getCustomerAccountStatus(): {
  configured: boolean;
  clientId: string;
  redirectUri: string;
} {
  return {
    configured: isCustomerAccountConfigured(),
    clientId: customerAccountConfig.clientId,
    redirectUri: customerAccountConfig.redirectUri,
  };
}
