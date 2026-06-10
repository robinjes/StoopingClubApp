import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCart } from '../../context/CartContext';
import type { CartStackParamList } from '../../navigation/stacks/CartStack';
import { colors } from '../../theme/colors';
import { isCheckoutCompleteUrl } from '../../utils/checkout';

type CheckoutScreenProps = NativeStackScreenProps<CartStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation, route }: CheckoutScreenProps) {
  const { checkoutUrl } = route.params;
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const hasCompletedRef = useRef(false);

  async function handleCheckoutComplete() {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    await clearCart();
    navigation.replace('OrderConfirmation');
  }

  return (
    <ScreenLayout showBack>
      <View className="flex-1">
        {isLoading ? (
          <View className="absolute inset-0 z-10 items-center justify-center bg-white">
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
