import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import type { AccountStackParamList } from '../../navigation/stacks/AccountStack';
import {
  clearLocalUserData,
  requestAccountDeletion,
} from '../../services/account/accountDeletion';
import { fetchCustomerProfile, getValidCustomerAccessToken } from '../../services/shopify/customerAuth';
import type { CustomerProfile } from '../../types/customer';
import { getCustomerFullName } from '../../utils/customerDisplay';

type ProfileNavigation = NativeStackNavigationProp<AccountStackParamList, 'Profile'>;

export default function AccountProfileScreen() {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const { soundsEnabled, setSoundsEnabled } = useFeedback();
  const navigation = useNavigation<ProfileNavigation>();
  const { isConfigured, logout, error: contextError } = useCustomer();
  const { clearCart } = useCart();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = await getValidCustomerAccessToken();
      if (!accessToken) {
        setProfile(null);
        return;
      }

      const nextProfile = await fetchCustomerProfile(accessToken);
      setProfile(nextProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load profile.';
      setError(message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSignOut() {
    await logout();
    setProfile(null);
    closeOverlay();
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your Stooping Club account and personal data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void handleDeleteAccount() },
      ],
    );
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setError(null);

    try {
      const accessToken = await getValidCustomerAccessToken();
      if (!accessToken) {
        throw new Error('Your session has expired. Sign in again to delete your account.');
      }

      // Server-side call: verifies the customer token, then deletes the
      // Shopify customer (no orders) or files a data-erasure request (has orders).
      const result = await requestAccountDeletion(accessToken);

      await clearLocalUserData();
      await clearCart();
      await logout();
      setProfile(null);

      Alert.alert(
        result === 'deleted' ? 'Account deleted' : 'Deletion requested',
        result === 'deleted'
          ? 'Your account and personal data have been deleted. You are now signed out.'
          : 'Because your account has order history, we submitted a data-erasure request to our store provider. Your data will be removed within a few days. You are now signed out.',
        [{ text: 'OK', onPress: () => closeOverlay() }],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete your account.';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const displayError = error ?? contextError;

  return (
    <ScreenLayout showBack onBack={() => closeOverlay()}>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.cream }}
        contentContainerClassName="px-4 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-3xl leading-10"
          style={{ fontFamily: 'Georgia', color: colors.brandDark }}
        >
          Profile
        </Text>

        {isLoading ? (
          <View className="mt-12 items-center">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}

        {!isLoading && !isConfigured ? (
          <Text className="mt-6 text-sm leading-6" style={{ color: colors.textMuted }}>
            Sign in is not available until Shopify storefront credentials are configured.
          </Text>
        ) : null}

        {!isLoading && displayError ? (
          <Text className="mt-4 text-sm text-red-600">{displayError}</Text>
        ) : null}

        {!isLoading && !profile ? (
          <View className="mt-10 items-center">
            <Ionicons name="person-circle-outline" size={72} color={colors.textMuted} />
            <Text className="mt-4 text-center text-base leading-6" style={{ color: colors.textMuted }}>
              Sign in to view your profile.
            </Text>
            <Pressable
              className="mt-6 rounded-full px-8 py-3.5"
              style={{ backgroundColor: colors.brandDark }}
              onPress={() => navigation.navigate('SignInShop')}
            >
              <Text className="font-semibold text-white">Sign In</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && profile ? (
          <View className="mt-6">
            <View
              className="mb-4 rounded-3xl border px-5 py-4"
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    UI sounds
                  </Text>
                  <Text className="mt-1 text-xs leading-5" style={{ color: colors.textMuted }}>
                    Subtle taps, swooshes, and chimes. Respects silent mode.
                  </Text>
                </View>
                <Switch
                  value={soundsEnabled}
                  onValueChange={setSoundsEnabled}
                  trackColor={{ false: colors.border, true: colors.brand }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View
              className="rounded-3xl border px-5 py-6"
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
            >
              <Text className="text-sm font-medium" style={{ color: colors.brand }}>
                Name
              </Text>
              <Text
                className="mt-2 text-xl"
                style={{ fontFamily: 'Georgia', color: colors.text }}
              >
                {getCustomerFullName(profile)}
              </Text>

              <Text className="mt-6 text-sm font-medium" style={{ color: colors.brand }}>
                Email
              </Text>
              <Text className="mt-2 text-base" style={{ color: colors.text }}>
                {profile.email ?? '—'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              className="mt-8 items-center self-center rounded-full px-8 py-3.5"
              style={{ backgroundColor: colors.brandDark }}
              disabled={isDeleting}
              onPress={() => void handleSignOut()}
            >
              <Text className="text-sm font-semibold text-white">Sign Out</Text>
            </Pressable>

            <View
              className="mt-10 rounded-3xl border px-5 py-5"
              style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}
            >
              <Text className="text-sm font-semibold" style={{ color: '#B91C1C' }}>
                Delete account
              </Text>
              <Text className="mt-1 text-xs leading-5" style={{ color: '#991B1B' }}>
                Permanently deletes your account and personal data. This cannot be undone.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete account"
                className="mt-4 items-center self-start rounded-full border px-6 py-2.5"
                style={{ borderColor: '#DC2626', opacity: isDeleting ? 0.6 : 1 }}
                disabled={isDeleting}
                onPress={confirmDeleteAccount}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Text className="text-sm font-semibold" style={{ color: '#DC2626' }}>
                    Delete Account
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}
