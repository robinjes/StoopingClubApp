import { customerAccountConfig } from './customerAccount';

export type CustomerDiscovery = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  graphqlApiUrl: string;
};

type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
};

type CustomerAccountApiConfiguration = {
  graphql_api: string;
};

let cachedDiscovery: CustomerDiscovery | null = null;

function buildFallbackDiscovery(): CustomerDiscovery {
  const { shopId } = customerAccountConfig;
  return {
    authorizationEndpoint: `https://shopify.com/${shopId}/auth/oauth/authorize`,
    tokenEndpoint: `https://shopify.com/${shopId}/auth/oauth/token`,
    graphqlApiUrl: `https://shopify.com/${shopId}/account/customer/api/2024-10/graphql`,
  };
}

export async function fetchCustomerDiscovery(): Promise<CustomerDiscovery> {
  if (cachedDiscovery) {
    return cachedDiscovery;
  }

  const { storefrontOrigin } = customerAccountConfig;

  try {
    const [openIdResponse, apiResponse] = await Promise.all([
      fetch(`${storefrontOrigin}/.well-known/openid-configuration`),
      fetch(`${storefrontOrigin}/.well-known/customer-account-api`),
    ]);

    if (!openIdResponse.ok || !apiResponse.ok) {
      throw new Error('Discovery request failed.');
    }

    const openId = (await openIdResponse.json()) as OpenIdConfiguration;
    const apiConfig = (await apiResponse.json()) as CustomerAccountApiConfiguration;

    cachedDiscovery = {
      authorizationEndpoint: openId.authorization_endpoint,
      tokenEndpoint: openId.token_endpoint,
      graphqlApiUrl: apiConfig.graphql_api,
    };

    return cachedDiscovery;
  } catch {
    cachedDiscovery = buildFallbackDiscovery();
    return cachedDiscovery;
  }
}
