import { useMemo, useState } from 'react';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';

import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import type { ShopifyCollection, ShopifyProduct } from '../../types/shopify';
import {
  filterProductsByCategory,
  getCategoryById,
} from '../../utils/categoryFilters';
import { filterProductsBySearch, sortProducts } from '../../utils/shopFilters';
import CategoryList from './CategoryList';
import ProductCard from './ProductCard';
import ShopSearchBar from './ShopSearchBar';
import ShopToolbar, { type ShopSortOption } from './ShopToolbar';

type ShopCatalogViewProps = {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  onProductPress?: (product: ShopifyProduct) => void;
  onStrollPress?: () => void;
};

export default function ShopCatalogView({
  products,
  collections,
  onProductPress,
  onStrollPress,
}: ShopCatalogViewProps) {
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState<ShopSortOption>('latest');
  const { recentProductIds } = useRecentlyViewed();

  const isWideLayout = width >= 768;
  const cardWidth = isWideLayout ? (width - 320 - 48) / 2 : (width - 32 - 12) / 2;

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategoryId) {
      const category = getCategoryById(selectedCategoryId);
      if (category) {
        result = filterProductsByCategory(result, category, collections, recentProductIds);
      }
    }

    result = filterProductsBySearch(result, searchQuery);
    return sortProducts(result, sort);
  }, [collections, products, recentProductIds, searchQuery, selectedCategoryId, sort]);

  const sidebar = (
    <View
      className="bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text className="mb-3 text-sm font-medium text-gray-900">Search</Text>
      <ShopSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <View className="mt-5">
        <CategoryList
          products={products}
          collections={collections}
          selectedId={selectedCategoryId}
          recentProductIds={recentProductIds}
          onSelect={setSelectedCategoryId}
        />
      </View>
    </View>
  );

  const listHeader = (
    <View>
      {!isWideLayout ? <View className="mb-4 px-4">{sidebar}</View> : null}
      <ShopToolbar
        totalCount={filteredProducts.length}
        visibleCount={filteredProducts.length}
        sort={sort}
        onSortChange={setSort}
        onStrollPress={onStrollPress}
      />
      {filteredProducts.length === 0 ? (
        <Text className="px-4 py-8 text-center text-sm text-gray-500">
          No products match your search or category.
        </Text>
      ) : null}
    </View>
  );

  if (isWideLayout) {
    return (
      <View className="flex-1 flex-row">
        <View style={{ width: 300 }} className="border-r border-gray-100 bg-white">
          {sidebar}
        </View>
        <View className="flex-1">
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3 px-4 pb-8"
            columnWrapperClassName="gap-3"
            ListHeaderComponent={listHeader}
            renderItem={({ item }) => (
              <View style={{ width: cardWidth }}>
                <ProductCard product={item} onPress={onProductPress} />
              </View>
            )}
          />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredProducts}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-3 px-4 pb-8"
      columnWrapperClassName="gap-3"
      ListHeaderComponent={listHeader}
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          <ProductCard product={item} onPress={onProductPress} />
        </View>
      )}
    />
  );
}
