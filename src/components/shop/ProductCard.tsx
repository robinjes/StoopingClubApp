import { useRef } from 'react';
import { Image, Text, View } from 'react-native';

import AddToCartButton from '../feedback/AddToCartButton';
import AnimatedPressable from '../feedback/AnimatedPressable';
import type { ShopifyProduct } from '../../types/shopify';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice } from '../../utils/formatPrice';

type ProductCardProps = {
  product: ShopifyProduct;
  onPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void | Promise<void>;
  isAdding?: boolean;
};

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
  isAdding = false,
}: ProductCardProps) {
  const { colors } = useTheme();
  const imageRef = useRef<View>(null);
  const imageUrl = product.images[0]?.url;
  const canAdd = Boolean(onAddToCart);

  return (
    <AnimatedPressable
      haptic="selection"
      pressedScale={0.98}
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:bg-gray-950"
      onPress={() => onPress?.(product)}
    >
      <View ref={imageRef} className="aspect-square w-full bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-xs text-gray-400">No image</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="text-sm font-medium leading-5 text-gray-900 dark:text-gray-100" numberOfLines={2}>
          {product.title}
        </Text>
        <View className="mt-2 flex-row items-end justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-semibold" style={{ color: colors.brand }}>
              {formatPrice(product.price)}
            </Text>
            {product.estRetailValue != null && product.estRetailValue > 0 ? (
              <Text className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                Est. retail {formatPrice({ amount: String(product.estRetailValue), currencyCode: 'USD' })}
              </Text>
            ) : null}
          </View>
          {canAdd && onAddToCart ? (
            <AddToCartButton
              product={product}
              onAdd={onAddToCart}
              isAdding={isAdding}
              sourceRef={imageRef}
              compact
              backgroundColor={colors.brand}
            />
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}
