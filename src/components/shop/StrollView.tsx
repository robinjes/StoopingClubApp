import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import { useWishlist } from '../../hooks/useWishlist';
import type { ShopifyProduct } from '../../types/shopify';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils/formatPrice';
import { getOriginStory } from '../../utils/productText';

type StrollViewProps = {
  products: ShopifyProduct[];
  onProductPress?: (product: ShopifyProduct) => void;
  onAddToCart?: (product: ShopifyProduct) => void;
  addingProductId?: string | null;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const STROLL_HEIGHT = SCREEN_HEIGHT * 0.62;

function shuffleProducts(items: ShopifyProduct[]): ShopifyProduct[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export default function StrollView({
  products,
  onProductPress,
  onAddToCart,
  addingProductId = null,
}: StrollViewProps) {
  const { isWishlisted, toggle } = useWishlist();
  const strollProducts = useMemo(() => shuffleProducts(products), [products]);

  if (strollProducts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-sm text-gray-500">No items to stroll through yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={strollProducts}
      keyExtractor={(item) => item.id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={STROLL_HEIGHT}
      snapToAlignment="start"
      contentContainerClassName="pb-8"
      renderItem={({ item }) => {
        const imageUrl = item.images[0]?.url;
        const isSoldOut = item.inventoryQuantity <= 0;
        const isAdding = addingProductId === item.id;
        const wished = isWishlisted(item.id);

        return (
          <View style={{ height: STROLL_HEIGHT }} className="px-4 pb-4">
            <Pressable
              className="flex-1 overflow-hidden rounded-3xl border border-gray-100 bg-white"
              onPress={() => onProductPress?.(item)}
            >
              <View className="relative flex-1 bg-gray-100">
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
                ) : (
                  <View className="h-full w-full items-center justify-center">
                    <Text className="text-sm text-gray-400">No image</Text>
                  </View>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white/95"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.12,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                  onPress={(event) => {
                    event.stopPropagation();
                    void toggle(item.id);
                  }}
                >
                  <Ionicons
                    name={wished ? 'heart' : 'heart-outline'}
                    size={20}
                    color={wished ? '#DC2626' : colors.textMuted}
                  />
                </Pressable>
              </View>

              <View className="p-5">
                <Text
                  className="text-2xl text-brand"
                  style={{ fontFamily: 'Georgia', color: colors.brand }}
                >
                  {item.title}
                </Text>
                <Text className="mt-2 text-sm leading-5 text-gray-600">
                  {getOriginStory(item.description)}
                </Text>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-lg font-semibold" style={{ color: colors.brand }}>
                    {formatPrice(item.price)}
                  </Text>
                  {!isSoldOut && onAddToCart ? (
                    <Pressable
                      className="rounded-full px-5 py-2.5"
                      style={{ backgroundColor: colors.brand }}
                      disabled={isAdding}
                      onPress={(event) => {
                        event.stopPropagation();
                        onAddToCart(item);
                      }}
                    >
                      {isAdding ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text className="text-sm font-semibold text-white">Add to cart</Text>
                      )}
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </Pressable>
          </View>
        );
      }}
    />
  );
}
