import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import type { ShopifyCollection, ShopifyProduct } from '../../types/shopify';
import {
  filterProductsByCategory,
  getCategoryById,
  getCategoryProductCount,
} from '../../utils/categoryFilters';
import { filterProductsByLocation } from '../../utils/locationFilters';
import CollectionFilterBar from './CollectionFilterBar';
import CollectionFilterSheet, { type CollectionFilters } from './CollectionFilterSheet';
import ProductGrid from './ProductGrid';

type CollectionsViewProps = {
  collections: ShopifyCollection[];
  products: ShopifyProduct[];
  onProductPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void;
  addingProductId?: string | null;
};

export default function CollectionsView({
  collections,
  products,
  onProductPress,
  onAddToCart,
  addingProductId = null,
}: CollectionsViewProps) {
  const [filters, setFilters] = useState<CollectionFilters>({
    locationId: null,
    categoryId: null,
  });
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const { recentProductIds } = useRecentlyViewed();

  useEffect(() => {
    if (!filters.categoryId) {
      return;
    }

    const category = getCategoryById(filters.categoryId);
    if (!category) {
      setFilters((current) => ({ ...current, categoryId: null }));
      return;
    }

    const locationScopedProducts = filterProductsByLocation(products, filters.locationId);
    const count = getCategoryProductCount(
      locationScopedProducts,
      category,
      collections,
      recentProductIds,
    );

    if (count === 0) {
      setFilters((current) => ({ ...current, categoryId: null }));
    }
  }, [collections, filters.categoryId, filters.locationId, products, recentProductIds]);

  const filteredProducts = useMemo(() => {
    const locationFiltered = filterProductsByLocation(products, filters.locationId);

    if (!filters.categoryId) {
      return locationFiltered;
    }

    const category = getCategoryById(filters.categoryId);
    if (!category) {
      return locationFiltered;
    }

    return filterProductsByCategory(
      locationFiltered,
      category,
      collections,
      recentProductIds,
    );
  }, [collections, filters.categoryId, filters.locationId, products, recentProductIds]);

  const activeFilterCount =
    (filters.locationId ? 1 : 0) + (filters.categoryId ? 1 : 0);

  const header = (
    <View className="pb-2">
      <CollectionFilterBar
        filters={filters}
        activeCount={activeFilterCount}
        onPress={() => setFilterSheetVisible(true)}
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
