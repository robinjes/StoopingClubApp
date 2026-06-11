import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import type { AccountStackParamList } from '../../navigation/stacks/AccountStack';

type SignInEmailNavigation = NativeStackNavigationProp<AccountStackParamList, 'SignInEmail'>;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function SignInEmailScreen() {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const navigation = useNavigation<SignInEmailNavigation>();
  const { isConfigured, clearError, error } = useCustomer();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  function handleContinue() {
    if (!isConfigured) {
      return;
    }

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setLocalError('Enter a valid email address to continue.');
      return;
    }

    setLocalError(null);
    clearError();
    navigation.navigate('CustomerSignIn', { mode: 'email' });
  }

  return (
    <ScreenLayout
      showBack
      onBack={() => (navigation.canGoBack() ? navigation.goBack() : closeOverlay())}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-6 pt-8">
          <Text
            className="text-center text-3xl"
            style={{ fontFamily: 'Georgia', color: colors.text }}
          >
            Sign in with email
          </Text>

          <Text className="mt-3 text-center text-base leading-6" style={{ color: colors.textMuted }}>
            Enter your email, then continue to Shopify&apos;s secure sign-in page to finish logging
            in.
          </Text>

          <Text className="mt-8 text-sm font-medium" style={{ color: colors.textMuted }}>
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setLocalError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            className="mt-2 rounded-xl border px-4 py-3.5 text-base"
            style={{
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.background,
            }}
          />

          {localError ? (
            <Text className="mt-3 text-sm text-red-600">{localError}</Text>
          ) : null}
          {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}

          {!isConfigured ? (
            <View className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <Text className="text-sm leading-5 text-amber-900">
                Customer login is not configured yet. Add your Customer Account API client ID to
                enable sign in.
              </Text>
            </View>
          ) : (
            <Pressable
              className="mt-6 items-center rounded-full py-4"
              style={{ backgroundColor: colors.brand }}
              onPress={handleContinue}
            >
              <Text className="text-base font-semibold text-white">Continue with email</Text>
            </Pressable>
          )}

          <Pressable className="mt-5 items-center py-2" onPress={() => navigation.navigate('SignInShop')}>
            <Text className="text-sm font-medium" style={{ color: colors.brand }}>
              Sign in with shop instead
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}
