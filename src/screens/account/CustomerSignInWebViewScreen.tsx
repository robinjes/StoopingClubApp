import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import type { AccountStackParamList } from '../../navigation/stacks/AccountStack';
import { customerAccountConfig } from '../../services/shopify/customerAccount';
import {
  buildShopAccountsLoginUrl,
  extractAuthStateFromUrl,
  isCustomerAuthCallback,
  parseCustomerAuthCallback,
  parseOAuthErrorFromUrl,
  prepareCustomerLoginByMode,
  type CustomerLoginMode,
} from '../../services/shopify/customerAuth';

type CustomerSignInNavigation = NativeStackNavigationProp<
  AccountStackParamList,
  'CustomerSignIn'
>;
type CustomerSignInRoute = RouteProp<AccountStackParamList, 'CustomerSignIn'>;

const IOS_SAFARI_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const STOREFRONT_SITE = 'https://berkeleystooping.org';

export default function CustomerSignInWebViewScreen() {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const navigation = useNavigation<CustomerSignInNavigation>();
  const route = useRoute<CustomerSignInRoute>();
  const loginMode: CustomerLoginMode = route.params?.mode ?? 'shop';
  const { completeLogin, clearError } = useCustomer();
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompletingLogin, setIsCompletingLogin] = useState(false);
  const hasHandledCallbackRef = useRef(false);
  const hasOpenedLoginPageRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setIsPreparing(true);
      setError(null);
      clearError();
      hasOpenedLoginPageRef.current = false;

      try {
        const session = await prepareCustomerLoginByMode(loginMode);
        if (!cancelled) {
          setWebViewUrl(session.authUrl);
          setCodeVerifier(session.codeVerifier);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Could not start customer sign in.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsPreparing(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [clearError, loginMode]);

  async function handleAuthCallback(url: string) {
    if (hasHandledCallbackRef.current || !codeVerifier) {
      return;
    }

    const callback = parseCustomerAuthCallback(url);
    if (!callback) {
      return;
    }

    hasHandledCallbackRef.current = true;
    setIsCompletingLogin(true);
    setError(null);
    clearError();

    if (callback.error) {
      setError(callback.errorDescription ?? callback.error ?? 'Customer login failed.');
      setIsCompletingLogin(false);
      hasHandledCallbackRef.current = false;
      return;
    }

    if (!callback.code) {
      setError('Customer login did not return an authorization code.');
      setIsCompletingLogin(false);
      hasHandledCallbackRef.current = false;
      return;
    }

    try {
      await completeLogin(callback.code, codeVerifier);
      closeOverlay();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not complete sign in.';
      setError(message);
      hasHandledCallbackRef.current = false;
    } finally {
      setIsCompletingLogin(false);
    }
  }

  function shouldBlockStorefrontNavigation(url: string): boolean {
    if (loginMode !== 'shop') {
      return false;
    }

    try {
      const parsed = new URL(url.startsWith('//') ? `https:${url}` : url);
      return parsed.origin === STOREFRONT_SITE;
    } catch {
      return url.startsWith(STOREFRONT_SITE);
    }
  }

  function applyNavigationError(url: string, statusCode?: number) {
    const oauthError = parseOAuthErrorFromUrl(url);
    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (
      statusCode &&
      statusCode >= 400 &&
      (url.includes('shop.app') || url.includes('pay.shopify.com'))
    ) {
      setError(
        `Shop sign-in could not load (${statusCode}). Add ${customerAccountConfig.redirectUri} as a callback URL in Shopify Admin → Headless → Customer Account API, then try again.`,
      );
    }
  }

  function handleNavigation(url: string): boolean {
    applyNavigationError(url);

    if (isCustomerAuthCallback(url)) {
      void handleAuthCallback(url);
      return false;
    }

    if (shouldBlockStorefrontNavigation(url)) {
      return false;
    }

    if (loginMode === 'shop' && !hasOpenedLoginPageRef.current) {
      const authState = extractAuthStateFromUrl(url);
      if (authState) {
        hasOpenedLoginPageRef.current = true;
        setWebViewUrl(buildShopAccountsLoginUrl(authState));
        return false;
      }

      if (url.includes('shop.app/accounts/login')) {
        hasOpenedLoginPageRef.current = true;
      }
    }

    return true;
  }

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    closeOverlay();
  }

  const showSpinner = isPreparing || !webViewUrl || isCompletingLogin;

  return (
    <ScreenLayout showBack onBack={handleBack}>
      <View className="flex-1">
        {error ? (
          <View className="px-4 py-3">
            <Text className="text-center text-sm text-red-600">{error}</Text>
          </View>
        ) : null}

        {showSpinner ? (
          <View className="absolute inset-0 z-10 items-center justify-center bg-white dark:bg-gray-950">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}

        {webViewUrl ? (
          <WebView
            source={{ uri: webViewUrl }}
            userAgent={loginMode === 'shop' ? IOS_SAFARI_USER_AGENT : undefined}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            domStorageEnabled
            javaScriptEnabled
            setSupportMultipleWindows={false}
            originWhitelist={[
              'https://*',
              'http://*',
              'stoopingclubapp://*',
              'shop.*',
            ]}
            onShouldStartLoadWithRequest={(request) => handleNavigation(request.url)}
            onNavigationStateChange={(event) => {
              applyNavigationError(event.url);
              if (isCustomerAuthCallback(event.url)) {
                void handleAuthCallback(event.url);
              }
            }}
            onError={() =>
              setError('Could not load Shop sign in. Check your connection and try again.')
            }
            onHttpError={({ nativeEvent }) => {
              applyNavigationError(nativeEvent.url, nativeEvent.statusCode);
            }}
            style={{ flex: 1, backgroundColor: colors.background }}
          />
        ) : null}
      </View>
    </ScreenLayout>
  );
}
