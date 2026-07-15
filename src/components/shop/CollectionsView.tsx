import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { useOpenProduct } from '../../hooks/useOpenProduct';
import { useAddToCart } from '../../hooks/useAddToCart';
import type { ShopCategoryDefinition } from '../../data/shopCategories';
import type { ShopifyCollection, ShopifyProduct } from '../../types/shopify';
import { useTheme } from '../../context/ThemeContext';
import {
  filterProductsByCategory,
  getTopLevelCategories,
} from '../../utils/categoryFilters';
import { getCategoryIcon } from '../../data/categoryIcons';
import ProductGrid from './ProductGrid';

type CollectionsViewProps = {
  collections: ShopifyCollection[];
  products: ShopifyProduct[];
  initialCategoryId?: string | null;
};

type CollectionCard = {
  category: ShopCategoryDefinition;
  count: number;
  imageUrl: string | null;
};

function resolveCollectionImage(
  category: ShopCategoryDefinition,
  collections: ShopifyCollection[],
  categoryProducts: ShopifyProduct[],
): string | null {
  for (const handle of category.collectionHandles ?? []) {
    const collection = collections.find((item) => item.handle === handle);
    if (collection?.image?.url) {
      return collection.image.url;
    }
  }

  return categoryProducts[0]?.images[0]?.url ?? null;
}

export default function CollectionsView({
  collections,
  products,
  initialCategoryId = null,
}: CollectionsViewProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { recentProductIds } = useRecentlyViewed();
  const openProduct = useOpenProduct();
  const { handleAddToCart, addingProductId } = useAddToCart();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  const cards = useMemo(() => {
    const result: CollectionCard[] = [];

    for (const category of getTopLevelCategories()) {
      if (category.special === 'uncategorized') {
        continue;
      }

      const categoryProducts = filterProductsByCategory(
        products,
        category,
        collections,
        recentProductIds,
      );
      const count = categoryProducts.length;
      if (count === 0) {
        continue;
      }

      result.push({
        category,
        count,
        imageUrl: resolveCollectionImage(category, collections, categoryProducts),
      });
    }

    return result;
  }, [collections, products, recentProductIds]);

  const selectedCategory = useMemo(
    () => cards.find((card) => card.category.id === selectedCategoryId)?.category ?? null,
    [cards, selectedCategoryId],
  );

  const selectedProducts = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return filterProductsByCategory(products, selectedCategory, collections, recentProductIds);
  }, [collections, products, recentProductIds, selectedCategory]);

  const PAGE_SIZE = 24;
  const totalPages = Math.max(1, Math.ceil(selectedProducts.length / PAGE_SIZE));
  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return selectedProducts.slice(start, start + PAGE_SIZE);
  }, [page, selectedProducts]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId]);

  const cardWidth = (width - 32 - 12) / 2;

  if (selectedCategory) {
    return (
      <View className="flex-1">
        <View className="flex-row items-center gap-2 px-4 pb-3 pt-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to collections"
            onPress={() => setSelectedCategoryId(null)}
            className="flex-row items-center gap-1 rounded-full px-2 py-1"
          >
            <Ionicons name="chevron-back" size={18} color={colors.brand} />
            <Text className="text-sm font-semibold" style={{ color: colors.brand }}>
              Collections
            </Text>
          </Pressable>
          <Text className="flex-1 text-right text-sm font-medium" style={{ color: colors.text }}>
            {selectedCategory.label} · {selectedProducts.length}
          </Text>
        </View>

        <ProductGrid
          products={pageProducts}
          onProductPress={openProduct}
          onAddToCart={handleAddToCart}
          addingProductId={addingProductId}
          emptyMessage="No in-stock products in this collection yet."
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={cards}
      keyExtractor={(item) => item.category.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-3 px-4 pb-8 pt-1"
      columnWrapperClassName="gap-3"
      ListHeaderComponent={
        <Text className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {cards.length} collection{cards.length === 1 ? '' : 's'}
        </Text>
      }
      ListEmptyComponent={
        <View className="items-center px-6 py-12">
          <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
            No collections with in-stock items yet.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.category.label}, ${item.count} items`}
          onPress={() => setSelectedCategoryId(item.category.id)}
          style={{ width: cardWidth }}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950"
        >
          <View className="aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800">
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Ionicons
                  name={getCategoryIcon(item.category.id)}
                  size={36}
                  color={colors.brand}
                />
              </View>
            )}
          </View>
          <View className="px-3 py-3">
            <Text
              className="text-sm font-semibold leading-5"
              style={{ color: colors.text }}
              numberOfLines={2}
            >
              {item.category.label}
            </Text>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {item.count} item{item.count === 1 ? '' : 's'}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}
