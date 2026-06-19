import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import type { AccountStackParamList } from '../../navigation/stacks/AccountStack';
import { fetchCustomerProfile, getValidCustomerAccessToken } from '../../services/shopify/customerAuth';
import type { CustomerProfile } from '../../types/customer';
import { getCustomerFullName } from '../../utils/customerDisplay';

type ProfileNavigation = NativeStackNavigationProp<AccountStackParamList, 'Profile'>;

export default function AccountProfileScreen() {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const navigation = useNavigation<ProfileNavigation>();
  const { isConfigured, logout, error: contextError } = useCustomer();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
              onPress={() => void handleSignOut()}
            >
              <Text className="text-sm font-semibold text-white">Sign Out</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}
