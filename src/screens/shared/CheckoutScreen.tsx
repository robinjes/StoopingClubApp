import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

import ScreenLayout from '../../components/layout/ScreenLayout';
import type { CartStackParamList } from '../../navigation/stacks/CartStack';
import { colors } from '../../theme/colors';

type CheckoutScreenProps = NativeStackScreenProps<CartStackParamList, 'Checkout'>;

export default function CheckoutScreen({ route }: CheckoutScreenProps) {
  const { checkoutUrl } = route.params;
  const [isLoading, setIsLoading] = useState(true);

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
          style={{ flex: 1 }}
        />
      </View>
    </ScreenLayout>
  );
}
