import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import CollectionsView from '../../components/shop/CollectionsView';
import ProductGrid from '../../components/shop/ProductGrid';
import ShopModeSwitcher, { type ShopMode } from '../../components/shop/ShopModeSwitcher';
import StrollView from '../../components/shop/StrollView';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useOpenProduct } from '../../hooks/useOpenProduct';
import { refreshShopData, useShopData } from '../../hooks/useShopData';
import { useCollectionStore } from '../../store/collectionStore';
import { useProductStore } from '../../store/productStore';
import { colors } from '../../theme/colors';
import { filterInStockProducts } from '../../utils/productStock';

export default function ShopScreen() {
  const [mode, setMode] = useState<ShopMode>('grid');

  useShopData();

  useFocusEffect(
    useCallback(() => {
      void refreshShopData();
    }, []),
  );

  const { handleAddToCart, addingProductId } = useAddToCart();
  const openProduct = useOpenProduct();

  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const isLoadingMore = useProductStore((state) => state.isLoadingMore);
  const error = useProductStore((state) => state.error);
  const collections = useCollectionStore((state) => state.collections);

  const inStockProducts = useMemo(() => filterInStockProducts(products), [products]);

  const showInitialLoader = isLoading && products.length === 0;

  return (
    <ScreenLayout>
      <View className="flex-1" style={{ backgroundColor: colors.cream }}>
        <ShopModeSwitcher mode={mode} onModeChange={setMode} />

        {showInitialLoader ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brand} />
            <Text className="mt-3 text-sm text-gray-600">Loading inventory...</Text>
          </View>
        ) : null}

        {error && products.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-sm text-red-600">{error}</Text>
          </View>
        ) : null}

        {!showInitialLoader && !(error && products.length === 0) ? (
          <View className="flex-1">
            {mode === 'grid' ? (
              <ProductGrid
                products={inStockProducts}
                onProductPress={openProduct}
                onAddToCart={handleAddToCart}
                addingProductId={addingProductId}
              />
            ) : null}
            {mode === 'collections' ? (
              <CollectionsView
                collections={collections}
                products={inStockProducts}
                onProductPress={openProduct}
                onAddToCart={handleAddToCart}
                addingProductId={addingProductId}
              />
            ) : null}
            {mode === 'stroll' ? (
              <StrollView
                products={inStockProducts}
                onProductPress={openProduct}
                onAddToCart={handleAddToCart}
                addingProductId={addingProductId}
              />
            ) : null}

            {isLoadingMore ? (
              <View className="items-center py-3">
                <ActivityIndicator size="small" color={colors.brand} />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
}
