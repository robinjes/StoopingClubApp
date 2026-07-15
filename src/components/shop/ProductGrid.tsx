import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import type { ShopifyProduct } from '../../types/shopify';
import ProductCard from './ProductCard';

type ProductGridProps = {
  products: ShopifyProduct[];
  onProductPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void | Promise<void>;
  addingProductId?: string | null;
  emptyMessage?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

export default function ProductGrid({
  products,
  onProductPress,
  onAddToCart,
  addingProductId = null,
  emptyMessage,
  page = 1,
  totalPages = 1,
  onPageChange,
}: ProductGridProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 12) / 2;
  const showPager = Boolean(onPageChange) && totalPages > 1;

  if (products.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
          {emptyMessage ?? 'No in-stock products to show yet.'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-3 px-4 pb-8"
      columnWrapperClassName="gap-3"
      ListFooterComponent={
        showPager ? (
          <View className="mt-4 flex-row items-center justify-center gap-4 pb-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous page"
              disabled={page <= 1}
              onPress={() => onPageChange?.(page - 1)}
              className="h-10 w-10 items-center justify-center rounded-full border"
              style={{
                borderColor: colors.border,
                opacity: page <= 1 ? 0.35 : 1,
                backgroundColor: colors.background,
              }}
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Pressable>

            <Text className="text-sm font-medium" style={{ color: colors.text }}>
              Page {page} of {totalPages}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next page"
              disabled={page >= totalPages}
              onPress={() => onPageChange?.(page + 1)}
              className="h-10 w-10 items-center justify-center rounded-full border"
              style={{
                borderColor: colors.border,
                opacity: page >= totalPages ? 0.35 : 1,
                backgroundColor: colors.background,
              }}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </Pressable>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          <ProductCard
            product={item}
            onPress={onProductPress}
            onAddToCart={onAddToCart}
            isAdding={addingProductId === item.id}
          />
        </View>
      )}
    />
  );
}
