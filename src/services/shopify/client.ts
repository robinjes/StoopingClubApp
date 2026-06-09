import { getStorefrontApiUrl, isShopifyConfigured, shopifyConfig } from './config';
import type { ShopifyApiError } from './types';

type GraphQLResponse<T> = {
  data?: T;
  errors?: ShopifyApiError[];
};

/**
 * Thin Storefront API client. Swap the body of shopifyFetch once credentials are set.
 */
export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!isShopifyConfigured()) {
    throw new Error(
      'Shopify is not configured. Set EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN and EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN.',
    );
  }

  const response = await fetch(getStorefrontApiUrl(), {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken,
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json()) as GraphQLResponse<T>;

  if (!response.ok || json.errors?.length) {
    const message = json.errors?.[0]?.message ?? `Shopify request failed (${response.status})`;
    throw new Error(message);
  }

  if (!json.data) {
    throw new Error('Shopify returned an empty response.');
  }

  return json.data;
}
