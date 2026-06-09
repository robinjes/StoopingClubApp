import type { ReactElement } from 'react';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';

import type { ShopifyProduct } from '../../types/shopify';
import ProductCard from './ProductCard';

type ProductGridProps = {
  products: ShopifyProduct[];
  onProductPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void;
  addingProductId?: string | null;
  ListHeaderComponent?: ReactElement | null;
};

export default function ProductGrid({
  products,
  onProductPress,
  onAddToCart,
  addingProductId = null,
  ListHeaderComponent,
}: ProductGridProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 12) / 2;

  if (products.length === 0 && !ListHeaderComponent) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-sm text-gray-500">No in-stock products to show yet.</Text>
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
      ListHeaderComponent={
        ListHeaderComponent ? (
          <View>
            {ListHeaderComponent}
            {products.length === 0 ? (
              <Text className="px-4 pb-6 text-center text-sm text-gray-500">
                No in-stock products in this category yet.
              </Text>
            ) : null}
          </View>
        ) : undefined
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
