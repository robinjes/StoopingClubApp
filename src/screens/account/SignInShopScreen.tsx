import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import type { TabParamList } from '../../navigation/TabNavigator';
import { customerAccountConfig } from '../../services/shopify/customerAccount';
import {
  CUSTOMER_REGISTER_URL,
  isCustomerAuthCallback,
  parseAuthCodeFromCallback,
  parseOAuthErrorFromUrl,
  prepareEmailCodeLoginSession,
} from '../../services/shopify/customerAuth';

type TabNavigation = BottomTabNavigationProp<TabParamList>;
type SignInStep = 'email' | 'code';

const REDIRECT_SCHEME = customerAccountConfig.redirectUri.split('://')[0];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function SignInShopScreen() {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const tabNavigation = useNavigation<TabNavigation>();
  const { finishLogin, isLoading, error: contextError, clearError } = useCustomer();
  const [step, setStep] = useState<SignInStep>('email');
  const [email, setEmail] = useState('');
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [isPreparingCode, setIsPreparingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCompletingLoginRef = useRef(false);

  const resetCodeStep = useCallback(() => {
    setStep('email');
    setAuthUrl(null);
    setCodeVerifier(null);
    isCompletingLoginRef.current = false;
  }, []);

  async function openExternalUrl(url: string) {
    await WebBrowser.openBrowserAsync(url);
  }

  async function handleContinue() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Enter your email to continue.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setError(null);
    clearError();
    setIsPreparingCode(true);

    try {
      const session = await prepareEmailCodeLoginSession(trimmedEmail);
      setAuthUrl(session.authUrl);
      setCodeVerifier(session.codeVerifier);
      setStep('code');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start sign in.';
      setError(message);
    } finally {
      setIsPreparingCode(false);
    }
  }

  async function handleAuthCallback(url: string) {
    if (!isCustomerAuthCallback(url) || !codeVerifier || isCompletingLoginRef.current) {
      return;
    }

    const oauthError = parseOAuthErrorFromUrl(url);
    if (oauthError) {
      setError(oauthError);
      resetCodeStep();
      return;
    }

    let code: string | null;
    try {
      code = parseAuthCodeFromCallback(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed.';
      setError(message);
      resetCodeStep();
      return;
    }

    if (!code) {
      return;
    }

    isCompletingLoginRef.current = true;
    setError(null);
    clearError();

    try {
      await finishLogin(code, codeVerifier);
      closeOverlay();
      tabNavigation.navigate('ShopTab');
    } catch (err) {
      isCompletingLoginRef.current = false;
      const message = err instanceof Error ? err.message : 'Could not sign in.';
      setError(message);
      resetCodeStep();
    }
  }

  function handleWebViewNavigation(navState: WebViewNavigation) {
    void handleAuthCallback(navState.url);
  }

  const displayError = error ?? contextError;
  const inputStyle = {
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
  };
  const trimmedEmail = email.trim();

  if (step === 'code' && authUrl) {
    return (
      <ScreenLayout showBack onBack={resetCodeStep}>
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          <View className="px-6 pb-4 pt-8">
            <Text className="text-3xl font-bold" style={{ color: colors.text }}>
              Enter code
            </Text>
            <View className="mt-3 flex-row flex-wrap items-center">
              <Text className="text-base" style={{ color: colors.textMuted }}>
                Sent to {trimmedEmail}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change email"
                className="ml-2"
                onPress={resetCodeStep}
              >
                <Text className="text-base font-medium" style={{ color: colors.brand }}>
                  Change
                </Text>
              </Pressable>
            </View>
            {displayError ? (
              <Text className="mt-4 text-sm text-red-600">{displayError}</Text>
            ) : null}
          </View>

          <View className="flex-1">
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={colors.brand} />
                <Text className="mt-3 text-sm" style={{ color: colors.textMuted }}>
                  Signing you in…
                </Text>
              </View>
            ) : (
              <WebView
                source={{ uri: authUrl }}
                originWhitelist={['https://*', 'http://*', `${REDIRECT_SCHEME}://*`]}
                onNavigationStateChange={handleWebViewNavigation}
                onShouldStartLoadWithRequest={(request) => {
                  if (isCustomerAuthCallback(request.url)) {
                    void handleAuthCallback(request.url);
                    return false;
                  }
                  return true;
                }}
                startInLoadingState
                renderLoading={() => (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.brand} />
                  </View>
                )}
                sharedCookiesEnabled
                thirdPartyCookiesEnabled
              />
            )}
          </View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBack onBack={() => closeOverlay()}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 pb-8 pt-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.cream }}
        >
          <Text
            className="text-center text-2xl font-semibold"
            style={{ fontFamily: 'Georgia', color: colors.text }}
          >
            Sign In
          </Text>
          <Text className="mt-3 text-center text-sm" style={{ color: colors.textMuted }}>
            We&apos;ll email you a one-time code — no password needed.
          </Text>

          {displayError ? (
            <Text className="mt-4 text-center text-sm text-red-600">{displayError}</Text>
          ) : null}

          <View className="mt-8">
            <Text className="text-sm font-medium" style={{ color: colors.text }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError(null);
                clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              className="mt-2 rounded-lg border px-4 py-3.5 text-base"
              style={inputStyle}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue"
            className="mt-6 items-center rounded-full py-4"
            style={{
              backgroundColor: colors.brandDark,
              opacity: isPreparingCode || isLoading ? 0.7 : 1,
            }}
            disabled={isPreparingCode || isLoading}
            onPress={() => void handleContinue()}
          >
            {isPreparingCode ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-semibold text-white">Continue</Text>
            )}
          </Pressable>

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
            <Text className="mx-4 text-sm" style={{ color: colors.textMuted }}>
              or
            </Text>
            <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create account"
            className="items-center rounded-full border py-4"
            style={{ borderColor: colors.brandDark, backgroundColor: colors.background }}
            onPress={() => void openExternalUrl(CUSTOMER_REGISTER_URL)}
          >
            <Text className="text-base font-semibold" style={{ color: colors.brandDark }}>
              Create Account
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}
