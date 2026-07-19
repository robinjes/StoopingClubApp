import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, View } from 'react-native';

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
    updateCheckoutDetails,
    clearError,
  } = useCart();
  const { haptic } = useFeedback();
  const { checkoutRestricted, noShowCount } = useCustomer();
  const products = useProductStore((state) => state.products);
  const retailByHandle = useRetailValueStore((state) => state.byHandle);
  const isEnrichingRetail = useCartRetailEnrichment(itemCount > 0);
  const [orderNote, setOrderNote] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const currencyCode = cart?.subtotal.currencyCode ?? 'USD';

  useEffect(() => {
    setOrderNote(cart?.note ?? '');
    setPhoneNumber(cart?.attributes.find(({ key }) => key === 'Mobile number')?.value ?? '');
    setPhoneError(null);
  }, [cart?.id]);

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

  async function handleCheckout() {
    if (!checkoutUrl || checkoutRestricted) {
      return;
    }

    const formattedPhoneNumber = phoneNumber.trim();
    if (formattedPhoneNumber.replace(/\D/g, '').length < 7) {
      setPhoneError('Enter a valid mobile number to continue.');
      return;
    }

    setPhoneError(null);
    haptic('medium');
    try {
      await updateCheckoutDetails(orderNote.trim(), formattedPhoneNumber);
    } catch {
      return;
    }

    cartNavigation.navigate('Checkout', { checkoutUrl });
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
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="pb-8"
            >
              {cart?.lines.map((line) => (
                <CartItemRow
                  key={line.id}
                  line={line}
                  onUpdateQuantity={(lineId, quantity) => void updateItem(lineId, quantity)}
                  onRemove={(lineId) => void removeItem(lineId)}
                />
              ))}

              <View className="mt-1 border-t border-gray-200 pt-4 dark:border-gray-800">
                {checkoutRestricted ? (
                  <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <Text className="text-sm font-semibold text-red-800">Checkout paused</Text>
                    <Text className="mt-1 text-sm leading-5 text-red-700">
                      You have {noShowCount} recent no-shows. Pick up existing orders or contact the
                      team before placing a new one.
                    </Text>
                  </View>
                ) : null}

              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                  Order notes <Text style={{ color: colors.textMuted }}>(optional)</Text>
                </Text>
                <TextInput
                  value={orderNote}
                  onChangeText={setOrderNote}
                  placeholder="Add pickup notes or special instructions"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                  className="min-h-[88px] rounded-xl border px-3 py-3 text-base"
                  style={{ borderColor: colors.border, color: colors.text }}
                />
              </View>

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

              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                  Mobile number <Text className="text-red-600">*</Text>
                </Text>
                <TextInput
                  value={phoneNumber}
                  onChangeText={(value) => {
                    setPhoneNumber(value);
                    if (phoneError) {
                      setPhoneError(null);
                    }
                  }}
                  placeholder="(555) 555-5555"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  className="rounded-xl border px-3 py-3 text-base"
                  style={{
                    borderColor: phoneError ? '#DC2626' : colors.border,
                    color: colors.text,
                  }}
                />
                <Text className="mt-2 text-xs leading-5" style={{ color: colors.textMuted }}>
                  We’ll text pickup details. A mobile number is required to proceed.
                </Text>
                {phoneError ? <Text className="mt-1 text-xs text-red-600">{phoneError}</Text> : null}
              </View>

              <AnimatedPressable
                haptic="medium"
                pressedScale={0.97}
                className="items-center rounded-xl py-4"
                style={{
                  backgroundColor: colors.brand,
                  opacity: checkoutUrl && !checkoutRestricted ? 1 : 0.5,
                }}
                disabled={!checkoutUrl || isLoading || checkoutRestricted}
                onPress={() => void handleCheckout()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-base font-semibold text-white">Check out</Text>
                )}
              </AnimatedPressable>
              </View>
            </ScrollView>
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
}
