import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { usePageRetailEnrichment } from '../../hooks/usePageRetailEnrichment';
import type { ShopifyCollection, ShopifyProduct } from '../../types/shopify';
import {
  DEFAULT_GRID_FILTERS,
  applyGridFilters,
  gridSortProducts,
  type GridFilters,
  type GridSortOption,
} from '../../utils/shopFilters';
import GridFilterSheet from './GridFilterSheet';
import GridSortFilterBar from './GridSortFilterBar';
import GridSortSheet from './GridSortSheet';
import ProductGrid from './ProductGrid';

const PAGE_SIZE = 24;

type GridViewProps = {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  onProductPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void | Promise<void>;
  addingProductId?: string | null;
  emptyMessage?: string;
};

export default function GridView({
  products,
  collections,
  onProductPress,
  onAddToCart,
  addingProductId = null,
  emptyMessage,
}: GridViewProps) {
  const { recentProductIds } = useRecentlyViewed();
  const [sort, setSort] = useState<GridSortOption>('recently-added');
  const [filters, setFilters] = useState<GridFilters>(DEFAULT_GRID_FILTERS);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [page, setPage] = useState(1);

  const displayedProducts = useMemo(() => {
    const filtered = applyGridFilters(products, filters, collections, recentProductIds);
    return gridSortProducts(filtered, sort);
  }, [collections, filters, products, recentProductIds, sort]);

  const totalPages = Math.max(1, Math.ceil(displayedProducts.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [sort, filters, products]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return displayedProducts.slice(start, start + PAGE_SIZE);
  }, [displayedProducts, page]);

  usePageRetailEnrichment(pageProducts);

  return (
    <View className="flex-1">
      <GridSortFilterBar
        itemCount={displayedProducts.length}
        sort={sort}
        filters={filters}
        onSortPress={() => setSortSheetVisible(true)}
        onFilterPress={() => setFilterSheetVisible(true)}
        onClearFilters={() => setFilters(DEFAULT_GRID_FILTERS)}
      />

      <ProductGrid
        products={pageProducts}
        onProductPress={onProductPress}
        onAddToCart={onAddToCart}
        addingProductId={addingProductId}
        emptyMessage={emptyMessage ?? 'No items match your filters.'}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <GridSortSheet
        visible={sortSheetVisible}
        sort={sort}
        onClose={() => setSortSheetVisible(false)}
        onSelect={setSort}
      />

      <GridFilterSheet
        visible={filterSheetVisible}
        products={products}
        collections={collections}
        recentProductIds={recentProductIds}
        filters={filters}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilters}
      />
    </View>
  );
}
