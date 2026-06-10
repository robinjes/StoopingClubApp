import { shopifyConfig } from './config';

type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
};

type CustomerAccountApiConfiguration = {
  graphql_api: string;
};

export type CustomerDiscovery = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  logoutEndpoint: string;
  graphqlApiUrl: string;
};

let cachedDiscovery: CustomerDiscovery | null = null;

export async function fetchCustomerDiscovery(): Promise<CustomerDiscovery> {
  if (cachedDiscovery) {
    return cachedDiscovery;
  }

  const shopDomain = shopifyConfig.storeDomain;
  const [openIdResponse, customerApiResponse] = await Promise.all([
    fetch(`https://${shopDomain}/.well-known/openid-configuration`),
    fetch(`https://${shopDomain}/.well-known/customer-account-api`),
  ]);

  if (!openIdResponse.ok || !customerApiResponse.ok) {
    throw new Error('Could not load Shopify customer account configuration.');
  }

  const openId = (await openIdResponse.json()) as OpenIdConfiguration;
  const customerApi = (await customerApiResponse.json()) as CustomerAccountApiConfiguration;

  cachedDiscovery = {
    authorizationEndpoint: openId.authorization_endpoint,
    tokenEndpoint: openId.token_endpoint,
    logoutEndpoint: openId.end_session_endpoint,
    graphqlApiUrl: customerApi.graphql_api,
  };

  return cachedDiscovery;
}
