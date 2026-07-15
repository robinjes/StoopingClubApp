import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';

import AnimatedPressable from '../../components/feedback/AnimatedPressable';
import CartItemRow from '../../components/feedback/CartItemRow';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useFeedback } from '../../context/FeedbackContext';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay } from '../../context/OverlayContext';
import { useCartRetailEnrichment } from '../../hooks/useCartRetailEnrichment';
import type { CartStackParamList } from '../../navigation/stacks/CartStack';
import { navigateToShopTab } from '../../navigation/rootNavigation';
import { isShopifyConfigured } from '../../services/shopify';
import { useProductStore } from '../../store/productStore';
import { useRetailValueStore } from '../../store/retailValueStore';
import { useTheme } from '../../context/ThemeContext';
import { formatPriceWithCode } from '../../utils/formatPrice';
import { moneyAmount } from '../../utils/estRetailValue';

type CartNavigation = NativeStackNavigationProp<CartStackParamList>;

export default function CartScreen() {
  const { colors } = useTheme();
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
  const { haptic } = useFeedback();
  const { checkoutRestricted, noShowCount } = useCustomer();
  const products = useProductStore((state) => state.products);
  const retailByHandle = useRetailValueStore((state) => state.byHandle);
  const isEnrichingRetail = useCartRetailEnrichment(itemCount > 0);

  const currencyCode = cart?.subtotal.currencyCode ?? 'USD';

  const youSavedAmount = useMemo(() => {
    if (!cart?.lines.length) {
      return 0;
    }

    return cart.lines.reduce((total, line) => {
      const catalog = products.find(
        (product) =>
          product.title === line.title ||
          product.variants.some((variant) => variant.id === line.merchandiseId),
      );
      const handle = line.productHandle ?? catalog?.handle ?? '';
      const catalogVariant = catalog?.variants.find(
        (variant) => variant.id === line.merchandiseId,
      );
      const compareAtRetail = moneyAmount(
        catalogVariant?.compareAtPrice ?? catalog?.compareAtPrice,
      );
      const unitRetail =
        line.estRetailValue ??
        catalog?.estRetailValue ??
        retailByHandle[handle] ??
        (compareAtRetail > 0 ? compareAtRetail : 0);
      const paid = moneyAmount(line.price) * line.quantity;
      const retail = unitRetail * line.quantity;
      return total + Math.max(0, retail - paid);
    }, 0);
  }, [cart?.lines, products, retailByHandle]);

  function handleCheckout() {
    if (!checkoutUrl || checkoutRestricted) {
      return;
    }

    haptic('medium');
    cartNavigation.navigate('Checkout', { checkoutUrl });
  }

  function handleTestCelebration() {
    cartNavigation.push('OrderConfirmation', {
      items: [{ title: 'Test item', quantity: 1 }],
      orderedAt: new Date().toISOString(),
    });
  }

  return (
    <ScreenLayout>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-2xl text-brand"
            style={{ fontFamily: 'Georgia', color: colors.brand }}
          >
            Cart
          </Text>
          {itemCount > 0 ? (
            <View
              className="min-w-[28px] items-center rounded-full px-2 py-1"
              style={{ backgroundColor: colors.surfaceMuted }}
            >
              <Text className="text-sm font-semibold" style={{ color: colors.textMuted }}>
                {itemCount}
              </Text>
            </View>
          ) : null}
        </View>

        {__DEV__ ? (
          <AnimatedPressable
            haptic="selection"
            className="mt-3 self-start rounded-lg border px-3 py-2"
            style={{ borderColor: colors.border }}
            onPress={handleTestCelebration}
          >
            <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Test order celebration
            </Text>
          </AnimatedPressable>
        ) : null}

        {!isShopifyConfigured() ? (
          <Text className="mt-3 text-sm text-red-600">
            Shopify is not configured. Check your .env credentials.
          </Text>
        ) : null}

        {error ? (
          <AnimatedPressable
            haptic="error"
            className="mt-3 rounded-xl bg-red-50 px-4 py-3"
            onPress={clearError}
          >
            <Text className="text-sm text-red-700">{error}</Text>
          </AnimatedPressable>
        ) : null}

        {isLoading && itemCount === 0 ? (
          <View className="mt-12 items-center">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}

        {!isLoading && itemCount === 0 ? (
          <View className="mt-8 items-center px-4">
            <Image
              source={require('../../../assets/sadstoopy.png')}
              className="h-52 w-52"
              resizeMode="contain"
              accessibilityLabel="Sad Stoopy"
            />
            <Text className="mt-4 text-base text-gray-600 dark:text-gray-400">
              Your cart is empty
            </Text>
            <AnimatedPressable
              haptic="medium"
              pressedScale={0.97}
              className="mt-4 rounded-xl px-5 py-3"
              style={{ backgroundColor: colors.brand }}
              onPress={() => {
                closeOverlay();
                navigateToShopTab();
              }}
            >
              <Text className="font-semibold text-white">Start a cart</Text>
            </AnimatedPressable>
          </View>
        ) : null}

        {itemCount > 0 ? (
          <View className="mt-4 flex-1">
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-4"
            >
              {cart?.lines.map((line) => (
                <CartItemRow
                  key={line.id}
                  line={line}
                  onUpdateQuantity={(lineId, quantity) => void updateItem(lineId, quantity)}
                  onRemove={(lineId) => void removeItem(lineId)}
                />
              ))}
            </ScrollView>

            <View className="border-t border-gray-200 pt-4 dark:border-gray-800">
              {checkoutRestricted ? (
                <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <Text className="text-sm font-semibold text-red-800">Checkout paused</Text>
                  <Text className="mt-1 text-sm leading-5 text-red-700">
                    You have {noShowCount} recent no-shows. Pick up existing orders or contact the
                    team before placing a new one.
                  </Text>
                </View>
              ) : null}

              <View className="mb-1 flex-row items-center justify-between py-2">
                <Text className="text-base" style={{ color: colors.text }}>
                  You Saved
                </Text>
                {isEnrichingRetail ? (
                  <ActivityIndicator size="small" color={colors.brand} />
                ) : (
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>
                    {formatPriceWithCode({
                      amount: String(youSavedAmount),
                      currencyCode,
                    })}
                  </Text>
                )}
              </View>

              <View className="mb-2 flex-row items-center justify-between py-2">
                <Text className="text-base font-bold" style={{ color: colors.text }}>
                  Total
                </Text>
                <Text className="text-base font-bold" style={{ color: colors.text }}>
                  {formatPriceWithCode(cart?.subtotal ?? { amount: '0', currencyCode })}
                </Text>
              </View>

              <Text className="mb-4 text-xs leading-5" style={{ color: colors.textMuted }}>
                All items are free. Local pickup only. No returns.
              </Text>

              <AnimatedPressable
                haptic="medium"
                pressedScale={0.97}
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
                  <Text className="text-base font-semibold text-white">Check out</Text>
                )}
              </AnimatedPressable>
            </View>
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
}
