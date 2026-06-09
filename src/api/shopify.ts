import type { ShopifyGraphQLResponse } from '../types/shopify';

const SHOPIFY_STOREFRONT_URL =
  'https://stooping-club-berkeley.myshopify.com/api/2024-01/graphql.json';

const STOREFRONT_ACCESS_TOKEN = 'efde750d94d72e1a383e34ed9da89005';

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json()) as ShopifyGraphQLResponse<T>;

  if (!response.ok) {
    throw new Error(`Shopify request failed with status ${response.status}`);
  }

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error('Shopify returned an empty response.');
  }

  return json.data;
}
