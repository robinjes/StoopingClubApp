import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { useFeedback } from '../context/FeedbackContext';
import type { ShopStackParamList } from '../navigation/stacks/ShopStack';
import type { ShopifyProduct } from '../types/shopify';

type ShopNavigation = NativeStackNavigationProp<ShopStackParamList>;

export function useOpenProduct(options?: { hapticOnOpen?: boolean }) {
  const navigation = useNavigation<ShopNavigation>();
  const { haptic } = useFeedback();

  return useCallback(
    (product: ShopifyProduct) => {
      if (options?.hapticOnOpen) {
        haptic('selection');
      }
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [haptic, navigation, options?.hapticOnOpen],
  );
}
