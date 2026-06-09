import { Image, Pressable, Text, View } from 'react-native';

import type { ShopifyProduct } from '../../types/shopify';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils/formatPrice';

type ProductCardProps = {
  product: ShopifyProduct;
  onPress?: (product: ShopifyProduct) => void;
};

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const imageUrl = product.images[0]?.url;
  const isSoldOut = product.inventoryQuantity <= 0;

  return (
    <Pressable
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
      onPress={() => onPress?.(product)}
    >
      <View className="aspect-square w-full bg-gray-100">
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-xs text-gray-400">No image</Text>
          </View>
        )}
        {isSoldOut ? (
          <View className="absolute left-2 top-2 rounded-full bg-gray-900/80 px-2 py-1">
            <Text className="text-[10px] font-semibold uppercase text-white">Sold out</Text>
          </View>
        ) : null}
      </View>

      <View className="p-3">
        <Text className="text-sm font-medium leading-5 text-gray-900" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="mt-1 text-sm font-semibold" style={{ color: colors.brand }}>
          {formatPrice(product.price)}
        </Text>
      </View>
    </Pressable>
  );
}
