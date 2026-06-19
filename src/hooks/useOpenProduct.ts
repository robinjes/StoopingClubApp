import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import type { ShopStackParamList } from '../navigation/stacks/ShopStack';
import type { ShopifyProduct } from '../types/shopify';

type ShopNavigation = NativeStackNavigationProp<ShopStackParamList>;

export function useOpenProduct() {
  const navigation = useNavigation<ShopNavigation>();

  return useCallback(
    (product: ShopifyProduct) => {
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [navigation],
  );
}
