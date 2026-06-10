import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import type { CartStackParamList } from '../../navigation/stacks/CartStack';
import { navigateToShopTab } from '../../navigation/rootNavigation';
import { isShopifyConfigured } from '../../services/shopify';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils/formatPrice';

type CartNavigation = NativeStackNavigationProp<CartStackParamList>;

export default function CartScreen() {
  const cartNavigation = useNavigation<CartNavigation>();
  const { closeOverlay } = useOverlay();
  const {
    cart,
    itemCount,
    checkoutUrl,
    isLoading,
    error,
    updateItem,
    removeItem,
    clearError,
  } = useCart();
  const { checkoutRestricted, noShowCount } = useCustomer();

  function handleCheckout() {
    if (!checkoutUrl || checkoutRestricted) {
      return;
    }

    cartNavigation.navigate('Checkout', { checkoutUrl });
  }

  return (
    <ScreenLayout>
      <View className="flex-1 px-4 pt-4">
        <Text
          className="text-2xl text-brand"
          style={{ fontFamily: 'Georgia', color: colors.brand }}
        >
          Cart
        </Text>

        {!isShopifyConfigured() ? (
          <Text className="mt-3 text-sm text-red-600">
            Shopify is not configured. Check your .env credentials.
          </Text>
        ) : null}

        {error ? (
          <Pressable className="mt-3 rounded-xl bg-red-50 px-4 py-3" onPress={clearError}>
            <Text className="text-sm text-red-700">{error}</Text>
          </Pressable>
        ) : null}

        {isLoading && itemCount === 0 ? (
          <View className="mt-12 items-center">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}

        {!isLoading && itemCount === 0 ? (
          <View className="mt-8 items-center">
            <Text className="text-base text-gray-600">Your cart is empty.</Text>
            <Text className="mt-2 text-center text-sm text-gray-500">
              Browse the shop and tap Add on any item.
            </Text>
            <Pressable
              className="mt-4 rounded-xl px-5 py-3"
              style={{ backgroundColor: colors.brand }}
              onPress={() => {
                closeOverlay();
                navigateToShopTab();
              }}
            >
              <Text className="font-semibold text-white">Start a cart</Text>
            </Pressable>
          </View>
        ) : null}

        {itemCount > 0 ? (
          <View className="mt-4 flex-1">
            {cart?.lines.map((line) => (
              <View
                key={line.id}
                className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white p-3"
              >
                <View className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                  {line.imageUrl ? (
                    <Image source={{ uri: line.imageUrl }} className="h-full w-full" />
                  ) : null}
                </View>

                <View className="ml-3 flex-1">
                  <Text className="font-medium text-gray-900" numberOfLines={2}>
                    {line.title}
                  </Text>
                  <Text className="mt-1 text-sm font-semibold" style={{ color: colors.brand }}>
                    {formatPrice(line.price)}
                  </Text>

                  <View className="mt-2 flex-row items-center gap-3">
                    <Pressable
                      className="h-8 w-8 items-center justify-center rounded-full border border-gray-200"
                      onPress={() => void updateItem(line.id, Math.max(1, line.quantity - 1))}
                    >
                      <Text className="text-base text-gray-700">−</Text>
                    </Pressable>
                    <Text className="min-w-[20px] text-center text-sm font-medium">
                      {line.quantity}
                    </Text>
                    <Pressable
                      className="h-8 w-8 items-center justify-center rounded-full border border-gray-200"
                      onPress={() => void updateItem(line.id, line.quantity + 1)}
                    >
                      <Text className="text-base text-gray-700">+</Text>
                    </Pressable>
                    <Pressable className="ml-auto" onPress={() => void removeItem(line.id)}>
                      <Text className="text-sm text-red-600">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            <View className="mt-auto border-t border-gray-200 pt-4">
              {checkoutRestricted ? (
                <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <Text className="text-sm font-semibold text-red-800">Checkout paused</Text>
                  <Text className="mt-1 text-sm leading-5 text-red-700">
                    You have {noShowCount} recent no-shows. Pick up existing orders or contact the
                    team before placing a new one.
                  </Text>
                </View>
              ) : null}

              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-base text-gray-600">Subtotal</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {formatPrice(cart?.subtotal ?? { amount: '0', currencyCode: 'USD' })}
                </Text>
              </View>

              <Pressable
                className="items-center rounded-xl py-4"
                style={{
                  backgroundColor: colors.brand,
                  opacity: checkoutUrl && !checkoutRestricted ? 1 : 0.5,
                }}
                disabled={!checkoutUrl || isLoading || checkoutRestricted}
                onPress={handleCheckout}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-base font-semibold text-white">Checkout</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
}
