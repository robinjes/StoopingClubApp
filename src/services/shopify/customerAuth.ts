import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

import { customerAccountConfig } from './customerAccount';

export type CustomerLoginMode = 'shop' | 'email';
import { shopifyConfig } from './config';
import { fetchCustomerDiscovery } from './customerDiscovery';

const TOKEN_STORAGE_KEY = 'shopify_customer_tokens';

export type CustomerTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type CustomerLoginSession = {
  authUrl: string;
  codeVerifier: string;
};

type StoredTokens = CustomerTokens;

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type CustomerAuthCallback = {
  code?: string;
  error?: string;
  errorDescription?: string;
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

const LEGACY_REDIRECT_URI = 'stoopingclubapp://account/callback';

export function isCustomerAuthCallback(url: string): boolean {
  return (
    url.startsWith(customerAccountConfig.redirectUri) || url.startsWith(LEGACY_REDIRECT_URI)
  );
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

export function parseCustomerAuthCallback(url: string): CustomerAuthCallback | null {
  if (!isCustomerAuthCallback(url)) {
    return null;
  }

  const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  const params = new URLSearchParams(query);

  return {
    code: params.get('code') ?? undefined,
    error: params.get('error') ?? undefined,
    errorDescription: params.get('error_description') ?? undefined,
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

function createPkceAuthRequest(): AuthSession.AuthRequest {
  return new AuthSession.AuthRequest({
    clientId: shopifyConfig.customerAccountClientId,
    scopes: [...customerAccountConfig.scopes],
    redirectUri: customerAccountConfig.redirectUri,
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
  });
}

export function extractAuthStateFromUrl(url: string): string | null {
  try {
    const normalized = url.startsWith('//') ? `https:${url}` : url;
    return new URL(normalized).searchParams.get('auth_state');
  } catch {
    const match = url.match(/[?&]auth_state=([^&]+)/);
    return match?.[1] ?? null;
  }
}

export function buildShopAccountsLoginUrl(authState: string): string {
  const searchParams = new URLSearchParams({
    analytics_context: 'loginWithShopSelfServe',
    analytics_trace_id: Crypto.randomUUID(),
    auth_state: authState,
    authentication_level: 'email',
    avoid_sdk_session: 'false',
    compact_layout: 'true',
    flow: 'default',
    flow_version: 'account-actions-popover',
    locale: 'en',
    next: 'OAuthContinue',
    preact: 'true',
    redirect_type: 'iframe',
    require_verification: 'false',
    return_uri: customerAccountConfig.shopReturnUri,
    sign_up_enabled: 'true',
    storefront_domain: customerAccountConfig.storefrontDomain,
    ux_mode: 'iframe',
  });

  return `${customerAccountConfig.shopAppBase}/accounts/login?${searchParams.toString()}`;
}

function buildShopSdkSessionUrl(params: { codeChallenge: string; state: string }): string {
  const searchParams = new URLSearchParams({
    analytics_context: 'loginWithShopSelfServe',
    analytics_trace_id: Crypto.randomUUID(),
    authentication_level: 'email',
    avoid_sdk_session: 'false',
    client_id: shopifyConfig.customerAccountClientId,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
    compact_layout: 'true',
    cross_domain_shopify: 'true',
    flow: 'default',
    flow_version: 'account-actions-popover',
    locale: 'en',
    next: 'OAuthContinue',
    preact: 'true',
    redirect_type: 'iframe',
    redirect_uri: customerAccountConfig.redirectUri,
    require_verification: 'false',
    response_type: 'code',
    return_uri: customerAccountConfig.shopReturnUri,
    scope: customerAccountConfig.scopes.join(' '),
    sign_up_enabled: 'true',
    state: params.state,
    storefront_domain: customerAccountConfig.storefrontDomain,
    ux_mode: 'iframe',
  });

  return `${customerAccountConfig.shopAppBase}/pay/sdk-session?${searchParams.toString()}`;
}

/** Shop sign-in — shop.app SDK session (not the storefront website). */
export async function prepareShopLogin(): Promise<CustomerLoginSession> {
  const request = createPkceAuthRequest();
  const discovery = await fetchCustomerDiscovery();

  const oauthUrl = await request.makeAuthUrlAsync({
    authorizationEndpoint: discovery.authorizationEndpoint,
  });
  const oauthParams = new URL(oauthUrl).searchParams;
  const codeChallenge = oauthParams.get('code_challenge');
  const state = oauthParams.get('state');

  if (!request.codeVerifier || !codeChallenge || !state) {
    throw new Error('Missing PKCE parameters for Shop login.');
  }

  return {
    authUrl: buildShopSdkSessionUrl({ codeChallenge, state }),
    codeVerifier: request.codeVerifier,
  };
}

export async function prepareCustomerLogin(): Promise<CustomerLoginSession> {
  const discovery = await fetchCustomerDiscovery();
  const request = createPkceAuthRequest();

  const authUrl = await request.makeAuthUrlAsync({
    authorizationEndpoint: discovery.authorizationEndpoint,
  });

  if (!request.codeVerifier) {
    throw new Error('Missing PKCE verifier for customer login.');
  }

  return {
    authUrl,
    codeVerifier: request.codeVerifier,
  };
}

export async function prepareCustomerLoginByMode(
  mode: CustomerLoginMode,
): Promise<CustomerLoginSession> {
  return mode === 'shop' ? prepareShopLogin() : prepareCustomerLogin();
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
    await persistCustomerTokens(null);
    return null;
  }
}

export async function logoutCustomer(): Promise<void> {
  await persistCustomerTokens(null);
}
