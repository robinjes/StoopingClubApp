import { isCustomerAccountConfigured, shopifyConfig } from './config';

/**
 * Customer Account API (OAuth + PKCE) — used for logged-in customer features
 * like order history and saved addresses. Cart/checkout works without this.
 *
 * To finish wiring login you will also need:
 * - A redirect URI registered in Shopify Admin (e.g. stoopingclubapp://account/callback)
 * - expo-auth-session for the OAuth PKCE flow
 */
export const customerAccountConfig = {
  clientId: shopifyConfig.customerAccountClientId,
  scopes: ['openid', 'email', 'customer-account-api:full'],
  redirectUri: 'stoopingclubapp://account/callback',
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
