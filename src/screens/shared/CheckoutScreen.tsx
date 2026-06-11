import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCart } from '../../context/CartContext';
import type { CartStackParamList } from '../../navigation/stacks/CartStack';
import { sendOrderConfirmationMessage } from '../../services/notifications/orderConfirmation';
import { useTheme } from '../../context/ThemeContext';
import { isCheckoutCompleteUrl } from '../../utils/checkout';

type CheckoutScreenProps = NativeStackScreenProps<CartStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation, route }: CheckoutScreenProps) {
  const { colors } = useTheme();
  const { checkoutUrl } = route.params;
  const { cart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const hasCompletedRef = useRef(false);

  async function handleCheckoutComplete() {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;

    const items =
      cart?.lines.map((line) => ({
        title: line.title,
        quantity: line.quantity,
      })) ?? [];
    const orderedAt = new Date().toISOString();

    await clearCart();
    void sendOrderConfirmationMessage(items, new Date(orderedAt));

    navigation.replace('OrderConfirmation', { items, orderedAt });
  }

  return (
    <ScreenLayout showBack>
      <View className="flex-1">
        {isLoading ? (
          <View className="absolute inset-0 z-10 items-center justify-center bg-white dark:bg-gray-950">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}
        <WebView
          source={{ uri: checkoutUrl }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={(event) => {
            if (isCheckoutCompleteUrl(event.url)) {
              void handleCheckoutComplete();
            }
          }}
          style={{ flex: 1 }}
        />
      </View>
    </ScreenLayout>
  );
}
