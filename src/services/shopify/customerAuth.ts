import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { customerAccountConfig } from './customerAccount';
import { fetchCustomerDiscovery } from './customerDiscovery';
import { customerAccountFetch } from './customerApi';
import type { CustomerProfile } from '../../types/customer';

WebBrowser.maybeCompleteAuthSession();

export const ACCESS_TOKEN_KEY = 'shopify_access_token';
export const REFRESH_TOKEN_KEY = 'shopify_refresh_token';
const EXPIRES_AT_KEY = 'shopify_token_expires_at';
const LEGACY_STOREFRONT_TOKEN_KEY = 'shopify_customer_access_token';
const LEGACY_STOREFRONT_EXPIRES_KEY = 'shopify_customer_token_expires_at';

export { customerAccountConfig } from './customerAccount';
export const CUSTOMER_REGISTER_URL = customerAccountConfig.registerUrl;
export const CUSTOMER_ORDERS_URL = customerAccountConfig.ordersUrl;

export type CustomerOAuthSession = {
  authUrl: string;
  codeVerifier: string;
};

export type CustomerTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
};

export { getCustomerAuthStatus } from './customerAccount';

export function isCustomerAuthCallback(url: string): boolean {
  return url.startsWith(customerAccountConfig.redirectUri);
}

export function parseOAuthErrorFromUrl(url: string): string | null {
  const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  if (!query.includes('error=')) {
    return null;
  }

  const params = new URLSearchParams(query);
  const error = params.get('error');
  if (!error) {
    return null;
  }

  return params.get('error_description') ?? error;
}

export function parseAuthCodeFromCallback(url: string): string | null {
  if (!isCustomerAuthCallback(url)) {
    return null;
  }

  const oauthError = parseOAuthErrorFromUrl(url);
  if (oauthError) {
    throw new Error(oauthError);
  }

  const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  return new URLSearchParams(query).get('code');
}

function createAuthRequest(loginHint?: string): AuthSession.AuthRequest {
  return new AuthSession.AuthRequest({
    clientId: customerAccountConfig.clientId,
    scopes: [...customerAccountConfig.scopes],
    redirectUri: customerAccountConfig.redirectUri,
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
    extraParams: {
      locale: 'en',
      region_country: 'US',
      ...(loginHint ? { login_hint: loginHint } : {}),
    },
  });
}

/** Starts email code sign-in — Shopify sends a one-time code to the email address. */
export async function prepareEmailCodeLoginSession(email: string): Promise<CustomerOAuthSession> {
  const discovery = await fetchCustomerDiscovery();
  const request = createAuthRequest(email.trim());

  const authUrl = await request.makeAuthUrlAsync({
    authorizationEndpoint: discovery.authorizationEndpoint,
  });

  if (!request.codeVerifier) {
    throw new Error('Missing PKCE verifier for sign in.');
  }

  return { authUrl, codeVerifier: request.codeVerifier };
}

export async function saveCustomerTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
    [EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000)],
  ]);
  await AsyncStorage.multiRemove([LEGACY_STOREFRONT_TOKEN_KEY, LEGACY_STOREFRONT_EXPIRES_KEY]);
}

export async function loadStoredCustomerTokens(): Promise<CustomerTokens | null> {
  const [[, accessToken], [, refreshToken], [, expiresAtRaw]] = await AsyncStorage.multiGet([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    EXPIRES_AT_KEY,
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAtRaw ? Number(expiresAtRaw) : Date.now() + 3_600_000,
  };
}

export async function clearCustomerTokens(): Promise<void> {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    EXPIRES_AT_KEY,
    LEGACY_STOREFRONT_TOKEN_KEY,
    LEGACY_STOREFRONT_EXPIRES_KEY,
  ]);
}

async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
): Promise<CustomerTokens> {
  const discovery = await fetchCustomerDiscovery();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: customerAccountConfig.clientId,
    redirect_uri: customerAccountConfig.redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const response = await fetch(discovery.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const json = (await response.json()) as TokenResponse;

  if (!response.ok) {
    throw new Error(json.error_description ?? json.error ?? 'Token exchange failed.');
  }

  const tokens: CustomerTokens = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  await saveCustomerTokens(tokens.accessToken, tokens.refreshToken, json.expires_in);
  return tokens;
}

async function refreshCustomerTokens(refreshToken: string): Promise<CustomerTokens> {
  const discovery = await fetchCustomerDiscovery();
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: customerAccountConfig.clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(discovery.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const json = (await response.json()) as TokenResponse;

  if (!response.ok) {
    throw new Error(json.error_description ?? json.error ?? 'Token refresh failed.');
  }

  const tokens: CustomerTokens = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  await saveCustomerTokens(tokens.accessToken, tokens.refreshToken, json.expires_in);
  return tokens;
}

export async function completeCustomerLogin(
  code: string,
  codeVerifier: string,
): Promise<CustomerTokens> {
  return exchangeCodeForTokens(code, codeVerifier);
}

export async function getValidCustomerAccessToken(): Promise<string | null> {
  const stored = await loadStoredCustomerTokens();
  if (!stored) {
    return null;
  }

  const expiresSoon = stored.expiresAt - Date.now() < 60_000;
  if (!expiresSoon) {
    return stored.accessToken;
  }

  try {
    const refreshed = await refreshCustomerTokens(stored.refreshToken);
    return refreshed.accessToken;
  } catch {
    await clearCustomerTokens();
    return null;
  }
}

export async function logoutCustomer(): Promise<void> {
  await clearCustomerTokens();
}

const CUSTOMER_PROFILE_QUERY = `
  query CustomerProfile {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;

type CustomerProfileResponse = {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddress: {
      emailAddress: string;
    } | null;
  } | null;
};

export async function fetchCustomerProfile(accessToken: string): Promise<CustomerProfile> {
  const data = await customerAccountFetch<CustomerProfileResponse>(
    CUSTOMER_PROFILE_QUERY,
    accessToken,
  );

  if (!data.customer) {
    throw new Error('Could not load customer profile.');
  }

  return {
    id: data.customer.id,
    email: data.customer.emailAddress?.emailAddress ?? null,
    firstName: data.customer.firstName,
    lastName: data.customer.lastName,
  };
}
