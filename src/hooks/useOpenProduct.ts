import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import type { ShopStackParamList } from '../navigation/stacks/ShopStack';
import type { ShopifyProduct } from '../types/shopify';
import { useRecentlyViewed } from './useRecentlyViewed';

type ShopNavigation = NativeStackNavigationProp<ShopStackParamList>;

export function useOpenProduct() {
  const navigation = useNavigation<ShopNavigation>();
  const { trackProductView } = useRecentlyViewed();

  return useCallback(
    (product: ShopifyProduct) => {
      void trackProductView(product.id);
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [navigation, trackProductView],
  );
}
