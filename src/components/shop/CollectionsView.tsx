import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import type { ShopifyCollection, ShopifyProduct } from '../../types/shopify';
import {
  filterProductsByCategories,
  getCategoryById,
  getCategoryProductCount,
} from '../../utils/categoryFilters';
import { filterProductsByLocations } from '../../utils/locationFilters';
import CollectionFilterBar from './CollectionFilterBar';
import CollectionFilterSheet, {
  EMPTY_COLLECTION_FILTERS,
  type CollectionFilters,
} from './CollectionFilterSheet';
import ProductGrid from './ProductGrid';

type CollectionsViewProps = {
  collections: ShopifyCollection[];
  products: ShopifyProduct[];
  initialCategoryId?: string | null;
  onProductPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void;
  addingProductId?: string | null;
  emptyMessage?: string;
};

export default function CollectionsView({
  collections,
  products,
  initialCategoryId = null,
  onProductPress,
  onAddToCart,
  addingProductId = null,
  emptyMessage,
}: CollectionsViewProps) {
  const [filters, setFilters] = useState<CollectionFilters>({
    locationIds: [],
    categoryIds: initialCategoryId ? [initialCategoryId] : [],
  });
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const { recentProductIds } = useRecentlyViewed();

  useEffect(() => {
    if (initialCategoryId) {
      setFilters((current) => ({ ...current, categoryIds: [initialCategoryId] }));
    }
  }, [initialCategoryId]);

  useEffect(() => {
    setFilters((current) => {
      const validCategoryIds = current.categoryIds.filter((categoryId) => {
        const category = getCategoryById(categoryId);
        if (!category) {
          return false;
        }

        const locationScopedProducts = filterProductsByLocations(products, current.locationIds);
        return (
          getCategoryProductCount(
            locationScopedProducts,
            category,
            collections,
            recentProductIds,
          ) > 0
        );
      });

      if (
        validCategoryIds.length === current.categoryIds.length &&
        validCategoryIds.every((id, index) => id === current.categoryIds[index])
      ) {
        return current;
      }

      return { ...current, categoryIds: validCategoryIds };
    });
  }, [collections, filters.locationIds, filters.categoryIds, products, recentProductIds]);

  const filteredProducts = useMemo(() => {
    const locationFiltered = filterProductsByLocations(products, filters.locationIds);

    return filterProductsByCategories(
      locationFiltered,
      filters.categoryIds,
      collections,
      recentProductIds,
    );
  }, [collections, filters.categoryIds, filters.locationIds, products, recentProductIds]);

  const activeFilterCount = filters.locationIds.length + filters.categoryIds.length;

  const header = (
    <View className="pb-2">
      <CollectionFilterBar
        filters={filters}
        activeCount={activeFilterCount}
        onPress={() => setFilterSheetVisible(true)}
        onClear={() => setFilters(EMPTY_COLLECTION_FILTERS)}
      />
    </View>
  );

  return (
    <>
      <ProductGrid
        products={filteredProducts}
        ListHeaderComponent={header}
        onAddToCart={onAddToCart}
        addingProductId={addingProductId}
        onProductPress={onProductPress}
        emptyMessage={emptyMessage}
      />

      <CollectionFilterSheet
        visible={filterSheetVisible}
        products={products}
        collections={collections}
        recentProductIds={recentProductIds}
        filters={filters}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilters}
      />
    </>
  );
}
