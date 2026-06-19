import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useOverlay } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import { CUSTOMER_ORDERS_URL } from '../../services/shopify/customerAuth';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { closeOverlay } = useOverlay();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ScreenLayout showBack onBack={closeOverlay}>
      <View className="flex-1">
        {isLoading ? (
          <View className="absolute inset-0 z-10 items-center justify-center bg-white dark:bg-gray-950">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : null}
        <WebView
          source={{ uri: CUSTOMER_ORDERS_URL }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          originWhitelist={['https://*']}
          style={{ flex: 1, backgroundColor: colors.background }}
        />
      </View>
    </ScreenLayout>
  );
}
