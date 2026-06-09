import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { getCollections } from '../../api/collections';
import { getProducts } from '../../api/products';
import CollectionsView from '../../components/shop/CollectionsView';
import ProductGrid from '../../components/shop/ProductGrid';
import ShopModeSwitcher, { type ShopMode } from '../../components/shop/ShopModeSwitcher';
import StrollView from '../../components/shop/StrollView';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useCollectionStore } from '../../store/collectionStore';
import { useProductStore } from '../../store/productStore';
import { colors } from '../../theme/colors';

export default function ShopScreen() {
  const [mode, setMode] = useState<ShopMode>('grid');

  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const error = useProductStore((state) => state.error);
  const setProducts = useProductStore((state) => state.setProducts);
  const setLoading = useProductStore((state) => state.setLoading);
  const setError = useProductStore((state) => state.setError);

  const collections = useCollectionStore((state) => state.collections);
  const setCollections = useCollectionStore((state) => state.setCollections);

  useEffect(() => {
    let isMounted = true;

    async function loadShopData() {
      setLoading(true);
      setError(null);

      try {
        const [fetchedProducts, fetchedCollections] = await Promise.all([
          getProducts(),
          getCollections(),
        ]);

        if (!isMounted) {
          return;
        }

        setProducts(fetchedProducts);
        setCollections(fetchedCollections);

        if (fetchedProducts[0]) {
          console.log('First product:', fetchedProducts[0]);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Failed to load products.';
        setError(message);
        console.error('Failed to load shop data:', message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadShopData();

    return () => {
      isMounted = false;
    };
  }, [setProducts, setCollections, setLoading, setError]);

  const gridHeader = (
    <View className="pb-3">
      <Text
        className="text-2xl text-brand"
        style={{ fontFamily: 'Georgia', color: colors.brand }}
      >
        Grid
      </Text>
      <Text className="mt-1 text-sm text-gray-600">
        Default view. All inventory in a clean scrollable grid.
      </Text>
    </View>
  );

  return (
    <ScreenLayout>
      <View className="flex-1" style={{ backgroundColor: '#F7F4EE' }}>
        <ShopModeSwitcher mode={mode} onModeChange={setMode} />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brand} />
            <Text className="mt-3 text-sm text-gray-600">Loading inventory...</Text>
          </View>
        ) : null}

        {error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-sm text-red-600">{error}</Text>
          </View>
        ) : null}

        {!isLoading && !error && mode === 'grid' ? (
          <ProductGrid products={products} ListHeaderComponent={gridHeader} />
        ) : null}

        {!isLoading && !error && mode === 'collections' ? (
          <CollectionsView collections={collections} products={products} />
        ) : null}

        {!isLoading && !error && mode === 'stroll' ? (
          <StrollView products={products} />
        ) : null}
      </View>
    </ScreenLayout>
  );
}
