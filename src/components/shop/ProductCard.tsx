import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import { useWishlist } from '../../hooks/useWishlist';
import type { ShopifyProduct } from '../../types/shopify';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils/formatPrice';

type ProductCardProps = {
  product: ShopifyProduct;
  onPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void;
  isAdding?: boolean;
};

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
  isAdding = false,
}: ProductCardProps) {
  const imageUrl = product.images[0]?.url;
  const canAdd = Boolean(onAddToCart);
  const { isWishlisted, toggle } = useWishlist();
  const wished = isWishlisted(product.id);

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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white/90"
          onPress={(event) => {
            event.stopPropagation();
            void toggle(product.id);
          }}
        >
          <Ionicons
            name={wished ? 'heart' : 'heart-outline'}
            size={18}
            color={wished ? '#DC2626' : colors.textMuted}
          />
        </Pressable>
      </View>

      <View className="p-3">
        <Text className="text-sm font-medium leading-5 text-gray-900" numberOfLines={2}>
          {product.title}
        </Text>
        <View className="mt-2 flex-row items-center justify-between gap-2">
          <Text className="text-sm font-semibold" style={{ color: colors.brand }}>
            {formatPrice(product.price)}
          </Text>
          {canAdd ? (
            <Pressable
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: colors.brand }}
              disabled={isAdding}
              onPress={(event) => {
                event.stopPropagation();
                onAddToCart?.(product);
              }}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-xs font-semibold text-white">Add</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
