import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { MAX_NO_SHOWS_BEFORE_RESTRICTION } from '../../constants/noShow';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { getCurrentPickupSite } from '../../data/pickupSeason';
import { useTheme } from '../../context/ThemeContext';
import type { CustomerOrder } from '../../types/customer';
import {
  formatPickupSunday,
  getOrderPickupStatus,
  getPickupStatusLabel,
} from '../../utils/noShow';

function statusColors(
  status: ReturnType<typeof getOrderPickupStatus>,
  colors: ReturnType<typeof useTheme>['colors'],
) {
  switch (status) {
    case 'picked_up':
      return { bg: '#E8F0E2', text: colors.brand, border: colors.brand };
    case 'confirmed':
      return { bg: colors.cardActive, text: colors.brandDark, border: colors.brand };
    case 'no_show':
      return { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' };
    default:
      return { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' };
  }
}

function OrderCard({
  order,
  confirmingOrderId,
  onConfirmPickup,
}: {
  order: CustomerOrder;
  confirmingOrderId: string | null;
  onConfirmPickup: (orderId: string) => void;
}) {
  const { colors } = useTheme();
  const status = getOrderPickupStatus(order);
  const palette = statusColors(status, colors);
  const isConfirming = confirmingOrderId === order.id;

  return (
    <View
      className="mb-3 rounded-2xl border p-4"
      style={{ borderColor: palette.border, backgroundColor: colors.background }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">{order.name}</Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pickup {formatPickupSunday(order)}
          </Text>
        </View>
        <View className="rounded-full px-3 py-1" style={{ backgroundColor: palette.bg }}>
          <Text className="text-xs font-semibold" style={{ color: palette.text }}>
            {getPickupStatusLabel(status)}
          </Text>
        </View>
      </View>

      {status === 'awaiting_confirmation' ? (
        <Pressable
          className="mt-4 items-center rounded-xl py-3"
          style={{ backgroundColor: colors.brand, opacity: isConfirming ? 0.7 : 1 }}
          disabled={isConfirming}
          onPress={() => onConfirmPickup(order.id)}
        >
          {isConfirming ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-sm font-semibold text-white">I&apos;ll be there Sunday</Text>
          )}
        </Pressable>
      ) : null}

      {status === 'no_show' ? (
        <Text className="mt-3 text-sm leading-5 text-red-700">
          This order was not picked up on Sunday. Repeated no-shows may limit future orders.
        </Text>
      ) : null}
    </View>
  );
}

type PickupsScreenProps = {
  onClose?: () => void;
};

export default function PickupsScreen({ onClose }: PickupsScreenProps) {
  const { colors } = useTheme();
  const { openAccount } = useOverlay();
  const {
    isConfigured,
    isAuthenticated,
    isLoading,
    isRefreshingOrders,
    profile,
    orders,
    noShowCount,
    checkoutRestricted,
    error,
    logout,
    refreshOrders,
    confirmPickup,
    clearError,
  } = useCustomer();

  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const pickupSite = getCurrentPickupSite();

  useFocusEffect(
    useCallback(() => {
      void refreshOrders();
    }, [refreshOrders]),
  );

  const activeOrders = useMemo(
    () =>
      orders.filter((order) => {
        const status = getOrderPickupStatus(order);
        return status !== 'picked_up';
      }),
    [orders],
  );

  const pastNoShows = useMemo(
    () => orders.filter((order) => getOrderPickupStatus(order) === 'no_show'),
    [orders],
  );

  function handleLogin() {
    clearError();
    openAccount('SignInShop');
  }

  async function handleConfirmPickup(orderId: string) {
    setConfirmingOrderId(orderId);
    clearError();

    try {
      await confirmPickup(orderId);
    } catch {
      // Error is stored in context.
    } finally {
      setConfirmingOrderId(null);
    }
  }

  return (
    <ScreenLayout showBack onBack={onClose}>
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerClassName="pb-10"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingOrders}
            onRefresh={() => void refreshOrders()}
            tintColor={colors.brand}
          />
        }
      >
        <Text
          className="text-2xl text-gray-900 dark:text-gray-100"
          style={{ fontFamily: 'Georgia', color: colors.brand }}
        >
          My pickups
        </Text>
        <Text className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-400">
          Confirm before Sunday, then pick up at {pickupSite.name}. We track no-shows to keep pickup
          fair for everyone.
        </Text>

        {!isConfigured ? (
          <View className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="text-sm leading-5 text-amber-900">
              Shopify is not configured yet. Add your storefront credentials to enable sign in.
            </Text>
          </View>
        ) : null}

        {error ? (
          <Pressable className="mt-4 rounded-xl bg-red-50 px-4 py-3" onPress={clearError}>
            <Text className="text-sm text-red-700">{error}</Text>
          </Pressable>
        ) : null}

        {isLoading ? (
          <View className="mt-12 items-center">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}

        {!isLoading && isConfigured && !isAuthenticated ? (
          <View className="mt-8 items-center">
            <Ionicons name="person-circle-outline" size={56} color={colors.textMuted} />
            <Text className="mt-4 text-center text-base text-gray-700 dark:text-gray-300">
              Sign in with your Stooping Club account to view orders and confirm pickup.
            </Text>
            <Pressable
              className="mt-5 rounded-xl px-6 py-3.5"
              style={{ backgroundColor: colors.brand }}
              onPress={handleLogin}
            >
              <Text className="font-semibold text-white">Sign in</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && isAuthenticated ? (
          <>
            <View
              className="mt-6 rounded-2xl border px-4 py-4"
              style={{ borderColor: colors.border, backgroundColor: colors.cardActive }}
            >
              <Text className="text-sm text-gray-600 dark:text-gray-400">Signed in as</Text>
              <Text className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                {profile?.firstName
                  ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`
                  : profile?.email ?? 'Stooping Club member'}
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  No-shows: {noShowCount} / {MAX_NO_SHOWS_BEFORE_RESTRICTION}
                </Text>
                <Pressable onPress={() => void logout()}>
                  <Text className="text-sm font-medium" style={{ color: colors.brand }}>
                    Sign out
                  </Text>
                </Pressable>
              </View>
              {checkoutRestricted ? (
                <Text className="mt-3 text-sm leading-5 text-red-700">
                  Checkout is paused until you pick up existing orders or contact the team about
                  past no-shows.
                </Text>
              ) : null}
            </View>

            <Text className="mb-3 mt-8 text-base font-semibold text-gray-900 dark:text-gray-100">Active orders</Text>
            {activeOrders.length === 0 ? (
              <Text className="text-sm text-gray-500 dark:text-gray-400">No upcoming pickups right now.</Text>
            ) : (
              activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  confirmingOrderId={confirmingOrderId}
                  onConfirmPickup={(orderId) => void handleConfirmPickup(orderId)}
                />
              ))
            )}

            {pastNoShows.length > 0 ? (
              <>
                <Text className="mb-3 mt-8 text-base font-semibold text-gray-900 dark:text-gray-100">
                  No-show history
                </Text>
                {pastNoShows.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    confirmingOrderId={confirmingOrderId}
                    onConfirmPickup={(orderId) => void handleConfirmPickup(orderId)}
                  />
                ))}
              </>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}
