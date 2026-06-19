import { isCustomerAccountConfigured, shopifyConfig } from './config';

export const CUSTOMER_ACCOUNT_REDIRECT_URI = `shop.${shopifyConfig.shopId}.app://account/callback`;
export const CUSTOMER_ACCOUNT_SCOPE = 'openid email customer-account-api:full';

export const customerAccountConfig = {
  clientId: shopifyConfig.customerAccountClientId,
  shopId: shopifyConfig.shopId,
  storefrontOrigin: 'https://berkeleystooping.org',
  scopes: CUSTOMER_ACCOUNT_SCOPE.split(' '),
  redirectUri: CUSTOMER_ACCOUNT_REDIRECT_URI,
  scope: CUSTOMER_ACCOUNT_SCOPE,
  registerUrl: 'https://berkeleystooping.org/account/register',
  ordersUrl: 'https://account.berkeleystooping.org/orders',
} as const;

export function getCustomerAuthStatus(): { configured: boolean } {
  return { configured: isCustomerAccountConfigured() };
}
