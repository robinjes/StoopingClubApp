import type { ShopifyGraphQLResponse } from '../../types/shopify';
import { fetchCustomerDiscovery } from './customerDiscovery';

export async function customerAccountFetch<T>(
  query: string,
  accessToken: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const { graphqlApiUrl } = await fetchCustomerDiscovery();

  const response = await fetch(graphqlApiUrl, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json()) as ShopifyGraphQLResponse<T>;

  if (!response.ok || json.errors?.length) {
    const message = json.errors?.[0]?.message ?? `Customer API request failed (${response.status})`;
    throw new Error(message);
  }

  if (!json.data) {
    throw new Error('Customer API returned an empty response.');
  }

  return json.data;
}
