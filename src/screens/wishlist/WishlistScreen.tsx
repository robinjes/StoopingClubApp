import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import ProductGrid from '../../components/shop/ProductGrid';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useShopData } from '../../hooks/useShopData';
import { useWishlist } from '../../hooks/useWishlist';
import type { WishlistStackParamList } from '../../navigation/stacks/WishlistStack';
import { useProductStore } from '../../store/productStore';
import { useTheme } from '../../context/ThemeContext';
import type { ShopifyProduct } from '../../types/shopify';

type WishlistNavigation = NativeStackNavigationProp<WishlistStackParamList>;

export default function WishlistScreen() {
  const { colors } = useTheme();
  useShopData();

  const navigation = useNavigation<WishlistNavigation>();
  const { productIds } = useWishlist();
  const products = useProductStore((state) => state.products);
  const { handleAddToCart, addingProductId } = useAddToCart();

  const wishlistProducts = useMemo(
    () => products.filter((product) => productIds.includes(product.id)),
    [productIds, products],
  );

  const openProduct = useCallback(
    (product: ShopifyProduct) => {
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [navigation],
  );

  return (
    <ScreenLayout>
      <View className="flex-1" style={{ backgroundColor: colors.cream }}>
        <View className="px-4 pb-3 pt-4">
          <Text
            className="text-2xl text-brand"
            style={{ fontFamily: 'Georgia', color: colors.brand }}
          >
            Wishlist
          </Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {wishlistProducts.length === 0
              ? 'Save items you love with the heart icon.'
              : `${wishlistProducts.length} saved item${wishlistProducts.length === 1 ? '' : 's'}`}
          </Text>
        </View>

        {wishlistProducts.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
              Your wishlist is empty. Tap the heart on any product to save it here.
            </Text>
          </View>
        ) : (
          <ProductGrid
            products={wishlistProducts}
            onProductPress={openProduct}
            onAddToCart={handleAddToCart}
            addingProductId={addingProductId}
          />
        )}
      </View>
    </ScreenLayout>
  );
}
