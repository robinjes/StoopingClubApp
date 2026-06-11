import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import type { AccountStackParamList } from '../../navigation/stacks/AccountStack';
import { getCustomerFullName } from '../../utils/customerDisplay';

type ProfileNavigation = NativeStackNavigationProp<AccountStackParamList, 'Profile'>;

export default function AccountProfileScreen() {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const navigation = useNavigation<ProfileNavigation>();
  const {
    isConfigured,
    isAuthenticated,
    isLoading,
    profile,
    addresses,
    logout,
    error,
  } = useCustomer();

  async function handleSignOut() {
    await logout();
    closeOverlay();
  }

  return (
    <ScreenLayout showBack onBack={() => closeOverlay()}>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.cream }}
        contentContainerClassName="px-4 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold" style={{ color: colors.text }}>
          Profile
        </Text>

        {isLoading ? (
          <View className="mt-12 items-center">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}

        {!isLoading && !isConfigured ? (
          <Text className="mt-6 text-sm leading-6" style={{ color: colors.textMuted }}>
            Customer login is not configured yet.
          </Text>
        ) : null}

        {!isLoading && isConfigured && !isAuthenticated ? (
          <View className="mt-10 items-center">
            <Ionicons name="person-circle-outline" size={72} color={colors.textMuted} />
            <Text className="mt-4 text-center text-base leading-6" style={{ color: colors.textMuted }}>
              Sign in to view your profile, orders, and pickup history.
            </Text>
            {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}
            <Pressable
              className="mt-6 rounded-full px-8 py-3.5"
              style={{ backgroundColor: colors.brand }}
              onPress={() => navigation.navigate('CustomerSignIn', { mode: 'shop' })}
            >
              <Text className="font-semibold text-white">Sign in</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && isAuthenticated && profile ? (
          <View className="mt-6">
            <View
              className="rounded-2xl border px-4 py-4"
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold" style={{ color: colors.text }}>
                  {getCustomerFullName(profile)}
                </Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Edit name">
                  <Ionicons name="pencil-outline" size={18} color={colors.brand} />
                </Pressable>
              </View>

              <Text className="mt-5 text-sm" style={{ color: colors.textMuted }}>
                Email
              </Text>
              <Text className="mt-1 text-base" style={{ color: colors.text }}>
                {profile.email ?? '—'}
              </Text>
            </View>

            <View
              className="mt-4 rounded-2xl border px-4 py-4"
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold" style={{ color: colors.text }}>
                  Addresses
                </Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Add address">
                  <Text className="text-base font-medium" style={{ color: colors.brand }}>
                    + Add
                  </Text>
                </Pressable>
              </View>

              {addresses.length === 0 ? (
                <View
                  className="mt-4 flex-row items-center gap-2 rounded-xl border px-3 py-3"
                  style={{ borderColor: colors.border, backgroundColor: colors.surfaceMuted }}
                >
                  <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
                  <Text className="text-sm" style={{ color: colors.textMuted }}>
                    No addresses added
                  </Text>
                </View>
              ) : (
                addresses.map((address) => (
                  <View
                    key={address.id}
                    className="mt-4 rounded-xl border px-3 py-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.surfaceMuted }}
                  >
                    <Text className="text-sm leading-5" style={{ color: colors.text }}>
                      {address.formatted ||
                        [address.address1, address.city, address.provinceCode, address.zip]
                          .filter(Boolean)
                          .join(', ')}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View className="mt-8 flex-row flex-wrap items-center gap-4">
              <Pressable
                className="rounded-xl border px-6 py-3"
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                onPress={() => void handleSignOut()}
              >
                <Text className="font-medium" style={{ color: colors.brand }}>
                  Sign out
                </Text>
              </Pressable>

              <Pressable accessibilityRole="button" onPress={() => void handleSignOut()}>
                <Text className="font-medium" style={{ color: colors.brand }}>
                  Sign out of all devices
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}
