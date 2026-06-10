import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { customerAccountConfig } from './customerAccount';
import { shopifyConfig } from './config';
import { fetchCustomerDiscovery } from './customerDiscovery';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_STORAGE_KEY = 'shopify_customer_tokens';

export type CustomerTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

type StoredTokens = CustomerTokens;

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export async function loadStoredCustomerTokens(): Promise<CustomerTokens | null> {
  const raw = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

async function persistCustomerTokens(tokens: CustomerTokens | null): Promise<void> {
  if (!tokens) {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

function toCustomerTokens(response: TokenResponse): CustomerTokens {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: Date.now() + response.expires_in * 1000,
  };
}

async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
): Promise<CustomerTokens> {
  const discovery = await fetchCustomerDiscovery();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: shopifyConfig.customerAccountClientId,
    redirect_uri: customerAccountConfig.redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const response = await fetch(discovery.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const json = (await response.json()) as TokenResponse & { error?: string; error_description?: string };

  if (!response.ok) {
    throw new Error(json.error_description ?? json.error ?? 'Could not complete customer login.');
  }

  const tokens = toCustomerTokens(json);
  await persistCustomerTokens(tokens);
  return tokens;
}

async function refreshCustomerTokens(refreshToken: string): Promise<CustomerTokens> {
  const discovery = await fetchCustomerDiscovery();
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: shopifyConfig.customerAccountClientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(discovery.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const json = (await response.json()) as TokenResponse & { error?: string; error_description?: string };

  if (!response.ok) {
    throw new Error(json.error_description ?? json.error ?? 'Could not refresh customer session.');
  }

  const tokens = toCustomerTokens(json);
  await persistCustomerTokens(tokens);
  return tokens;
}

export async function loginCustomer(): Promise<CustomerTokens> {
  const discovery = await fetchCustomerDiscovery();

  const request = new AuthSession.AuthRequest({
    clientId: shopifyConfig.customerAccountClientId,
    scopes: [...customerAccountConfig.scopes],
    redirectUri: customerAccountConfig.redirectUri,
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
  });

  await request.makeAuthUrlAsync({
    authorizationEndpoint: discovery.authorizationEndpoint,
  });

  const result = await request.promptAsync({
    authorizationEndpoint: discovery.authorizationEndpoint,
  });

  if (result.type !== 'success' || !result.params.code) {
    throw new Error('Customer login was cancelled.');
  }

  if (!request.codeVerifier) {
    throw new Error('Missing PKCE verifier for customer login.');
  }

  return exchangeCodeForTokens(result.params.code, request.codeVerifier);
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
    await persistCustomerTokens(null);
    return null;
  }
}

export async function logoutCustomer(): Promise<void> {
  await persistCustomerTokens(null);
}
