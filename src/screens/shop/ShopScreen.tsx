import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import CollectionsView from '../../components/shop/CollectionsView';
import ProductGrid from '../../components/shop/ProductGrid';
import ShopModeSwitcher, { type ShopMode } from '../../components/shop/ShopModeSwitcher';
import ShopReminderBar from '../../components/shop/ShopReminderBar';
import ShopSearchBar from '../../components/shop/ShopSearchBar';
import StrollView from '../../components/shop/StrollView';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useOpenProduct } from '../../hooks/useOpenProduct';
import { refreshShopData, useShopData } from '../../hooks/useShopData';
import { useCollectionStore } from '../../store/collectionStore';
import { useProductStore } from '../../store/productStore';
import { useTheme } from '../../context/ThemeContext';
import { filterInStockProducts } from '../../utils/productStock';
import { hasActiveSearch, searchProducts } from '../../utils/shopFilters';

export default function ShopScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<ShopMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

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
  const searchedProducts = useMemo(
    () => searchProducts(inStockProducts, searchQuery),
    [inStockProducts, searchQuery],
  );
  const isSearching = hasActiveSearch(searchQuery);

  const showInitialLoader = isLoading && products.length === 0;

  return (
    <ScreenLayout>
      <View className="flex-1" style={{ backgroundColor: colors.cream }}>
        <ShopReminderBar />

        <View className="px-4 pb-1 pt-4">
          <ShopSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            resultCount={isSearching ? searchedProducts.length : undefined}
          />
        </View>

        <ShopModeSwitcher mode={mode} onModeChange={setMode} />

        {showInitialLoader ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brand} />
            <Text className="mt-3 text-sm text-gray-600 dark:text-gray-400">Loading inventory...</Text>
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
                products={searchedProducts}
                onProductPress={openProduct}
                onAddToCart={handleAddToCart}
                addingProductId={addingProductId}
                emptyMessage={
                  isSearching
                    ? 'No items match that search. Try a shorter phrase or check spelling.'
                    : undefined
                }
              />
            ) : null}
            {mode === 'collections' ? (
              <CollectionsView
                collections={collections}
                products={searchedProducts}
                onProductPress={openProduct}
                onAddToCart={handleAddToCart}
                addingProductId={addingProductId}
                emptyMessage={
                  isSearching
                    ? 'No items match that search in this collection.'
                    : undefined
                }
              />
            ) : null}
            {mode === 'stroll' ? (
              <StrollView
                products={searchedProducts}
                onProductPress={openProduct}
                onAddToCart={handleAddToCart}
                addingProductId={addingProductId}
                emptyMessage={
                  isSearching
                    ? 'No items match that search for a stroll.'
                    : undefined
                }
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
