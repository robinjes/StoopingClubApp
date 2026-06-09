import { Pressable, Text, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCart } from '../../context/CartContext';
import { isShopifyConfigured } from '../../services/shopify';
import { colors } from '../../theme/colors';

export default function CartScreen() {
  const { cart, itemCount, checkoutUrl, isLoading, initializeCart } = useCart();

  return (
    <ScreenLayout showBack>
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-gray-900">Cart</Text>

        {!isShopifyConfigured() ? (
          <Text className="mt-3 text-sm text-gray-500">
            Shopify is not configured yet. Add your Storefront API credentials to load cart
            data.
          </Text>
        ) : null}

        {itemCount === 0 ? (
          <View className="mt-8 items-center">
            <Text className="text-base text-gray-600">Your cart is empty.</Text>
            <Pressable
              className="mt-4 rounded-lg px-4 py-3"
              style={{ backgroundColor: colors.brand }}
              onPress={() => void initializeCart()}
            >
              <Text className="font-semibold text-white">
                {isLoading ? 'Loading...' : 'Initialize Shopify Cart'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-4">
            {cart?.lines.map((line) => (
              <View
                key={line.id}
                className="mb-3 flex-row items-center justify-between rounded-xl border border-gray-200 p-4"
              >
                <View className="flex-1 pr-3">
                  <Text className="font-medium text-gray-900">{line.title}</Text>
                  <Text className="mt-1 text-sm text-gray-500">Qty: {line.quantity}</Text>
                </View>
                <Text className="font-semibold text-gray-900">
                  ${line.price.amount}
                </Text>
              </View>
            ))}

            <Text className="mt-2 text-base font-semibold text-gray-900">
              Subtotal: ${cart?.subtotal.amount ?? '0.00'}
            </Text>

            {checkoutUrl ? (
              <Text className="mt-3 text-sm text-gray-500">
                Checkout URL ready: open in WebView or browser when wired up.
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}
