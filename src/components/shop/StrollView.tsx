import { useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  View,
} from 'react-native';

import type { ShopifyProduct } from '../../types/shopify';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils/formatPrice';
import { getOriginStory } from '../../utils/productText';

type StrollViewProps = {
  products: ShopifyProduct[];
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

export default function StrollView({ products }: StrollViewProps) {
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

        return (
          <View style={{ height: STROLL_HEIGHT }} className="px-4 pb-4">
            <View className="flex-1 overflow-hidden rounded-3xl border border-gray-100 bg-white">
              <View className="flex-1 bg-gray-100">
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
                ) : (
                  <View className="h-full w-full items-center justify-center">
                    <Text className="text-sm text-gray-400">No image</Text>
                  </View>
                )}
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
                <Text className="mt-3 text-lg font-semibold" style={{ color: colors.brand }}>
                  {formatPrice(item.price)}
                </Text>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}
